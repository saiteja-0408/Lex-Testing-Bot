// Usage: npm start
// Serves the Lex Web UI right-panel with minimal configuration.
// For component hot reload: cd lex-web-ui && npm run serve
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8000;
const host = process.env.HOST || '127.0.0.1';
const publicPath = '/';

const botConfigDir = path.join(__dirname, 'bot-config');
const standaloneDir = path.join(__dirname, 'web-lex-standalone');
const distDir = path.join(__dirname, 'dist');
const configDir = path.join(__dirname, 'src/config');
const app = express();

// Allow the Angular app origin (and same-origin requests) to iframe the chat widget.
// In production set CORS_ORIGIN to the Angular app's actual domain.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8100';
app.use(cors({ origin: corsOrigin }));


// Serve bot configuration (AWS Cognito, Lex bot, UI settings, icon)
app.use('/bot-config', express.static(botConfigDir));

// Serve standalone Lex Web UI (entry HTML, loader JS/CSS, styles)
// Files in this folder are served under /web-lex-standalone/*
app.use('/web-lex-standalone', express.static(standaloneDir));

// Serve dist bundles (built Vue components + dependencies)
app.use(publicPath, express.static(distDir));

// Serve loader config (fallback configuration)
app.use(publicPath, express.static(configDir));

app.listen(port, host, function () {
  console.log(`Lex Web UI server listening on: http://${host}:${port}`);
});
