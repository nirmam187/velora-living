/**
 * Writes a USDZ for AR Quick Look — the only route Safari offers for putting a rug on
 * an iPhone user's floor.
 *
 * The Python pipeline shells out to Apple's `usdzip` for this. That is not available in
 * a serverless function, so the archive is written here directly. It is less alarming
 * than it sounds: USDZ is a zip file with three rules, and it is the rules rather than
 * the zipping that matter.
 *
 *   1. NOTHING IS COMPRESSED. Every entry is stored. Quick Look memory-maps the
 *      archive and reads the texture in place, so a deflated file is simply not
 *      readable to it.
 *   2. EVERY FILE'S DATA STARTS ON A 64-BYTE BOUNDARY, which is what makes that
 *      memory-mapping legal. Alignment is bought with padding in each local header's
 *      extra field, since that is the one place a zip allows free space before data.
 *   3. THE FIRST ENTRY IS THE .usda. Quick Look opens whatever comes first and treats
 *      it as the scene; put the texture first and you get an error, not a rug.
 *
 * Everything else here is an ordinary zip: local headers, a central directory, an
 * end-of-central-directory record. Output is checked against `usdchecker --arkit` in
 * scripts/ar/check_route.mjs.
 */

import { RIM_SEGMENTS, type RugShape } from './glb'

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/**
 * The scene. One mesh, one UsdPreviewSurface, the texture read through a UV reader.
 *
 * Note the texture coordinates against glb.ts: USD's `st` origin is the BOTTOM-left,
 * the opposite of glTF's. Both files describe the same rug the same way up; only the
 * numbering differs.
 */
function usda(
  name: string,
  texture: string,
  halfW: number,
  halfL: number,
  shape: RugShape,
): string {
  const n = (value: number) => value.toFixed(6)
  const nx = n(-halfW)
  const px = n(halfW)
  const nz = n(-halfL)
  const pz = n(halfL)

  /*
    The rug's outline.

    A rectangle is one four-sided face. An ellipse is one N-sided face — USD takes an
    n-gon directly, so there is no fan and no centre vertex to keep in step with glTF's.
    That is safe here for the same reason it is safe there: u depends only on x and v
    only on z, linearly, so however Quick Look triangulates the polygon the texture lands
    in the same place.

    Note the texture coordinates against glb.ts: USD's `st` origin is the BOTTOM-left,
    the opposite of glTF's. Both files describe the same rug the same way up; only the
    numbering differs, which is why v is flipped below and not in glb.ts.
  */
  let counts: string
  let indices: string
  let points: string
  let normals: string
  let uvs: string

  if (shape === 'rect') {
    counts = '4'
    indices = '0, 1, 2, 3'
    points = `(${nx}, 0, ${pz}), (${px}, 0, ${pz}), (${px}, 0, ${nz}), (${nx}, 0, ${nz})`
    normals = '(0, 1, 0), (0, 1, 0), (0, 1, 0), (0, 1, 0)'
    uvs = '(0, 0), (1, 0), (1, 1), (0, 1)'
  } else {
    const segments = RIM_SEGMENTS
    const rim = Array.from({ length: segments }, (_, i) => {
      const angle = (i / segments) * Math.PI * 2
      return { cos: Math.cos(angle), sin: Math.sin(angle) }
    })
    counts = String(segments)
    indices = rim.map((_, i) => i).join(', ')
    points = rim.map((r) => `(${n(halfW * r.cos)}, 0, ${n(halfL * r.sin)})`).join(', ')
    normals = rim.map(() => '(0, 1, 0)').join(', ')
    // v flipped relative to glb.ts, because USD counts st from the bottom.
    uvs = rim.map((r) => `(${n(0.5 + 0.5 * r.cos)}, ${n(0.5 - 0.5 * r.sin)})`).join(', ')
  }

  return `#usda 1.0
(
    defaultPrim = "Rug"
    metersPerUnit = 1
    upAxis = "Y"
)

def Xform "Rug" (
    assetInfo = { string name = "${name}" }
    kind = "component"
)
{
    def Mesh "Surface" (
        prepend apiSchemas = ["MaterialBindingAPI"]
    )
    {
        uniform bool doubleSided = 1
        float3[] extent = [(${nx}, 0, ${nz}), (${px}, 0, ${pz})]
        int[] faceVertexCounts = [${counts}]
        int[] faceVertexIndices = [${indices}]
        point3f[] points = [${points}]
        normal3f[] primvars:normals = [${normals}] (
            interpolation = "vertex"
        )
        texCoord2f[] primvars:st = [${uvs}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
        rel material:binding = </Rug/Materials/RugMaterial>
    }

    def Scope "Materials"
    {
        def Material "RugMaterial"
        {
            token outputs:surface.connect = </Rug/Materials/RugMaterial/Shader.outputs:surface>

            def Shader "Shader"
            {
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </Rug/Materials/RugMaterial/Texture.outputs:rgb>
                float inputs:metallic = 0
                float inputs:roughness = 0.95
                float inputs:opacity = 1
                token outputs:surface
            }

            def Shader "Texture"
            {
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @${texture}@
                float2 inputs:st.connect = </Rug/Materials/RugMaterial/UVReader.outputs:result>
                token inputs:wrapS = "clamp"
                token inputs:wrapT = "clamp"
                float3 outputs:rgb
            }

            def Shader "UVReader"
            {
                uniform token info:id = "UsdPrimvarReader_float2"
                uniform string inputs:varname = "st"
                float2 inputs:fallback = (0, 0)
                float2 outputs:result
            }
        }
    }
}
`
}

const LOCAL_HEADER = 30
const ALIGNMENT = 64
/** A zip extra field is a 2-byte id and a 2-byte length, so it cannot be shorter. */
const MIN_EXTRA = 4

interface Entry {
  name: string
  bytes: Uint8Array
}

function zipStored(entries: Entry[]): Uint8Array {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const crc = crc32(entry.bytes)

    // Pad the extra field until the DATA lands on a 64-byte boundary. If the gap that
    // leaves is too small to express as an extra field, take another whole block.
    const beforeExtra = offset + LOCAL_HEADER + nameBytes.length
    let extraLength = (ALIGNMENT - (beforeExtra % ALIGNMENT)) % ALIGNMENT
    if (extraLength !== 0 && extraLength < MIN_EXTRA) extraLength += ALIGNMENT

    const header = new Uint8Array(LOCAL_HEADER + nameBytes.length + extraLength)
    const view = new DataView(header.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true) // version needed
    view.setUint16(6, 0, true) // flags
    view.setUint16(8, 0, true) // method: stored
    view.setUint16(10, 0, true) // mod time
    view.setUint16(12, 0x0021, true) // mod date — 1 Jan 1980, the zip epoch
    view.setUint32(14, crc, true)
    view.setUint32(18, entry.bytes.length, true) // compressed size
    view.setUint32(22, entry.bytes.length, true) // uncompressed size
    view.setUint16(26, nameBytes.length, true)
    view.setUint16(28, extraLength, true)
    header.set(nameBytes, LOCAL_HEADER)
    if (extraLength) {
      // 0x1986 is the id pxr's own usdzip writes for this padding. The bytes are
      // ignored by every reader; only the length matters.
      const extraAt = LOCAL_HEADER + nameBytes.length
      view.setUint16(extraAt, 0x1986, true)
      view.setUint16(extraAt + 2, extraLength - MIN_EXTRA, true)
    }

    const directory = new Uint8Array(46 + nameBytes.length)
    const dirView = new DataView(directory.buffer)
    dirView.setUint32(0, 0x02014b50, true)
    dirView.setUint16(4, 20, true) // version made by
    dirView.setUint16(6, 20, true) // version needed
    dirView.setUint16(8, 0, true)
    dirView.setUint16(10, 0, true)
    dirView.setUint16(12, 0, true)
    dirView.setUint16(14, 0x0021, true)
    dirView.setUint32(16, crc, true)
    dirView.setUint32(20, entry.bytes.length, true)
    dirView.setUint32(24, entry.bytes.length, true)
    dirView.setUint16(28, nameBytes.length, true)
    dirView.setUint16(30, 0, true) // no extra in the central copy
    dirView.setUint16(32, 0, true) // comment
    dirView.setUint16(34, 0, true) // disk
    dirView.setUint16(36, 0, true) // internal attrs
    dirView.setUint32(38, 0, true) // external attrs
    dirView.setUint32(42, offset, true)
    directory.set(nameBytes, 46)
    central.push(directory)

    parts.push(header, entry.bytes)
    offset += header.length + entry.bytes.length
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, entries.length, true)
  endView.setUint16(10, entries.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)
  endView.setUint16(20, 0, true)

  const all = [...parts, ...central, end]
  const total = all.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let cursor = 0
  for (const part of all) {
    out.set(part, cursor)
    cursor += part.length
  }
  return out
}

export interface UsdzModel {
  widthM: number
  lengthM: number
  texture: Uint8Array
  /** Display name — Quick Look shows this, and VoiceOver reads it. */
  name: string
  /** Base filename inside the archive, without extension. */
  stem: string
  /** Rectangle by default; 'ellipse' for the round and oval rugs. */
  shape?: RugShape
}

export function buildUsdz({
  widthM,
  lengthM,
  texture,
  name,
  stem,
  shape = 'rect',
}: UsdzModel): Uint8Array {
  const textureName = `${stem}.jpg`
  const scene = usda(name, textureName, widthM / 2, lengthM / 2, shape)
  return zipStored([
    // The .usda first — rule 3.
    { name: `${stem}.usda`, bytes: new TextEncoder().encode(scene) },
    { name: textureName, bytes: texture },
  ])
}
