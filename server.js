// Static file server for the chat UI. `npm start`.
// Component hot reload instead: cd lex-web-ui && npm run serve
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
const distDir = path.join(__dirname, 'dist');
const configDir = path.join(__dirname, 'src/config');
const app = express();

// Allow the Angular app origin (and same-origin requests) to iframe the chat widget.
// In production set CORS_ORIGIN to the Angular app's actual domain.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8100';
app.use(cors({ origin: corsOrigin }));


// Avatar and icon images.
app.use('/bot-config', express.static(botConfigDir));


app.use(publicPath, express.static(distDir));

// The loader config. Primary, not a fallback — dist/ has no copy, so the
// server must run from the repo rather than from node_modules.
app.use(publicPath, express.static(configDir));

app.listen(port, host, function () {
  console.log(`Lex Web UI server listening on: http://${host}:${port}`);
});
