/**
 * Writes a binary glTF for one rug: a flat quad with the rug's photograph on it.
 *
 * This is a port of `build_glb` in scripts/ar/build_models.py, kept deliberately close
 * to it so the two can be diffed byte for byte when either changes. The Python version
 * is still the reference for building a texture; this one exists because the models
 * themselves are now generated per request (see app/ar/[file]/route.ts) rather than
 * committed, which is what lets any rug be shown at any of the nine sizes without
 * keeping two thousand files in the repository.
 *
 * A rug is the easiest 3D object there is — four vertices and a photograph — so glTF
 * is assembled here by hand rather than through a library. The format is JSON plus a
 * binary blob; the whole of it is below.
 */

/** glTF requires every chunk and buffer view to start on a 4-byte boundary. */
function pad(length: number, alignment = 4): number {
  const remainder = length % alignment
  return remainder === 0 ? 0 : alignment - remainder
}

export type RugShape = 'rect' | 'ellipse'

/**
 * How many segments an elliptical rug's rim is drawn with.
 *
 * The rim is the whole silhouette of a round rug, so this is the number that decides
 * whether it reads as an oval or as a polygon on someone's floor. 96 puts a vertex
 * every 3.75 degrees — on a 12 ft rug that is a chord sagging under 3 mm from the true
 * curve, well below what a phone camera resolves at room distance. The cost is 97
 * vertices, which against a 250 kB texture is nothing.
 */
export const RIM_SEGMENTS = 96

export interface QuadModel {
  /** Rug width in metres — the short side, laid along X. */
  widthM: number
  /** Rug length in metres — the long side, laid along Z. */
  lengthM: number
  /** The flattened photograph, as JPEG bytes. Embedded in the file. */
  texture: Uint8Array
  /** Name recorded on the mesh and node. */
  name: string
  /** Rectangle by default; 'ellipse' for the round and oval rugs. */
  shape?: RugShape
}

/**
 * The mesh for a rug, in whichever shape it is.
 *
 * BOTH SHAPES SHARE ONE TEXTURE MAPPING, and that is what makes this simple: u depends
 * only on x and v only on z, linearly. Because the map is affine, it does not matter how
 * a renderer triangulates the polygon — every triangulation gives the same picture — and
 * an oval rug is just the rectangle's inscribed ellipse sampling the same texture. The
 * flattener puts the rug exactly there (see --shape ellipse in scripts/ar/flatten.py), so
 * the background left in the texture's corners is never sampled.
 */
function mesh(halfW: number, halfL: number, shape: RugShape) {
  if (shape === 'rect') {
    return {
      positions: [
        [-halfW, 0, halfL],
        [halfW, 0, halfL],
        [halfW, 0, -halfL],
        [-halfW, 0, -halfL],
      ],
      // glTF's texture origin is the TOP-left, so v runs down the image as z runs away
      // from the viewer. (USD numbers this axis the other way round — see usdz.ts.)
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
      indices: [0, 1, 2, 0, 2, 3],
    }
  }

  // A triangle fan: the centre, then the rim. The centre vertex is what keeps every
  // triangle thin and well-shaped; fanning from a rim vertex instead would give slivers
  // on the far side that shade badly under a moving light.
  const positions: number[][] = [[0, 0, 0]]
  const uvs: number[][] = [[0.5, 0.5]]
  for (let i = 0; i < RIM_SEGMENTS; i++) {
    const angle = (i / RIM_SEGMENTS) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    positions.push([halfW * cos, 0, halfL * sin])
    uvs.push([0.5 + 0.5 * cos, 0.5 + 0.5 * sin])
  }
  const indices: number[] = []
  for (let i = 1; i <= RIM_SEGMENTS; i++) {
    indices.push(0, i, i === RIM_SEGMENTS ? 1 : i + 1)
  }
  return { positions, uvs, indices }
}

/**
 * The rug lies in the XZ plane with +Y up, which is what glTF and every AR runtime
 * expect of something that sits on the floor. It is drawn double-sided so a customer
 * crouching to look along the pile does not see straight through it.
 */
export function buildGlb({
  widthM,
  lengthM,
  texture,
  name,
  shape = 'rect',
}: QuadModel): Uint8Array {
  const halfW = widthM / 2
  const halfL = lengthM / 2

  const { positions, uvs, indices } = mesh(halfW, halfL, shape)
  const normals = positions.map(() => [0, 1, 0])

  const f32 = (rows: number[][]) => {
    const out = new Uint8Array(rows.length * rows[0]!.length * 4)
    const view = new DataView(out.buffer)
    let offset = 0
    for (const row of rows) {
      for (const value of row) {
        view.setFloat32(offset, value, true)
        offset += 4
      }
    }
    return out
  }

  const positionBytes = f32(positions)
  const normalBytes = f32(normals)
  const uvBytes = f32(uvs)
  const indexBytes = new Uint8Array(indices.length * 2)
  const indexView = new DataView(indexBytes.buffer)
  indices.forEach((index, i) => indexView.setUint16(i * 2, index, true))

  const ARRAY_BUFFER = 34962
  const ELEMENT_ARRAY_BUFFER = 34963

  const payloads: { bytes: Uint8Array; target?: number }[] = [
    { bytes: positionBytes, target: ARRAY_BUFFER },
    { bytes: normalBytes, target: ARRAY_BUFFER },
    { bytes: uvBytes, target: ARRAY_BUFFER },
    { bytes: indexBytes, target: ELEMENT_ARRAY_BUFFER },
    { bytes: texture },
  ]

  const views: { buffer: number; byteOffset: number; byteLength: number; target?: number }[] = []
  const chunks: Uint8Array[] = []
  let blobLength = 0
  for (const { bytes, target } of payloads) {
    const padding = pad(blobLength)
    if (padding) {
      chunks.push(new Uint8Array(padding))
      blobLength += padding
    }
    const view: (typeof views)[number] = {
      buffer: 0,
      byteOffset: blobLength,
      byteLength: bytes.length,
    }
    if (target) view.target = target
    views.push(view)
    chunks.push(bytes)
    blobLength += bytes.length
  }

  const gltf = {
    asset: { version: '2.0', generator: 'Velora Living rug builder' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        name,
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: 'Rug',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          // Wool is not metal, and it scatters rather than reflects. A low roughness
          // here would put a sheen on the rug that no rug has.
          metallicFactor: 0,
          roughnessFactor: 0.95,
        },
        doubleSided: true,
      },
    ],
    textures: [{ source: 0, sampler: 0 }],
    images: [{ bufferView: 4, mimeType: 'image/jpeg' }],
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length,
        type: 'VEC3',
        min: [-halfW, 0, -halfL],
        max: [halfW, 0, halfL],
      },
      { bufferView: 1, componentType: 5126, count: normals.length, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: uvs.length, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: indices.length, type: 'SCALAR' },
    ],
    bufferViews: views,
    buffers: [{ byteLength: blobLength }],
  }

  const encoder = new TextEncoder()
  const jsonBytes = encoder.encode(JSON.stringify(gltf))
  // The JSON chunk is padded with spaces rather than nulls, so it stays parseable.
  const jsonPadding = pad(jsonBytes.length)
  const jsonChunk = new Uint8Array(jsonBytes.length + jsonPadding)
  jsonChunk.set(jsonBytes)
  jsonChunk.fill(0x20, jsonBytes.length)

  const binPadding = pad(blobLength)
  const binChunk = new Uint8Array(blobLength + binPadding)
  let cursor = 0
  for (const chunk of chunks) {
    binChunk.set(chunk, cursor)
    cursor += chunk.length
  }

  const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)
  view.setUint32(0, 0x46546c67, true) // "glTF"
  view.setUint32(4, 2, true)
  view.setUint32(8, total, true)
  view.setUint32(12, jsonChunk.length, true)
  view.setUint32(16, 0x4e4f534a, true) // "JSON"
  out.set(jsonChunk, 20)
  const binHeader = 20 + jsonChunk.length
  view.setUint32(binHeader, binChunk.length, true)
  view.setUint32(binHeader + 4, 0x004e4942, true) // "BIN\0"
  out.set(binChunk, binHeader + 8)
  return out
}
