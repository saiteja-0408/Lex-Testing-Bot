# 🚀 Guide: Fork AWS Lex Web UI & Apply Right-Panel Customizations

## 📋 Overview
This guide walks you through:
1. Forking the official AWS Lex Web UI repo
2. Applying your right-panel customizations
3. Running it with your exact configuration
4. Testing end-to-end

---

## ✅ STEP 1: Fork & Clone Official Repo

### 1a. Fork on GitHub
```bash
# Go to https://github.com/aws-samples/aws-lex-web-ui
# Click "Fork" button (top right)
# This creates your own copy
```

### 1b. Clone Your Fork
```bash
# Replace YOUR-USERNAME with your GitHub username
git clone https://github.com/YOUR-USERNAME/aws-lex-web-ui.git
cd aws-lex-web-ui

# Add upstream to track original
git remote add upstream https://github.com/aws-samples/aws-lex-web-ui.git
```

### 1c. Create Feature Branch
```bash
git checkout -b right-panel-customization
```

---

## 🔧 STEP 2: Understand Current Repo Structure

Your current repo has these key files for right-panel:

```
📁 /src
  ├── 📁 /website              ← Standalone HTML files
  │   ├── right-panel.html     ← Your custom right-panel
  │   └── index.html           ← Original full-page version
  ├── 📁 /config
  │   ├── lex-web-ui-loader-config.json  ← Your Lex config
  │   └── test_AWS.json
  └── 📁 /lex-web-ui-loader
      ├── 📁 /js
      └── 📁 /css
```

---

## 📝 STEP 3: Key Changes You Made

### **Change 1: CSS Styling (right-panel.html)**

**What It Does:**
- Floating panel instead of full page
- Positioned on the right side (16px from edge)
- Smooth animations (opacity + transform)
- Responsive design
- Minimize button creates circular icon

**CSS Key Properties:**
```css
/* Position: Fixed on right */
right: 12px !important;
top: 12px !important;
bottom: 12px !important;

/* Size: 380-420px wide */
width: min(400px, 100vw) !important;
height: calc(100vh - 24px) !important;

/* Animation: Smooth transitions */
opacity: 0 → 1
transform: translate3d(16px, 0, 0) scale(0.98) → translate3d(0, 0, 0) scale(1)

/* Rounded corners */
border-radius: 12px;
box-shadow: 0 12px 40px rgba(15, 30, 60, 0.18);

/* Minimize: becomes circular */
width: 68px !important;
height: 68px !important;
border-radius: 999px !important;
```

---

### **Change 2: JavaScript Configuration (right-panel.html)**

**What It Does:**
- Fetches config from local JSON file
- Overrides default settings programmatically
- Forces panel to load **expanded** (not minimized)
- Sets same-origin for security

**Key Lines:**
```javascript
// 1. Load config from JSON file
fetch(origin + '/lex-web-ui-loader-config.json')

// 2. Override default settings
cfg.ui.parentOrigin = origin;
cfg.iframe.iframeOrigin = origin;
cfg.iframe.shouldLoadIframeMinimized = false;  // ⭐ FORCES EXPANDED
```

**Why This Matters:**
- Default Lex loader starts minimized (small circle)
- Your override makes it open immediately
- Looks professional, better UX

---

### **Change 3: Config File (lex-web-ui-loader-config.json)**

**Your Current Settings:**
```json
{
  "cognito": {
    "poolId": "us-east-1:b68dbaae-...",
    "appUserPoolClientId": "114kdhfikmi74o70ghotcs9e1",
    "appDomainName": "lexkwebkui...auth.us-east-1.amazoncognito.com"
  },
  "lex": {
    "v2BotId": "Testing_Bot",
    "v2BotAliasId": "Testing_Bot",
    "v2BotLocaleId": "en_US"
  },
  "ui": {
    "toolbarTitle": "Testing BOT",
    "toolbarColor": "#1e3a5f",
    "defaultQuickReplies": [ ... ]  // Your predefined buttons
  },
  "iframe": {
    "shouldLoadIframeMinimized": true,  // Overridden to false in JS!
    "iframeOrigin": "http://localhost:8000"
  }
}
```

---

## 🛠️ STEP 4: Apply Changes to Forked Repo

### 4a. Locate AWS Repo Structure

Official AWS repo has similar structure:
```
aws-lex-web-ui/
├── src/
│   └── website/        ← HTML files location
├── bot-config/
├── lex-web-ui/         ← Vue component source
└── web-lex-standalone/
```

### 4b. Create/Update right-panel.html

**Location:** `src/website/right-panel.html`

**Action:** Copy your `right-panel.html` exactly as-is:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sample site — Maggi-style Lex panel (right)</title>
  <link href="./lex-web-ui-loader.min.css" rel="stylesheet" />
  <style>
    /* Copy all your CSS here */
    * { box-sizing: border-box; }
    
    .lex-web-ui-iframe {
      min-width: 380px !important;
      max-width: 420px !important;
      width: min(400px, 100vw) !important;
      height: calc(100vh - 24px) !important;
      top: 12px !important;
      right: 12px !important;
      opacity: 0;
      transform: translate3d(16px, 0, 0) scale(0.98);
      transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      /* ... rest of your CSS ... */
    }
    
    .lex-web-ui-iframe.lex-web-ui-iframe--show {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
      pointer-events: auto;
    }
  </style>
</head>
<body>
  <div class="page-shell">
    <div class="page-content">
      <h1>Employment services portal (demo page)</h1>
      <!-- Your page content -->
    </div>
  </div>

  <script src="./lex-web-ui-loader.min.js"></script>
  <script>
    (function () {
      var origin = window.location.origin;
      var loaderOpts = {
        baseUrl: origin + '/',
        shouldLoadConfigFromEvent: false,
        shouldLoadConfigFromJsonFile: false,
        shouldLoadMinDeps: true,
      };
      var IframeLoader = window.ChatBotUiLoader.IframeLoader;
      var iframeLoader = new IframeLoader(loaderOpts);
      
      // ⭐ Fetch your config JSON
      fetch(origin + '/lex-web-ui-loader-config.json')
        .then(function (r) { return r.json(); })
        .then(function (cfg) {
          cfg.ui = cfg.ui || {};
          cfg.iframe = cfg.iframe || {};
          
          // ⭐ Set same-origin
          cfg.ui.parentOrigin = origin;
          cfg.iframe.iframeOrigin = origin;
          
          // ⭐ FORCE EXPANDED (not minimized)
          cfg.iframe.shouldLoadIframeMinimized = false;
          
          return iframeLoader.load(cfg);
        })
        .then(function () { console.log('right-panel: Lex iframe ready'); })
        .catch(function (e) { console.error(e); });
    })();
  </script>
</body>
</html>
```

### 4c. Create/Update Config JSON

**Location:** `src/website/lex-web-ui-loader-config.json`

**Action:** Copy your config exactly (replace credentials with your values):

```json
{
  "region": "us-east-1",
  "cognito": {
    "poolId": "us-east-1:YOUR-COGNITO-POOL-ID",
    "appUserPoolClientId": "YOUR-CLIENT-ID",
    "appUserPoolName": "YOUR-POOL-NAME",
    "appDomainName": "your-domain.auth.us-east-1.amazoncognito.com",
    "aws_cognito_region": "us-east-1",
    "region": "us-east-1"
  },
  "lex": {
    "v2BotId": "YourBotName",
    "v2BotAliasId": "YourBotAlias",
    "v2BotLocaleId": "en_US",
    "initialText": "Welcome! I am your assistant.",
    "initialSpeechInstruction": "Ask a question below.",
    "region": "us-east-1"
  },
  "ui": {
    "parentOrigin": "http://localhost:8000",
    "toolbarTitle": "Your Bot Title",
    "toolbarColor": "#1e3a5f",
    "textInputPlaceholder": "Message...",
    "defaultQuickReplies": [
      { "text": "Option 1", "value": "Option 1" },
      { "text": "Option 2", "value": "Option 2" },
      { "text": "Option 3", "value": "Option 3" }
    ],
    "enableLogin": false,
    "enableLiveChat": false,
    "enableUpload": false,
    "AllowSuperDangerousHTMLInMessage": true
  },
  "iframe": {
    "iframeOrigin": "http://localhost:8000",
    "shouldLoadIframeMinimized": true,
    "iframeSrcPath": "/index.html#/?lexWebUiEmbed=true"
  }
}
```

---

## 🚀 STEP 5: Build & Run Forked Repo

### 5a. Install Dependencies
```bash
cd aws-lex-web-ui
npm install
```

### 5b. Install Web App Dependencies
```bash
cd lex-web-ui
npm install
cd ../..
```

### 5c. Start Development Server
```bash
# Option 1: Full build
npm start

# Option 2: Watch mode
npm run dev

# Option 3: Just the web UI
cd lex-web-ui && npm run dev
```

### 5d. Build for Production
```bash
npm run build
```

---

## 🔍 STEP 6: Test Right-Panel

### 6a. Check URLs

After running `npm start`, verify these work:

```bash
# Full page version
http://localhost:8000/index.html

# Right-panel version (YOUR CUSTOM VERSION)
http://localhost:8000/right-panel.html

# Config file is served from
http://localhost:8000/lex-web-ui-loader-config.json
```

### 6b. Test Functionality

In right-panel.html:
- [ ] Panel appears on right side (not full page)
- [ ] Has smooth animation when loading (opacity + slide)
- [ ] Is expanded by default (not minimized circle)
- [ ] Can type messages
- [ ] Lex bot responds
- [ ] Quick reply buttons appear
- [ ] Can minimize to circle (bottom-right)
- [ ] Clicking circle expands again

### 6c: Check Console Logs

Open DevTools (F12) → Console tab:
```
✓ "right-panel: Lex iframe ready"  ← Should see this
```

---

## 📁 STEP 7: File Comparison Table

| Aspect | Original AWS | Your Changes |
|--------|-------------|-------------|
| **File Location** | `src/website/index.html` | `src/website/right-panel.html` |
| **Layout** | Full page | Floating right panel |
| **Width** | 100% | 380-420px |
| **Position** | Fills screen | Fixed right (12px) |
| **Load State** | Minimized (default) | **Expanded** (forced) |
| **Animation** | None | Opacity + Transform |
| **Config Loading** | Event-based | JSON file fetch |
| **CSS Framework** | Minimal | Full Maggi pattern |
| **Same-origin** | Optional | Forced set |

---

## 🔑 STEP 8: Critical Code Snippets You Must Keep

### ⭐ The Override (MOST IMPORTANT)
```javascript
cfg.iframe.shouldLoadIframeMinimized = false;  // ← Must have this!
```
**Why?** Without this, panel starts minimized. With it, panel starts expanded and ready to chat.

### ⭐ The Animation State Classes
```css
/* Hidden state (before show) */
.lex-web-ui-iframe {
  opacity: 0;
  transform: translate3d(16px, 0, 0) scale(0.98);
}

/* Visible state (after show) */
.lex-web-ui-iframe.lex-web-ui-iframe--show {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  pointer-events: auto;
}
```

### ⭐ The Config Fetch Pattern
```javascript
fetch(origin + '/lex-web-ui-loader-config.json')
  .then(r => r.json())
  .then(cfg => {
    // Apply overrides here
    return iframeLoader.load(cfg);
  })
```

---

## 🐛 STEP 9: Troubleshooting Common Issues

### Issue 1: "lex-web-ui-loader.min.js not found"
**Cause:** Loader files not built  
**Fix:** 
```bash
npm install
npm run build
npm start
```

### Issue 2: Panel doesn't appear
**Cause:** Config path wrong or CSS not loaded  
**Fix:**
```bash
# Verify config loads:
curl http://localhost:8000/lex-web-ui-loader-config.json

# Verify CSS loads:
curl http://localhost:8000/lex-web-ui-loader.min.css
```

### Issue 3: Panel loads but stays minimized
**Cause:** Missing override line  
**Fix:** Check `cfg.iframe.shouldLoadIframeMinimized = false;` is in JavaScript

### Issue 4: Cognito errors
**Cause:** Wrong credentials in config  
**Fix:**
```bash
# Verify these in .env or lex-web-ui-loader-config.json:
- poolId (copy from AWS Cognito)
- appUserPoolClientId (copy from Cognito app client)
- appDomainName (your Cognito domain)
```

### Issue 5: Lex doesn't respond
**Cause:** Bot ID/Alias wrong  
**Fix:**
```bash
# Verify in AWS Lex Console:
- v2BotId (exact bot name)
- v2BotAliasId (exact alias name)
- v2BotLocaleId (usually "en_US")
```

---

## 📤 STEP 10: Commit & Push Changes

### 10a. Stage Changes
```bash
git add .
git status  # Review changes
```

### 10b. Commit with Message
```bash
git commit -m "feat: Add right-panel customization with Maggi-style floating panel

- Added right-panel.html with CSS animations
- Added lex-web-ui-loader-config.json with Cognito & Lex config
- Override shouldLoadIframeMinimized to false for expanded default
- Smooth opacity and transform transitions
- Responsive design (380-420px width)"
```

### 10c. Push to Your Fork
```bash
git push -u origin right-panel-customization
```

### 10d. (Optional) Create Pull Request
```
Title: Right-panel Customization with Maggi-style Floating Panel
Description: Adds customizable right-panel.html for side-by-side chat UX
```

---

## ✨ STEP 11: Production Deployment

### 11a. Build for Production
```bash
npm run build
# Creates dist/ folder with optimized files
```

### 11b. Deploy to S3 + CloudFront
```bash
# Option 1: Using AWS CLI
aws s3 sync dist/ s3://your-bucket-name/

# Option 2: Using AWS Console
# Upload dist/ contents to S3 bucket
# CloudFront will serve from S3
```

### 11c: Update Domain Configuration
```json
{
  "iframe": {
    "iframeOrigin": "https://your-domain.com",
    "parentOrigin": "https://your-domain.com"
  }
}
```

---

## 🎯 Quick Reference: What Changed vs Original

| Component | Original | Your Version |
|-----------|----------|-------------|
| **HTML File** | `index.html` (full page) | `right-panel.html` (floating panel) |
| **Width** | 100% | 380-420px |
| **Position** | Center | Right side (12px gap) |
| **Start State** | Minimized circle | Expanded panel |
| **Animation** | None | Slide + fade-in |
| **Config** | Event-driven | JSON file |
| **Override** | None | `shouldLoadIframeMinimized = false` |
| **CSS** | Default | Full custom Maggi pattern |

---

## 📞 If You Get Stuck

1. **Check browser console** (F12) for errors
2. **Check network tab** to see if config loads
3. **Compare with original** `index.html` 
4. **Verify AWS credentials** in config
5. **Run `npm install && npm run build`** to rebuild

---

## ✅ Final Checklist

- [ ] Forked AWS repo
- [ ] Created right-panel.html with CSS
- [ ] Created lex-web-ui-loader-config.json
- [ ] Added `shouldLoadIframeMinimized = false` override
- [ ] Updated AWS credentials in config
- [ ] Ran `npm install` and `npm run build`
- [ ] Tested on localhost:8000/right-panel.html
- [ ] Verified bot responds
- [ ] Tested minimize/expand
- [ ] Committed changes to git

**Done!** You now have a production-ready right-panel Lex integration! 🎉
