# AWS Lex Web UI — Right-Panel Setup Guide

Quick start guide to run the Lex Web UI right-panel chatbot locally or deploy to production.

## Project Structure

```
aws-lex-web-ui/
├── bot-config/                    ← AWS configuration (Cognito, Lex bot)
│   ├── config.json               (edit this for your bot)
│   ├── bot-icon.png              (bot avatar)
│   └── README.md                 (config guide)
├── web-lex-standalone/           ← UI entry points
│   ├── right-panel.html          (embedded panel)
│   ├── index.html                (full-page mode)
│   ├── initiate-loader.js        (initialization)
│   └── lex-web-ui-loader.min.js  (bundled loader)
├── src/
│   ├── config/                   (config fallbacks)
│   ├── dependencies/             (Vue, Vuetify, Vuex bundles)
│   └── website/                  (source HTML templates)
├── dist/                         (built bundles)
├── lex-web-ui/                   (Vue source — edit components here)
├── build/                        (build scripts)
├── server.js                     (Node.js Express server)
└── SETUP.md                      (this file)
```

## Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 10.0.0
- **AWS Account** with Cognito identity pool and Lex v2 bot configured

## Step 1: Configure AWS

### Cognito Identity Pool
1. Go to AWS Cognito console
2. Create identity pool (or use existing)
3. Note down: `Identity Pool ID` (format: `region:uuid`)
4. Create user pool and app client
5. Note down: `User Pool ID`, `Client ID`, `App Domain`

### Lex v2 Bot
1. Go to AWS Lex console
2. Create Lex v2 bot (or use existing)
3. Create intent with sample utterances
4. Create and deploy bot alias (e.g., "TSTALIASID")
5. Note down: `Bot ID`, `Bot Alias ID`, `Bot Locale` (usually "en_US")

## Step 2: Update Configuration

Edit `bot-config/config.json` and update these sections:

```json
{
  "cognito": {
    "poolId": "us-east-1:YOUR_IDENTITY_POOL_ID",
    "appUserPoolClientId": "YOUR_CLIENT_ID",
    "appUserPoolName": "YOUR_USER_POOL_NAME",
    "appDomainName": "YOUR_DOMAIN.auth.us-east-1.amazoncognito.com",
    "aws_cognito_region": "us-east-1"
  },
  "lex": {
    "v2BotId": "YOUR_BOT_ID",
    "v2BotAliasId": "YOUR_ALIAS_ID",
    "v2BotLocaleId": "en_US",
    "region": "us-east-1"
  },
  "ui": {
    "pageTitle": "Your Bot Name",
    "toolbarTitle": "Your Bot Name",
    "showOnboardingForm": true
  }
}
```

For detailed config options, see [bot-config/README.md](./bot-config/README.md).

## Step 3: Install Dependencies

```bash
cd /path/to/aws-lex-web-ui
npm install
```

## Step 4: Run Locally

### Start Server
```bash
npm start
```

Output:
```
Lex Web UI right-panel server listening on: http://localhost:8000
Open browser: http://localhost:8000/right-panel.html
```

### Open in Browser
- **Right-panel mode** (embedded): http://localhost:8000/right-panel.html
- **Full-page mode**: http://localhost:8000/index.html

## Step 5: Develop & Build

### Modify Components
Edit Vue components in `lex-web-ui/src/components/`:

```bash
cd lex-web-ui
npm run serve       # Hot reload dev mode
```

Browser will open at `http://localhost:5173` with live reload.

### Build for Production

```bash
cd lex-web-ui
npm run build-dist    # Build production bundles

cd ..
node build/copy-assets.js    # Copy bundles to dist/
```

## Deployment

### AWS S3 + CloudFront

1. Build bundles:
   ```bash
   npm run build-dist
   node build/copy-assets.js
   ```

2. Upload to S3:
   ```bash
   aws s3 cp dist/ s3://your-bucket/lex-web-ui/ --recursive
   aws s3 cp bot-config/ s3://your-bucket/bot-config/ --recursive
   ```

3. CloudFront Origin
   - Point to S3 bucket
   - Add CORS headers for cross-origin access

### Environment Variables

Set before running:
- `NODE_ENV` — "development" or "production"
- `PORT` — Server port (default: 8000)

Example:
```bash
PORT=3000 npm start
```

## Features

✅ **Cognito Authentication** — Secure user identity  
✅ **Lex v2 Bot Integration** — Real-time bot responses  
✅ **PII Onboarding Form** — Collect user info before chat  
✅ **Minimized Launcher** — Floating chat icon when closed  
✅ **Responsive UI** — Works on desktop, tablet, mobile  
✅ **Customizable Branding** — Colors, logo, toolbar  
✅ **Quick Replies** — Pre-defined response buttons  

## Troubleshooting

### Port 8000 Already in Use
```bash
lsof -nP -iTCP:8000    # Find process
kill -9 <PID>          # Kill process
npm start              # Restart server
```

### "Invalid identity pool configuration"
- Verify Cognito credentials in `config.json`
- Check identity pool has IAM policy for Lex actions

### Chat Not Loading
- Check browser console for errors (F12)
- Verify Lex bot is deployed and active
- Clear browser cache (Cmd+Shift+Delete on Mac, Ctrl+Shift+Delete on Windows)

### Onboarding Not Showing
- Set `showOnboardingForm: true` in config
- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear

## Configuration Reference

For complete config options and AWS setup details, see:
- **Configuration Guide**: [bot-config/README.md](./bot-config/README.md)
- **Environment Variables**: See `src/config/lex-web-ui-loader-config.json`

## Support

**AWS Lex Web UI Repository**: https://github.com/aws-samples/aws-lex-web-ui

**Lex Documentation**: https://docs.aws.amazon.com/lexv2/

**Cognito Documentation**: https://docs.aws.amazon.com/cognito/
