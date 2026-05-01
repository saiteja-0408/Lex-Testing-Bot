// Usage: npm start
// Serves the Lex Web UI right-panel with minimal configuration.
// For component hot reload: cd lex-web-ui && npm run serve
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8000;
const publicPath = '/';

const botConfigDir = path.join(__dirname, 'bot-config');
const standaloneDir = path.join(__dirname, 'web-lex-standalone');
const distDir = path.join(__dirname, 'dist');
const configDir = path.join(__dirname, 'src/config');
const app = express();

// Serve bot configuration (AWS Cognito, Lex bot, UI settings, icon)
app.use('/bot-config', express.static(botConfigDir));

// Serve standalone Lex Web UI (entry HTML, loader JS/CSS, styles)
app.use('/web-lex-standalone', express.static(standaloneDir));

// Serve dist bundles (built Vue components + dependencies)
app.use(publicPath, express.static(distDir));

// Serve loader config (fallback configuration)
app.use(publicPath, express.static(configDir));

app.listen(port, function () {
  console.log(`Lex Web UI right-panel server listening on: http://localhost:${port}`);
  console.log(`Open browser: http://localhost:${port}/right-panel.html`);
});
