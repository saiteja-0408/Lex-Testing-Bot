# 📋 Exact Files to Copy (Complete Content)

## FILE 1: right-panel.html
**Location in forked repo:** `src/website/right-panel.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sample site — Maggi-style Lex panel (right)</title>
  <link href="./lex-web-ui-loader.min.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    /* Page behind the widget (resembles a service portal) */
    .page-shell {
      min-height: 100vh;
      background: linear-gradient(180deg, #e3eef8 0%, #f5f7fb 40%, #fff 100%);
    }
    .page-content {
      padding: 2.5rem 28rem 2.5rem 2rem;
      max-width: 52rem;
    }
    @media (max-width: 900px) {
      .page-content { padding: 1.5rem 1rem 1.5rem 1rem; }
    }
    .page-content h1 {
      font-size: 1.75rem;
      color: #1a365c;
      margin: 0 0 0.75rem 0;
      font-weight: 700;
    }
    .page-content p { color: #4a5568; line-height: 1.6; margin: 0 0 1rem 0; }
    .page-cards { display: grid; gap: 1rem; margin-top: 1.5rem; }
    @media (min-width: 600px) { .page-cards { grid-template-columns: 1fr 1fr; } }
    .page-card {
      background: #fff;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .page-card h2 { font-size: 0.95rem; color: #2d3748; margin: 0 0 0.5rem 0; }
    .page-card p { font-size: 0.875rem; margin: 0; }
    .page-hint {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 2rem;
    }
    /* Maggi-style: floating panel + smooth open / resize (overrides display:none from loader) */
    .lex-web-ui-iframe {
      min-width: 380px !important;
      max-width: 420px !important;
      width: min(400px, 100vw) !important;
      height: calc(100vh - 24px) !important;
      max-height: none !important;
      top: 12px !important;
      bottom: 12px !important;
      right: 12px !important;
      margin: 0 !important;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(15, 30, 60, 0.18) !important;
      display: flex !important;
      align-items: stretch;
      justify-content: stretch;
      opacity: 0;
      transform: translate3d(16px, 0, 0) scale(0.98);
      pointer-events: none;
      filter: blur(0);
      transition:
        opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.4s ease,
        border-radius 0.4s ease,
        max-width 0.45s ease,
        max-height 0.45s ease,
        min-width 0.45s ease;
    }
    .lex-web-ui-iframe.lex-web-ui-iframe--show {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
      pointer-events: auto;
    }
    .lex-web-ui-iframe--minimize {
      top: auto !important;
      bottom: 18px !important;
      right: 18px !important;
      left: auto !important;
      width: 68px !important;
      height: 68px !important;
      min-width: 68px !important;
      max-width: 68px !important;
      min-height: 68px !important;
      max-height: 68px !important;
      border-radius: 999px !important;
      box-shadow: 0 12px 28px rgba(15, 30, 60, 0.24) !important;
    }
    .lex-web-ui-iframe iframe {
      border-radius: 12px !important;
    }
    .lex-web-ui-iframe.lex-web-ui-iframe--minimize iframe {
      border-radius: 85px !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .lex-web-ui-iframe,
      .lex-web-ui-iframe--minimize {
        transition: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-shell">
    <div class="page-content">
      <h1>Employment services portal (demo page)</h1>
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
      fetch(origin + '/lex-web-ui-loader-config.json')
        .then(function (r) { return r.json(); })
        .then(function (cfg) {
          cfg.ui = cfg.ui || {};
          cfg.iframe = cfg.iframe || {};
          cfg.ui.parentOrigin = origin;
          cfg.iframe.iframeOrigin = origin;
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

---

## FILE 2: lex-web-ui-loader-config.json
**Location in forked repo:** `src/website/lex-web-ui-loader-config.json`

⚠️ **REPLACE these with YOUR values:**
- `poolId` → Your Cognito Pool ID
- `appUserPoolClientId` → Your Cognito Client ID
- `appDomainName` → Your Cognito Domain
- `v2BotId` → Your Lex Bot Name
- `v2BotAliasId` → Your Lex Bot Alias

```json
{
  "region": "us-east-1",
  "cognito": {
    "poolId": "us-east-1:YOUR-POOL-ID-HERE",
    "appUserPoolClientId": "YOUR-CLIENT-ID-HERE",
    "appUserPoolName": "us-east-1_YourPoolName",
    "appDomainName": "your-cognito-domain.auth.us-east-1.amazoncognito.com",
    "aws_cognito_region": "us-east-1",
    "region": "us-east-1"
  },
  "lex": {
    "v2BotId": "YourBotName",
    "v2BotAliasId": "YourBotAlias",
    "v2BotLocaleId": "en_US",
    "initialText": "Welcome! I am your Unemployment claim assistant.\n\nYou can choose an option or enter your question below.",
    "initialSpeechInstruction": "Ask a question or choose a quick action below.",
    "initialUtterance": "",
    "reInitSessionAttributesOnRestart": false,
    "region": "us-east-1",
    "retryOnLexPostTextTimeout": false,
    "retryCountPostTextTimeout": 1,
    "allowStreamingResponses": false
  },
  "ui": {
    "parentOrigin": "http://localhost:8000",
    "pageTitle": "Your Bot Name",
    "textInputPlaceholder": "Message...",
    "toolbarColor": "#1e3a5f",
    "toolbarTitle": "Your Bot Title",
    "toolbarLogo": "",
    "showOnboardingForm": true,
    "showToolbarStatus": true,
    "toolbarStatusText": "Online",
    "toolbarMinimizeButtonIcon": "close",
    "toolbarShowDefaultAvatar": true,
    "toolbarAvatarColor": "#2c5282",
    "defaultQuickReplies": [
      { "text": "Account locked", "value": "Account locked" },
      { "text": "Appeal status", "value": "Appeal status" },
      { "text": "Payment status", "value": "Payment status" },
      { "text": "Forgot password", "value": "Forgot password" },
      { "text": "Overpayment balance", "value": "Overpayment balance" },
      { "text": "Frequently asked questions", "value": "Frequently asked questions" }
    ],
    "onboardingWelcomeTitle": "Welcome!",
    "onboardingWelcomeSubtitle": "Please fill out information below!",
    "onboardingFirstNameLabel": "First Name (Required)",
    "onboardingLastNameLabel": "Last Name (Required)",
    "onboardingEmailLabel": "Email (Optional)",
    "onboardingTermsUrl": "https://aws.amazon.com/service-terms/",
    "onboardingTermsLinkText": "Terms and services",
    "onboardingTermsBeforeLink": "I have read and agree to the ",
    "onboardingTermsAfterLink": " in regards to the use of personal information in this chat bot.",
    "onboardingStartButtonText": "Start Chatting",
    "onboardingAgentAvatarUrl": "",
    "onboardingPrimaryColor": "#1e3a5f",
    "onboardingRememberCompletion": false,
    "toolbarStartLiveChatLabel": "Start Live Chat",
    "toolbarEndLiveChatLabel": "End Live Chat",
    "toolbarStartLiveChatIcon": "people_alt",
    "toolbarEndLiveChatIcon": "call_end",
    "positiveFeedbackIntent": "Thumbs up",
    "negativeFeedbackIntent": "Thumbs down",
    "helpIntent": "Help",
    "minButtonContent": "",
    "avatarImageUrl": "",
    "backButton": false,
    "messageMenu": false,
    "hideButtonMessageBubble": false,
    "enableLogin": false,
    "enableLiveChat": false,
    "forceLogin": false,
    "enableUpload": false,
    "uploadS3BucketName": "",
    "AllowSuperDangerousHTMLInMessage": true,
    "shouldDisplayResponseCardTitle": false,
    "saveHistory": false,
    "helpContent": {},
    "enableSFX": false,
    "hideInputFieldsForButtonResponse": false,
    "pushInitialTextOnRestart": false,
    "directFocusToBotInput": false,
    "showDialogStateIcon": false
  },
  "iframe": {
    "iframeOrigin": "http://localhost:8000",
    "shouldLoadIframeMinimized": true,
    "iframeSrcPath": "/index.html#/?lexWebUiEmbed=true"
  }
}
```

---

## 🎯 Key Differences Explained

### CSS Section: Animation Classes

| Class | Purpose |
|-------|---------|
| `.lex-web-ui-iframe` | Default state: hidden (opacity:0), positioned right |
| `.lex-web-ui-iframe.lex-web-ui-iframe--show` | Visible state: animated in (opacity:1) |
| `.lex-web-ui-iframe--minimize` | Minimized state: becomes 68x68 circle |

### JavaScript Section: The Override

```javascript
// ⭐ THIS LINE IS CRITICAL ⭐
cfg.iframe.shouldLoadIframeMinimized = false;
```

This line forces the panel to open **expanded** instead of starting as a minimized circle.

**Without it:** Panel starts as tiny circle → User clicks to expand  
**With it:** Panel starts full-size → Better UX

### Config JSON: Key Fields

| Field | Description | Example |
|-------|-------------|---------|
| `cognito.poolId` | Identity pool from AWS Cognito | `us-east-1:xxxxx-xxxxx` |
| `cognito.appUserPoolClientId` | Client app from Cognito | `114kdhfikmi74o70ghotcs9e1` |
| `lex.v2BotId` | Your Lex bot name | `Testing_Bot` |
| `lex.v2BotAliasId` | Alias for bot (same or different) | `ALIZAA` or bot name |
| `ui.toolbarColor` | Hex color of chat header | `#1e3a5f` |
| `ui.defaultQuickReplies` | Predefined message buttons | Array of objects |
| `iframe.shouldLoadIframeMinimized` | Should start minimized? | `false` for expanded |

---

## ✅ Copy Checklist

### Before You Copy:

- [ ] You have the official AWS repo forked
- [ ] You're in the forked repo directory
- [ ] You're on the `right-panel-customization` branch

### Copy These Files:

- [ ] Copy entire content of `right-panel.html` above
- [ ] Paste into `src/website/right-panel.html` (create if missing)
- [ ] Copy entire JSON config above
- [ ] Paste into `src/website/lex-web-ui-loader-config.json` (create if missing)

### Update Config Values:

- [ ] Find your Cognito Pool ID → Replace `YOUR-POOL-ID-HERE`
- [ ] Find your Cognito Client ID → Replace `YOUR-CLIENT-ID-HERE`
- [ ] Find your Cognito Domain → Replace `your-cognito-domain...`
- [ ] Find your Lex Bot Name → Replace `YourBotName`
- [ ] Find your Lex Bot Alias → Replace `YourBotAlias`

---

## 🚀 After Copying:

```bash
# In forked repo root
npm install
npm run build
npm start

# Open browser
http://localhost:8000/right-panel.html

# Should see: Panel on right, smooth animation, chat works! ✓
```

---

## 🔗 Where to Find Your AWS Values

### Cognito Pool ID
```
AWS Console → Cognito → User Pools → Select your pool
→ Copy "Pool ID" (format: region:uuid)
```

### Cognito Client ID
```
AWS Console → Cognito → User Pools → Select pool
→ App clients → Find your app client
→ Copy "Client ID"
```

### Cognito Domain
```
AWS Console → Cognito → User Pools → Select pool
→ Domain name → Copy full domain
(format: your-domain.auth.region.amazoncognito.com)
```

### Lex Bot ID
```
AWS Console → Lex → Bots → Find your bot
→ Copy exact bot name from list
```

### Lex Bot Alias
```
AWS Console → Lex → Your Bot → Aliases
→ Copy alias name (or use bot name if no alias)
```

---

That's it! These are the **only two files** you need to copy! 🎉
