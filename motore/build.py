import os
B = 'node_modules/three/'
libs = ['build/three.min.js', 'examples/js/shaders/CopyShader.js', 'examples/js/shaders/LuminosityHighPassShader.js',
        'examples/js/postprocessing/EffectComposer.js', 'examples/js/postprocessing/RenderPass.js', 'examples/js/postprocessing/ShaderPass.js',
        'examples/js/postprocessing/UnrealBloomPass.js', 'examples/js/utils/BufferGeometryUtils.js']
three = '\n;\n'.join(open(B + f).read() for f in libs)
assert '</script' not in three.lower()
import re
def mod(f):
    t = open(f).read()
    return re.sub(r"\nif \(typeof module !== 'undefined'\) .*", '', t)
game = "(() => {\n'use strict';\nconst G = {};\n" + '\n'.join(mod(f) for f in ['bricks.js'] + sorted(f for f in os.listdir('.') if re.match(r'^mec\d+\.js$', f)) + ['catalogo.js', 'city.js', 'core.js', 'world.js', 'fx.js', 'anim.js', 'poteri-fx.js', 'ui.js', 'main.js']) + "\nif (!window.THREE) { document.getElementById('homeMsg').textContent = 'Motore 3D non caricato.'; } else G.start();\n})();"
assert '</script' not in game.lower()
src = open('index.src.html').read()
app = '''<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Dite">
<meta name="theme-color" content="#0a0406">
<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">'''
os.makedirs('dist', exist_ok=True); os.makedirs('site', exist_ok=True)
for name, meta in (('dist/index.html', ''), ('site/index.html', app)):
    out = src.replace('<!--APPMETA-->', meta).replace('/*THREE*/', three).replace('/*GAME*/', game)
    open(name, 'w').write(out)
    print(name, len(out) // 1024, 'KB')
