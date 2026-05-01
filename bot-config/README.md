# Bot Configuration Guide

This folder contains all bot-specific AWS configuration for the Lex Web UI right-panel.

## Files

- **`config.json`** — Main AWS & UI configuration (required)
- **`bot-icon.png`** — Bot avatar image displayed in toolbar

## Configuration Sections

### `cognito` (Required)
AWS Cognito identity pool and user pool credentials for authentication.

| Field | Required | Description |
|-------|----------|-------------|
| `poolId` | Yes | Cognito identity pool ID (format: `region:uuid`) |
| `appUserPoolClientId` | Yes | User pool client ID for app authentication |
| `appUserPoolName` | Yes | User pool name |
| `appDomainName` | Yes | Cognito domain for hosted UI |
| `aws_cognito_region` | Yes | AWS region for Cognito |

**Example:**
```json
"cognito": {
  "poolId": "us-east-1:b68dbaae-9e23-473f-8b67-172e768bbb69",
  "appUserPoolClientId": "114kdhfikmi74o70ghotcs9e1",
  "appUserPoolName": "us-east-1_KmURihHrR",
  "appDomainName": "your-cognito-domain.auth.us-east-1.amazoncognito.com",
  "aws_cognito_region": "us-east-1"
}
```

### `lex` (Required)
AWS Lex v2 bot configuration.

| Field | Required | Description |
|-------|----------|-------------|
| `v2BotId` | Yes | Lex v2 bot ID |
| `v2BotAliasId` | Yes | Bot alias (e.g., "TSTALIASID" for production) |
| `v2BotLocaleId` | Yes | Bot locale (e.g., "en_US") |
| `initialText` | No | Welcome message shown when chat opens |
| `initialSpeechInstruction` | No | Voice instruction for voice input |
| `region` | Yes | AWS region where bot is deployed |
| `allowStreamingResponses` | No | Enable streaming (false for standard) |

**Example:**
```json
"lex": {
  "v2BotId": "Testing_Bot",
  "v2BotAliasId": "TSTALIASID",
  "v2BotLocaleId": "en_US",
  "initialText": "Welcome! How can I help?",
  "region": "us-east-1",
  "allowStreamingResponses": false
}
```

### `ui` (Required)
User interface configuration including onboarding, toolbar, and branding.

#### Essential UI Fields

| Field | Type | Description |
|-------|------|-------------|
| `parentOrigin` | string | Parent page origin (e.g., `http://localhost:8000`) |
| `pageTitle` | string | Title displayed in browser tab |
| `toolbarTitle` | string | Title shown in toolbar |
| `toolbarColor` | string | Toolbar background color (hex) |
| `toolbarLogo` | string | Path to toolbar logo image |
| `showToolbarStatus` | boolean | Show "Online" status indicator |
| `toolbarMinimizeButtonIcon` | string | Icon when minimized (e.g., "close", "arrow_drop_down") |

#### Onboarding Form

| Field | Type | Description |
|-------|------|-------------|
| `showOnboardingForm` | boolean | **true** = show PII form before chat |
| `onboardingWelcomeTitle` | string | Form title (e.g., "Welcome!") |
| `onboardingWelcomeSubtitle` | string | Form subtitle |
| `onboardingFirstNameLabel` | string | First name field label |
| `onboardingLastNameLabel` | string | Last name field label |
| `onboardingEmailLabel` | string | Email field label (optional) |
| `onboardingTermsUrl` | string | URL to terms page (optional, shows link in form) |
| `onboardingTermsLinkText` | string | Text for terms link |
| `onboardingTermsBeforeLink` | string | Text before link (e.g., "I have read and agree to the ") |
| `onboardingTermsAfterLink` | string | Text after link |
| `onboardingStartButtonText` | string | Button text to proceed (e.g., "Start Chatting") |
| `onboardingPrimaryColor` | string | Primary color for form (hex) |
| `onboardingRememberCompletion` | boolean | Remember if user already filled form |

#### Quick Replies

| Field | Type | Description |
|-------|------|-------------|
| `defaultQuickReplies` | array | Quick reply buttons shown in chat |

**Example:**
```json
"defaultQuickReplies": [
  { "text": "Account locked", "value": "Account locked" },
  { "text": "Help", "value": "Help" },
  { "text": "Payment status", "value": "Payment status" }
]
```

#### Other UI Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enableLogin` | boolean | false | Show login/logout buttons |
| `enableLiveChat` | boolean | false | Enable live chat to agent (requires Connect) |
| `enableUpload` | boolean | false | Allow file upload |
| `enableSFX` | boolean | false | Enable sound effects |
| `saveHistory` | boolean | false | Save chat history in localStorage |
| `directFocusToBotInput` | boolean | false | Auto-focus chat input |

### `iframe` (Required)
Iframe embedding configuration.

| Field | Required | Description |
|-------|----------|-------------|
| `iframeOrigin` | Yes | Origin where iframe will be served |
| `shouldLoadIframeMinimized` | No | Start UI minimized (true/false) |
| `iframeSrcPath` | Yes | Path to iframe HTML entry point |

**Example:**
```json
"iframe": {
  "iframeOrigin": "http://localhost:8000",
  "shouldLoadIframeMinimized": true,
  "iframeSrcPath": "/web-lex-standalone/index.html#/?lexWebUiEmbed=true"
}
```

## AWS Setup Requirements

### Cognito
1. Create identity pool in AWS Cognito
2. Create user pool and app client
3. Configure hosted domain
4. Copy credentials to `cognito` section

### Lex v2
1. Create Lex v2 bot in AWS
2. Create bot alias (e.g., "TSTALIASID" for testing)
3. Create intent and deploy
4. Copy bot ID, alias ID, locale to `lex` section

### Permissions
The Cognito identity should have IAM policy allowing:
- `lex:RecognizeText`
- `lex:PostText` (deprecated but may be needed)
- `lex:PostContent` (for voice)

## Customization Tips

### Change Bot Greeting
Edit `lex.initialText`:
```json
"initialText": "Hi there! Ask me anything about your account."
```

### Customize Toolbar
```json
"toolbarTitle": "Your Bot Name",
"toolbarColor": "#1e3a5f",
"toolbarLogo": "/bot-config/your-logo.png"
```

### Enable PII Onboarding
```json
"showOnboardingForm": true,
"onboardingWelcomeTitle": "Welcome!",
"onboardingWelcomeSubtitle": "Please provide your information:"
```

### Change Button Style
```json
"toolbarMinimizeButtonIcon": "close",  // Material icon name
"onboardingPrimaryColor": "#1e3a5f"    // Hex color
```

## Testing

After updating `config.json`:

1. Restart server: `npm start`
2. Open browser: `http://localhost:8000/right-panel.html`
3. Verify chat loads with new settings
4. Check browser console for errors

## Troubleshooting

**Chat not loading?**
- Check Cognito credentials are correct
- Verify Lex bot is deployed
- Check browser console for errors

**Onboarding not showing?**
- Verify `showOnboardingForm: true`
- Clear browser localStorage (might be cached)

**Colors not updating?**
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Verify hex color format (e.g., "#1e3a5f")
