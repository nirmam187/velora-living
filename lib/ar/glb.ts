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

export interface QuadModel {
  /** Rug width in metres — the short side, laid along X. */
  widthM: number
  /** Rug length in metres — the long side, laid along Z. */
  lengthM: number
  /** The flattened photograph, as JPEG bytes. Embedded in the file. */
  texture: Uint8Array
  /** Name recorded on the mesh and node. */
  name: string
}

/**
 * The rug lies in the XZ plane with +Y up, which is what glTF and every AR runtime
 * expect of something that sits on the floor. It is drawn double-sided so a customer
 * crouching to look along the pile does not see straight through it.
 */
export function buildGlb({ widthM, lengthM, texture, name }: QuadModel): Uint8Array {
  const halfW = widthM / 2
  const halfL = lengthM / 2

  // Four corners, counter-clockwise seen from above.
  const positions = [
    [-halfW, 0, halfL],
    [halfW, 0, halfL],
    [halfW, 0, -halfL],
    [-halfW, 0, -halfL],
  ]
  const normals = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ]
  // glTF's texture origin is the TOP-left, so v runs down the image as z runs away
  // from the viewer. (USD numbers this axis the other way round — see usdz.ts.)
  const uvs = [
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ]
  const indices = [0, 1, 2, 0, 2, 3]

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
        count: 4,
        type: 'VEC3',
        min: [-halfW, 0, -halfL],
        max: [halfW, 0, halfL],
      },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 4, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
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
