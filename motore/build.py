"""Build the self-contained web and native game from either working directory."""
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parent
LIB = ROOT / 'node_modules/three'
LIBRARIES = [
    'build/three.min.js',
    'examples/js/shaders/CopyShader.js',
    'examples/js/shaders/LuminosityHighPassShader.js',
    'examples/js/postprocessing/EffectComposer.js',
    'examples/js/postprocessing/RenderPass.js',
    'examples/js/postprocessing/ShaderPass.js',
    'examples/js/postprocessing/UnrealBloomPass.js',
    'examples/js/utils/BufferGeometryUtils.js',
]
MODULES = (
    ['bricks.js']
    + sorted(p.name for p in ROOT.iterdir() if re.fullmatch(r'mec\d+\.js', p.name))
    + ['catalogo.js', 'city.js', 'core.js', 'onboarding.js', 'journal.js',
       'storage.js', 'app-state.js', 'world.js', 'fx.js', 'anim.js',
       'poteri-fx.js', 'ui.js', 'main.js']
)


def read(path):
    return path.read_text(encoding='utf-8')


def module(name):
    # Standalone Node exports use one guarded line; no browser require/load occurs.
    return re.sub(r"\nif \(typeof module !== 'undefined'\) .*", '', read(ROOT / name))


three = '\n;\n'.join(read(LIB / name) for name in LIBRARIES)
game = "(() => {\n'use strict';\nconst G = {};\n" + '\n'.join(map(module, MODULES))
game += "\nif (!window.THREE) { document.getElementById('homeMsg').textContent = 'Motore 3D non caricato.'; } else G.start();\n})();"
assert '</script' not in three.lower(), 'Unexpected closing script tag in engine'
assert '</script' not in game.lower(), 'Unexpected closing script tag in game'

source = read(ROOT / 'index.src.html')
mark = read(ROOT.parent / 'assets/dite-mark.svg').strip()
source = source.replace('<!--BRAND_MARK-->', mark)
app = '''<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Dite">
<meta name="theme-color" content="#111014">
<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">'''
for token in ['<!--APPMETA-->', '/*THREE*/', '/*GAME*/']:
    assert source.count(token) == 1, 'Expected one '+token

for name, meta in [('dist/index.html', ''), ('site/index.html', app)]:
    output = source.replace('<!--APPMETA-->', meta).replace('/*THREE*/', three).replace('/*GAME*/', game)
    data = output.encode('utf-8')
    target = ROOT / name
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(data)
    print(f'{name}: {len(data)//1024} KiB; sha256 {hashlib.sha256(data).hexdigest()}')
