// Playwright per le prove nel browser: `npm install` e poi `npx playwright install chromium`, oppure CHROME=percorso di un Chrome gia installato.
let pw; try { pw = require('playwright'); } catch (e) { pw = require('./pw.js'); }
module.exports = pw;
