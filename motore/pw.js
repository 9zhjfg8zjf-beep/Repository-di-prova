// La shell ufficiale evita i socket di profilo richiesti da Chrome completo.
// npm ci && npx playwright install chromium-headless-shell
// CHROME puo comunque indicare un altro eseguibile compatibile.
module.exports = require('playwright');
