// Collaudo completo: anche le prove browser legacy devono dichiarare un esito verde.
// Uso: node motore/tbaseline.js [all|node|browser]. CHROME resta disponibile.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');

function verdict(result, browser) {
  if (result.error || result.signal || result.status !== 0) return false;
  const output = (result.stdout || '') + '\n' + (result.stderr || '');
  if (/^\s*NO\s|PAGEERROR|ERRORI DI CARICAMENTO|\| non riuscite: [1-9]|\| errori di caricamento: [1-9]/m.test(output)) return false;
  return !browser || /nessun errore\s*$/.test((result.stdout || '').trim());
}

function main() {
  const mode = process.argv[2] || 'all';
  if (!['all', 'node', 'browser'].includes(mode)) { console.error('Uso: node tbaseline.js [all|node|browser]'); return 1; }
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const checks = [];
  if (mode !== 'browser') checks.push(
    { args: ['tprog.js'] }, { args: ['bot.js', 'fuzz', '300'] },
    { args: ['bot.js', 'missioni', '12'] }, { args: ['bot.js', 'boss', '3'] },
    { args: ['tmec.js'] },
    { args: ['tnuove.js'] }, { args: ['tcorpo.js'] }, { args: ['tcloni.js'] },
    { args: ['tcatalogo.js'] }, { args: ['tespansione.js'] },
  );
  if (mode !== 'node') {
    checks.push({ command: 'python3', args: ['build.py'] });
    checks.push({ args: ['tpow.js'], browser: true, env: { X: '' } }, { args: ['tpow.js'], browser: true, env: { X: '1' } });
    for (const kind of ['forme', 'colpi', 'linee', 'zone']) checks.push({ args: ['tanim.js', kind], browser: true });
    for (const file of ['tend.js', 'tquest.js', 'ttips.js']) checks.push({ args: [file], browser: true });
    for (const kind of ['boss', 'temi', 'officina']) checks.push({ args: ['tour.js', kind], browser: true });
    for (const file of ['tofficina.js', 'tvis.js', 'tcorpo_browser.js', 'tsensi_browser.js']) checks.push({ args: [file], browser: true });
  }
  for (const check of checks) {
    const label = (check.env && check.env.X ? 'X=1 ' : '') + check.args.join(' ');
    console.log('\nPROVA ' + label);
    const result = spawnSync(check.command || process.execPath, check.args, {
      cwd: __dirname, env: { ...process.env, ...check.env }, encoding: 'utf8',
      timeout: 30 * 60 * 1000, maxBuffer: 16 * 1024 * 1024,
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (!verdict(result, check.browser)) {
      console.error('FALLITA: ' + label + (result.error ? ' — ' + result.error.message : '') + (result.signal ? ' — ' + result.signal : ''));
      return 1;
    }
    console.log('PASS: ' + label);
  }
  console.log('\nSuite ' + mode + ': ' + checks.length + ' prove verdi.');
  return 0;
}

if (require.main === module) process.exitCode = main();
module.exports = { verdict };
