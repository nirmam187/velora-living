#!/usr/bin/env python3
"""
Builds the two 3D files a rug needs to appear in a customer's room.

    .glb   Android (WebXR / Scene Viewer) and the in-page 3D viewer on every platform
    .usdz  iPhone and iPad (AR Quick Look) — the only format Safari will place in a room

A rug is the easiest possible 3D object: a flat rectangle with a photograph on it. So
rather than pulling in a modelling library, both files are written directly. glTF is
JSON plus a binary blob, USD has a plain-text form, and the geometry is four vertices.
Two hundred lines here is cheaper than a dependency that has to be kept alive.

SCALE IS THE POINT. The whole value of AR for a rug is answering "is 5x8 big enough for
this room?", so the model is built at true size in metres and Quick Look and Scene
Viewer both place it at that size. Get this wrong and the feature is worse than useless
— it would confidently show someone the wrong answer.

USAGE
    python3 scripts/ar/build_models.py texture.jpg public/ar/vlr-206 --size 5x8
"""

from __future__ import annotations

import argparse
import json
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

FEET_TO_METRES = 0.3048

# Standard sizes, from data/sizes.ts. Width x length, in feet.
SIZES = {
    '2x3': (2, 3), '3x5': (3, 5), '4x6': (4, 6), '5x8': (5, 8), '6x9': (6, 9),
    '8x10': (8, 10), '9x12': (9, 12), '10x14': (10, 14), '12x15': (12, 15),
}


def pad(data: bytes, alignment: int = 4, filler: bytes = b'\x00') -> bytes:
    """glTF requires every chunk to start on a 4-byte boundary."""
    remainder = len(data) % alignment
    return data if remainder == 0 else data + filler * (alignment - remainder)


def build_glb(texture: Path, width_m: float, length_m: float, out: Path) -> None:
    """
    Writes a binary glTF: one double-sided quad, one PBR material, the photo embedded.

    The rug lies in the XZ plane with +Y up, which is what both glTF and every AR
    runtime expect for something that sits on the floor. It is drawn double-sided so a
    customer crouching to look along the pile does not see straight through it.
    """
    half_w, half_l = width_m / 2, length_m / 2

    # Four corners, counter-clockwise seen from above.
    positions = [
        (-half_w, 0.0, half_l),
        (half_w, 0.0, half_l),
        (half_w, 0.0, -half_l),
        (-half_w, 0.0, -half_l),
    ]
    normals = [(0.0, 1.0, 0.0)] * 4
    # glTF's texture origin is the TOP-left, so v runs down the image as z runs away
    # from the viewer. (USD numbers this axis the other way round — see build_usdz.)
    uvs = [(0.0, 1.0), (1.0, 1.0), (1.0, 0.0), (0.0, 0.0)]
    indices = [0, 1, 2, 0, 2, 3]

    position_bytes = b''.join(struct.pack('<3f', *p) for p in positions)
    normal_bytes = b''.join(struct.pack('<3f', *n) for n in normals)
    uv_bytes = b''.join(struct.pack('<2f', *t) for t in uvs)
    index_bytes = b''.join(struct.pack('<H', i) for i in indices)
    image_bytes = texture.read_bytes()

    blob = b''
    views = []
    for payload, target in (
        (position_bytes, 34962),  # ARRAY_BUFFER
        (normal_bytes, 34962),
        (uv_bytes, 34962),
        (index_bytes, 34963),     # ELEMENT_ARRAY_BUFFER
        (image_bytes, None),
    ):
        blob = pad(blob)
        view = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(payload)}
        if target:
            view['target'] = target
        views.append(view)
        blob += payload

    gltf = {
        'asset': {'version': '2.0', 'generator': 'Velora Living rug builder'},
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0, 'name': out.stem}],
        'meshes': [{
            'name': out.stem,
            'primitives': [{
                'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2},
                'indices': 3,
                'material': 0,
            }],
        }],
        'materials': [{
            'name': 'Rug',
            'pbrMetallicRoughness': {
                'baseColorTexture': {'index': 0},
                # Wool is not metal, and it scatters rather than reflects. A low
                # roughness here would put a sheen on the rug that no rug has.
                'metallicFactor': 0.0,
                'roughnessFactor': 0.95,
            },
            'doubleSided': True,
        }],
        'textures': [{'source': 0, 'sampler': 0}],
        'images': [{'bufferView': 4, 'mimeType': 'image/jpeg'}],
        'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}],
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': 4, 'type': 'VEC3',
             'min': [-half_w, 0.0, -half_l], 'max': [half_w, 0.0, half_l]},
            {'bufferView': 1, 'componentType': 5126, 'count': 4, 'type': 'VEC3'},
            {'bufferView': 2, 'componentType': 5126, 'count': 4, 'type': 'VEC2'},
            {'bufferView': 3, 'componentType': 5123, 'count': 6, 'type': 'SCALAR'},
        ],
        'bufferViews': views,
        'buffers': [{'byteLength': len(blob)}],
    }

    json_chunk = pad(json.dumps(gltf, separators=(',', ':')).encode('utf-8'), filler=b' ')
    bin_chunk = pad(blob)

    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('wb') as handle:
        handle.write(b'glTF')
        handle.write(struct.pack('<I', 2))
        handle.write(struct.pack('<I', 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)))
        handle.write(struct.pack('<I', len(json_chunk)) + b'JSON' + json_chunk)
        handle.write(struct.pack('<I', len(bin_chunk)) + b'BIN\x00' + bin_chunk)


USDA = '''#usda 1.0
(
    defaultPrim = "Rug"
    metersPerUnit = 1
    upAxis = "Y"
)

def Xform "Rug" (
    assetInfo = {{ string name = "{name}" }}
    kind = "component"
)
{{
    def Mesh "Surface" (
        prepend apiSchemas = ["MaterialBindingAPI"]
    )
    {{
        uniform bool doubleSided = 1
        float3[] extent = [({nx}, 0, {nz}), ({px}, 0, {pz})]
        int[] faceVertexCounts = [4]
        int[] faceVertexIndices = [0, 1, 2, 3]
        point3f[] points = [({nx}, 0, {pz}), ({px}, 0, {pz}), ({px}, 0, {nz}), ({nx}, 0, {nz})]
        normal3f[] primvars:normals = [(0, 1, 0), (0, 1, 0), (0, 1, 0), (0, 1, 0)] (
            interpolation = "vertex"
        )
        texCoord2f[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
        rel material:binding = </Rug/Materials/RugMaterial>
    }}

    def Scope "Materials"
    {{
        def Material "RugMaterial"
        {{
            token outputs:surface.connect = </Rug/Materials/RugMaterial/Shader.outputs:surface>

            def Shader "Shader"
            {{
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </Rug/Materials/RugMaterial/Texture.outputs:rgb>
                float inputs:metallic = 0
                float inputs:roughness = 0.95
                float inputs:opacity = 1
                token outputs:surface
            }}

            def Shader "Texture"
            {{
                uniform token info:id = "UsdUVTexture"
                asset inputs:file = @{texture}@
                float2 inputs:st.connect = </Rug/Materials/RugMaterial/UVReader.outputs:result>
                token inputs:wrapS = "clamp"
                token inputs:wrapT = "clamp"
                float3 outputs:rgb
            }}

            def Shader "UVReader"
            {{
                uniform token info:id = "UsdPrimvarReader_float2"
                uniform string inputs:varname = "st"
                float2 inputs:fallback = (0, 0)
                float2 outputs:result
            }}
        }}
    }}
}}
'''


def build_usdz(texture: Path, width_m: float, length_m: float, out: Path, name: str) -> None:
    """
    Writes a USDZ for AR Quick Look, via Apple's own `usdzip`.

    USDZ is a zip with strict rules — no compression, 64-byte alignment — which is why
    this shells out to usdzip rather than writing the archive by hand. The .usda and the
    photograph are staged in a temporary directory so the asset path inside the archive
    stays a bare filename.

    Note the texture coordinates: USD's `st` origin is the BOTTOM-left, the opposite of
    glTF. Both files describe the same rug the same way up; only the numbering differs.
    """
    half_w, half_l = width_m / 2, length_m / 2

    with tempfile.TemporaryDirectory() as work:
        staging = Path(work)
        (staging / texture.name).write_bytes(texture.read_bytes())
        scene = staging / f'{out.stem}.usda'
        scene.write_text(USDA.format(
            name=name,
            texture=texture.name,
            nx=f'{-half_w:.6f}', px=f'{half_w:.6f}',
            nz=f'{-half_l:.6f}', pz=f'{half_l:.6f}',
        ))

        out.parent.mkdir(parents=True, exist_ok=True)
        # `--asset` is the mode that walks the scene's dependencies and pulls the
        # referenced texture into the archive. Passing the .usda as a plain input
        # instead zips only that one file, and Quick Look shows an untextured slab.
        result = subprocess.run(
            ['usdzip', '--asset', scene.name, str(out.resolve())],
            cwd=staging, capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise SystemExit(f'usdzip failed:\n{result.stdout}\n{result.stderr}')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('texture', help='Flat texture from flatten.py')
    parser.add_argument('out_prefix', help='Output path without extension, e.g. public/ar/vlr-206')
    parser.add_argument('--size', default='5x8', choices=sorted(SIZES),
                        help='Rug size in feet. Default 5x8, the most-ordered size.')
    parser.add_argument('--name', default=None, help='Display name baked into the USDZ')
    args = parser.parse_args()

    texture = Path(args.texture)
    prefix = Path(args.out_prefix)
    feet_w, feet_l = SIZES[args.size]
    width_m, length_m = feet_w * FEET_TO_METRES, feet_l * FEET_TO_METRES
    name = args.name or prefix.stem.upper()

    build_glb(texture, width_m, length_m, prefix.with_suffix('.glb'))
    build_usdz(texture, width_m, length_m, prefix.with_suffix('.usdz'), name)

    for path in (prefix.with_suffix('.glb'), prefix.with_suffix('.usdz')):
        print(f'wrote {path}  ({path.stat().st_size / 1024:.0f} kB)')
    print(f'real-world size: {feet_w}x{feet_l} ft  =  {width_m:.3f} x {length_m:.3f} m')


if __name__ == '__main__':
    sys.exit(main())
