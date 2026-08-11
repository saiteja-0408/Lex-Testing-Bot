# Right-Panel UI Customization Guide

## Overview

This guide explains the custom "Maggi-style" right-panel chatbot UI implementation used in this project. It details what changed from the upstream AWS Lex Web UI, how configuration and defaults work, the complete end-to-end flow, and operational guidance for product and deployment teams.

---

## 1. UI Changes: What Changed, Where, and Why

### High-Level Summary

You replaced the default upstream example parent page with a custom floating right-hand chat panel featuring smooth animations and programmatic configuration control. The user-facing changes prioritize modern UX and controlled startup behavior.

### Concrete UI Differences

#### **Floating Rounded Panel**
- **What:** The chatbot appears as a floating rounded rectangle in the bottom-right corner, not a static boxed iframe.
- **Where:** Defined in [src/website/right-panel.html](src/website/right-panel.html) — the CSS block starting with `.lex-web-ui-iframe { ... }`.
- **Key styles applied:**
  - `min-width: 380px` / `max-width: 420px` — fixed width, responsive to viewport
  - `border-radius: 12px` — rounded corners
  - `box-shadow: 0 12px 40px rgba(15, 30, 60, 0.18)` — soft, elevated shadow
  - `top: 12px`, `bottom: 12px`, `right: 12px` — positioned in bottom-right with padding from edge

#### **Smooth Open/Close Animations**
- **What:** Instead of instantly appearing, the panel fades and slides in from the right with a slight scale effect.
- **CSS transitions applied:**
  ```css
  transition:
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s ease,
    border-radius 0.4s ease,
    max-width 0.45s ease,
    max-height 0.45s ease,
    min-width 0.45s ease;
  ```
- **Initial hidden state:** `opacity: 0`, `transform: translate3d(16px, 0, 0) scale(0.98)`, `pointer-events: none`
- **Shown state (class `.lex-web-ui-iframe--show`):** `opacity: 1`, `transform: translate3d(0, 0, 0) scale(1)`, `pointer-events: auto`
- **Why:** Modern UX pattern; users expect smooth transitions rather than jarring pop-ins.

#### **Minimized Button Look**
- **What:** When the user minimizes the chat, the panel shrinks to a 68px circular button instead of staying as a rectangle.
- **CSS for minimized state (class `.lex-web-ui-iframe--minimize`):**
  - `width: 68px`, `height: 68px`, `min-width: 68px`, `max-width: 68px`
  - `border-radius: 999px` — makes it circular
  - Different shadow: `box-shadow: 0 12px 28px rgba(15, 30, 60, 0.24)`
  - Inner iframe also gets `border-radius: 85px`
- **Why:** Looks like a modern chat bubble; minimizes UI footprint while remaining accessible.

#### **Same-Origin Communication**
- **What:** The JavaScript code forces both parent and iframe origins to `window.location.origin`.
- **Where:** In [src/website/right-panel.html](src/website/right-panel.html) inside the fetch `.then()` callback:
  ```javascript
  cfg.ui.parentOrigin = origin;
  cfg.iframe.iframeOrigin = origin;
  ```
- **Why:** Ensures secure postMessage communication between parent page and iframe without cross-origin restrictions during local testing or same-domain hosting.

#### **Programmatic Config Fetch & Override**
- **What:** Instead of letting the loader automatically read the config JSON, the parent page explicitly fetches it, modifies it, then passes it to the loader.
- **Where:** The fetch and chain in [src/website/right-panel.html](src/website/right-panel.html) (lines ~145–157):
  ```javascript
  fetch(origin + '/lex-web-ui-loader-config.json')
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      // Page modifies config here
      cfg.iframe.shouldLoadIframeMinimized = false;
      return iframeLoader.load(cfg);
    })
  ```
- **Why:** Grants the parent page centralized control over initial behavior (e.g., forcing expanded or minimized, overriding text, controlling features) without modifying the JSON file. This is safer for deployments where product teams want to change default behavior.

---

## 2. Default Enable/Disable Settings: Local vs. Upstream

### Upstream AWS Lex Web UI Defaults

| Setting | Default | Behavior |
|---------|---------|----------|
| `shouldLoadConfigFromEvent` | `false` | Loader does NOT wait for event-based config override |
| `shouldLoadConfigFromJsonFile` | `true` | Loader automatically fetches config from `./lex-web-ui-loader-config.json` |
| `shouldLoadMinDeps` | Depends on build (prod: `true`, dev: `false`) | Controls whether minified or unminified dependencies are loaded |
| `iframe.shouldLoadIframeMinimized` | `true` (upstream defaults to minimized if undefined) | Panel starts in minimized (small bubble) state |
| **UI Styling** | Default loader CSS | Iframe appears as large fixed box, bottom-right, with basic styling |
| **Initial iframe visibility** | `display: none` until loader toggles `.lex-web-ui-iframe--show` | Panel is hidden until iframe ready |

### Your Local Configuration Changes

| Setting | Your Value | Change Reason |
|---------|-----------|----------------|
| `shouldLoadConfigFromEvent` | `false` | Same as upstream (no change) |
| `shouldLoadConfigFromJsonFile` | **`false`** | **You fetch JSON manually** — lets page intercept/modify config before UI loads |
| `shouldLoadMinDeps` | **`true`** | **Explicitly set** — ensures production (minified) dependencies in all environments |
| `iframe.shouldLoadIframeMinimized` | **`false`** (overridden in script) | **Forced expanded on load** — page starts in full panel view, not minimized |
| **UI Styling** | **Custom CSS overrides** | **Your page applies Maggi-style CSS** — overrides default positioning, sizing, animations, rounded corners |
| **Initial iframe visibility** | **`opacity: 0` + animation** | **Pre-visible with transition** — page sets `display: flex` and uses opacity/transform for smooth entrance |

### Configuration File: [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json)

Key settings in your local JSON (note: some are overridden by the page script):

```json
{
  "iframe": {
    "iframeOrigin": "http://localhost:8000",
    "shouldLoadIframeMinimized": true,      // ← OVERRIDDEN by page script to false
    "iframeSrcPath": "/index.html#/?lexWebUiEmbed=true"
  },
  "ui": {
    "toolbarTitle": "Testing BOT",
    "toolbarColor": "#1e3a5f",
    "showToolbarStatus": true,
    "toolbarMinimizeButtonIcon": "close",
    "defaultQuickReplies": [
      { "text": "Account locked", "value": "Account locked" },
      // ... more quick replies
    ],
    // ... other UI options
  },
  "lex": {
    "v2BotId": "Testing_Bot",
    "initialText": "Welcome! I am Testing BOT...",
    // ... Lex-specific config
  },
  "cognito": {
    "poolId": "us-east-1:b68dbaae-9e23-473f-8b67-...",
    // ... Cognito settings
  }
}
```

**Important:** The page JavaScript overrides `shouldLoadIframeMinimized` to `false`, ensuring the panel opens expanded regardless of what the JSON says.

---

## 3. End-to-End Flow: From Page Load to Chat Ready

### Step-by-Step Sequence

#### **Phase 1: Page Load & Initialization (0–100ms)**

1. **Browser opens `/right-panel.html`**
   - Static HTML loads; CSS is parsed and applied.
   - The page CSS sets `.lex-web-ui-iframe` to `opacity: 0`, `transform: translate3d(16px, 0, 0) scale(0.98)`, `pointer-events: none` — container is hidden but ready to animate.

2. **Loader script tag is parsed**
   - `<script src="./lex-web-ui-loader.min.js"></script>` is loaded.
   - Global `window.ChatBotUiLoader` object becomes available with `FullPageLoader` and `IframeLoader` constructors.

3. **Page script initializes loader options**
   ```javascript
   var loaderOpts = {
     baseUrl: origin + '/',
     shouldLoadConfigFromEvent: false,
     shouldLoadConfigFromJsonFile: false,  // ← Page will fetch manually
     shouldLoadMinDeps: true,
   };
   var iframeLoader = new ChatBotUiLoader.IframeLoader(loaderOpts);
   ```

#### **Phase 2: Config Fetch & Mutation (~100–200ms)**

4. **Page fetches config JSON**
   ```javascript
   fetch(origin + '/lex-web-ui-loader-config.json')
   ```
   - Browser makes HTTP GET to `/lex-web-ui-loader-config.json`.
   - Response includes bot IDs, Cognito pool IDs, UI text, quick replies, toolbar colors, etc.

5. **Page parses JSON and modifies it**
   ```javascript
   .then(function (cfg) {
     cfg.ui = cfg.ui || {};
     cfg.iframe = cfg.iframe || {};
     cfg.ui.parentOrigin = origin;           // Force same-origin
     cfg.iframe.iframeOrigin = origin;       // Force same-origin
     cfg.iframe.shouldLoadIframeMinimized = false;  // Force expanded
     return iframeLoader.load(cfg);
   })
   ```
   - Page ensures `cfg.ui` and `cfg.iframe` objects exist.
   - Page sets origins to current page origin (`window.location.origin`).
   - Page forces panel to start expanded (not minimized).
   - Page passes modified config to loader.

#### **Phase 3: Loader Setup (~200–500ms)**

6. **Loader merges config and validates**
   - Loader internally calls `ConfigLoader.mergeConfig()` to combine defaults with passed config.
   - Loader validates that required fields are present (iframeOrigin, iframeSrcPath, parentOrigin, shouldLoadIframeMinimized).

7. **Loader initializes iframe container**
   - Loader creates a `<div>` with class `lex-web-ui-iframe` and appends it to `document.body`.
   - Your page CSS immediately targets this div and applies styling (rounded, shadow, transitions, opacity: 0, transform: translate3d...).

8. **Loader injects iframe element**
   - Loader creates `<iframe>` element with:
     - `src`: `${iframeOrigin}${iframeSrcPath}` = `http://localhost:8000/index.html#/?lexWebUiEmbed=true`
     - `frameBorder="0"`
     - `scrolling="no"`
     - `title="chatbot"`
     - `allow="microphone"` (for voice input in cross-origin scenarios)
   - Iframe is appended to the container div.

9. **Loader sets up message listeners**
   - Loader sets up `document.addEventListener('lexWebUiMessage', ...)` to receive postMessage events from iframe.
   - Loader prepares handlers for iframe-to-parent events: `ready`, `getCredentials`, `initIframeConfig`, `toggleMinimizeUi`, `updateLexState`, etc.

#### **Phase 4: Iframe Content Load (~500–1000ms)**

10. **Browser loads iframe src**
    - Iframe navigates to `/index.html#/?lexWebUiEmbed=true`.
    - This page loads Vue.js, Vuetify, Vuex, AWS SDK, and the Lex Web UI component.
    - The `?lexWebUiEmbed=true` query string signals to the component that it's running embedded in an iframe.

11. **Iframe component mounts**
    - Vue component (`LexWeb.vue`) initializes state in Vuex store.
    - Component detects `isRunningEmbedded = true` based on URL query string.
    - Component checks config for `shouldLoadIframeMinimized`; if false (your case), it skips the minimize on init.
    - Component sets up AWS Cognito credentials using the pool ID from config.
    - Component initializes Lex Runtime client with configured bot ID and region.

12. **Iframe sends "ready" postMessage**
    - Once component is ready, iframe sends: `{ event: 'ready' }` via `window.parent.postMessage()`.
    - Parent loader receives this in `onMessageFromIframe()`.

#### **Phase 5: API Setup & Show (~1000–1200ms)**

13. **Loader receives iframe "ready" signal**
    - Parent's handler processes the `ready` event.
    - Loader marks iframe as ready (`isChatBotReady = true`).

14. **Loader initializes parent-to-iframe API**
    - Loader sets up `this.api` object with methods:
      - `ping()` — test connectivity
      - `postText(message)` — send text to bot
      - `toggleMinimizeUi()` — minimize/maximize panel
      - `setSessionAttribute(key, value)` — update session state
      - `deleteSession()` — clear chat history
      - etc.
    - Loader sends `parentReady` event to iframe to signal parent is ready.

15. **Loader shows iframe container**
    - Loader calls `toggleShowUiClass()`, which adds class `lex-web-ui-iframe--show` to the container div.
    - **Your page CSS detects this class change:**
      ```css
      .lex-web-ui-iframe.lex-web-ui-iframe--show {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        pointer-events: auto;
      }
      ```
    - **CSS transitions animate from hidden to visible:**
      - Opacity fades from 0 to 1 (450ms, custom easing)
      - Transform slides from `translate3d(16px, 0, 0) scale(0.98)` to `translate3d(0, 0, 0) scale(1)` (450ms)
      - Panel smoothly enters from the right with a slight scale pop.

#### **Phase 6: Chat Ready (~1200ms onwards)**

16. **Parent page receives completion**
    ```javascript
    .then(function () { console.log('right-panel: Lex iframe ready'); })
    ```
    - Parent's load promise resolves.
    - Console logs success.

17. **User can interact with chat**
    - User types in input field (inside iframe).
    - Iframe sends text to Lex via AWS SDK.
    - Lex responds; iframe displays response and optional response cards.
    - User can click quick replies, toggle minimize button, etc.
    - All iframe state changes trigger postMessage events to parent (for logging, analytics, or parent-side updates).

18. **Minimize/Maximize behavior**
    - User clicks minimize button in iframe toolbar.
    - Iframe sends `toggleMinimizeUi` event to parent.
    - Parent's handler calls `toggleMinimizeUiClass()`, which toggles class `lex-web-ui-iframe--minimize` on container.
    - **Your page CSS applies minimize styles:**
      ```css
      .lex-web-ui-iframe--minimize {
        width: 68px !important;
        height: 68px !important;
        border-radius: 999px !important;
        /* ... */
      }
      ```
    - Panel shrinks to circular button (68px) with animation.
    - Last state is saved to `localStorage` using Cognito client ID as key.
    - On next page load, `showIframe()` checks localStorage; if last state was minimized, it applies minimize class on init.

---

## 4. Guide for Non-Technical Stakeholders

### Executive Summary

**What:** We've modernized the Lex chatbot widget from a plain box to a polished floating chat panel that appears on the right side of pages with smooth animations and smart default behavior.

**Why:** Users expect modern, responsive chat experiences. This implementation provides a professional-looking assistant that doesn't distract from page content and feels cohesive with enterprise portals.

**Impact:** Better user engagement and a more modern feel with centralized control over initial behavior for product teams.

---

### What Changed Visually

#### **Before (Upstream Default)**
- Chatbot appears as a static, large box in bottom-right corner.
- Instantly visible (no animation).
- May start minimized (small bubble) by default depending on browser state.
- Generic styling with basic shadow.

#### **After (Your Customization)**
- Chatbot appears as a polished, rounded floating panel in bottom-right corner with:
  - Smooth fade-in and slide animation (450ms).
  - Elevated, modern shadow effect.
  - Minimum 380px width, maximum 420px width — fits nicely without taking up entire page.
  - Always starts expanded (full panel) on first load.
- When minimized:
  - Panel shrinks to a circular button (68px).
  - Animated transition (450ms).
  - Looks like a modern chat bubble.

### Key Operational Concepts

#### **1. Configuration Control**

**What:** The page JavaScript reads the config file and makes decisions *before* the chat starts. This means you can programmatically override settings centrally.

**Example:** Currently, the page forces `shouldLoadIframeMinimized = false`, so the chat always opens expanded on first load. If you want it minimized by default, change this one line in the page script.

**Where to edit:** [src/website/right-panel.html](src/website/right-panel.html), line ~154:
```javascript
cfg.iframe.shouldLoadIframeMinimized = false;  // Change to 'true' to start minimized
```

#### **2. Text & Branding**

**Where to edit:** [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json)

**Fields you can change:**
- `ui.toolbarTitle`: Text at the top of the chat panel (currently "Testing BOT")
- `ui.toolbarColor`: Toolbar background color (currently "#1e3a5f", a dark blue)
- `lex.initialText`: Welcome message shown when chat opens
- `ui.defaultQuickReplies`: Array of suggested quick-reply buttons
- `ui.textInputPlaceholder`: Placeholder text in message input box
- `ui.onboardingWelcomeTitle` / `onboardingWelcomeSubtitle`: If onboarding form is shown, these titles appear

**Example:** To change welcome message:
```json
"lex": {
  "initialText": "Hi! I'm your new assistant. How can I help today?"
}
```

#### **3. Appearance & Animation**

**Where to edit:** [src/website/right-panel.html](src/website/right-panel.html), CSS block (lines ~35–105)

**Key properties you can adjust:**
- `min-width: 380px` — minimum panel width; increase for wider panels
- `max-width: 420px` — maximum panel width; increase for even wider
- `border-radius: 12px` — corner roundness; increase (e.g., to 20px) for rounder corners
- `box-shadow: 0 12px 40px rgba(15, 30, 60, 0.18)` — shadow effect; adjust last value (0.18) for shadow opacity
- Transition durations (currently 450ms); change to make animations faster/slower
- `right: 12px`, `bottom: 12px` — distance from right and bottom edges; adjust for different positioning

**Example:** To make the panel wider:
```css
.lex-web-ui-iframe {
  min-width: 400px !important;
  max-width: 500px !important;
}
```

---

### Deployment Checklist

Use this checklist when deploying the right-panel customization to production or new environments.

#### **Pre-Deployment (Local Testing)**
- [ ] Verify the page opens `/right-panel.html` and the chat panel appears on the right.
- [ ] Confirm the panel animates in smoothly (fade + slide from right).
- [ ] Test on different screen sizes (desktop, tablet, mobile) to ensure responsive behavior.
- [ ] Verify the panel doesn't cover critical page content or buttons.
- [ ] Test the minimize button; confirm the panel shrinks to a circular button.
- [ ] Test the maximize button; confirm the panel expands back to full size.
- [ ] Verify quick-reply buttons work and send utterances to the bot.
- [ ] Test voice input (microphone icon) if enabled; ensure iframe has `allow="microphone"` attribute.

#### **Configuration Validation**
- [ ] Review [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json):
  - [ ] Correct Cognito pool ID and client ID are set.
  - [ ] Correct Lex bot ID and region are set.
  - [ ] Toolbar title, colors, and initial text match branding.
  - [ ] Quick-reply buttons are updated for your bot's intents.
- [ ] Review [src/website/right-panel.html](src/website/right-panel.html):
  - [ ] Confirm `cfg.iframe.shouldLoadIframeMinimized` matches desired initial state (default: false).
  - [ ] Confirm `baseUrl` is set to the correct origin (localhost for dev, your domain for prod).

#### **Cross-Origin & Security (if hosting on CDN/S3)**
- [ ] If hosting iframe assets on a separate domain (e.g., CloudFront/S3), update:
  - [ ] `cfg.iframe.iframeOrigin` to your CDN domain.
  - [ ] `cfg.ui.parentOrigin` to your parent site domain.
- [ ] Ensure both domains have compatible CORS policies.
- [ ] Test postMessage communication between parent and iframe on cross-origin setup.
- [ ] Verify SSL/TLS certificates are valid on both domains.

#### **Functional Testing**
- [ ] Test initial utterance: send a test message to the bot and verify Lex responds.
- [ ] Test Cognito authentication: if login is enabled, test the full auth flow.
- [ ] Test response cards: if your bot returns response cards, verify they render and buttons work.
- [ ] Test session attributes: verify session data persists across messages.
- [ ] Test localStorage: verify minimize state is remembered after page refresh.

#### **Performance & Analytics**
- [ ] Monitor network waterfall: confirm dependencies load in correct order.
- [ ] Check browser console for JavaScript errors or warnings.
- [ ] Verify CSS transitions are smooth (not janky) on target devices.
- [ ] Set up analytics/logging to track chat usage, minimize/maximize events, and utterance frequency.

#### **Deployment Steps**
1. **Stage Environment:**
   - Deploy to staging server/CDN.
   - Run full checklist above.
   - Invite product team for sign-off.

2. **Production Rollout:**
   - Deploy to production CDN/server.
   - Monitor for errors in first hour (check CloudWatch, error logs).
   - Be ready to roll back if critical issues arise (have previous version tagged in version control).

3. **Post-Deployment:**
   - Document any overrides or customizations in your wiki/knowledge base.
   - Update runbooks for on-call team to handle common issues (e.g., config fetch failures, iframe load timeouts).

---

## 5. Frequently Asked Questions (FAQ)

### **Q: Why fetch the config ourselves instead of letting the loader do it?**
**A:** By fetching and modifying config in the page, you gain centralized control. The page can programmatically override settings (e.g., disable minimize on init) without editing JSON files. This is safer for deployments and allows product teams to quickly toggle features without engineering involvement.

### **Q: Can we host the iframe files on a CDN and keep this look?**
**A:** Yes. However, you must:
1. Update `cfg.iframe.iframeOrigin` to your CDN domain (e.g., `https://my-cdn.cloudfront.net`).
2. Ensure `cfg.ui.parentOrigin` is set to your parent site domain (e.g., `https://mysite.com`).
3. Configure CORS and postMessage origins correctly in config.
4. The CSS styling will work the same; the custom CSS is applied by the parent page and applies to all iframes, regardless of their origin.

### **Q: Does this change Lex bot behavior?**
**A:** No. This customization only affects UI appearance, animations, and startup behavior. The Lex bot logic, intents, slots, and responses remain unchanged. The bot is still powered by your AWS Lex configuration and Lambda functions.

### **Q: How do we change the initial "Welcome" message?**
**A:** Edit [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json), field `lex.initialText`:
```json
"lex": {
  "initialText": "Your custom welcome message here"
}
```
Then restart the server. The message will appear when the chat first loads.

### **Q: How do we make the panel start minimized by default?**
**A:** Edit [src/website/right-panel.html](src/website/right-panel.html), line ~154:
```javascript
cfg.iframe.shouldLoadIframeMinimized = true;  // Change from 'false' to 'true'
```
Or, alternatively, edit the JSON config to set `iframe.shouldLoadIframeMinimized` to `true` and remove the override line in the page script.

### **Q: What happens if the config JSON fails to load?**
**A:** The page script has a `.catch()` handler that logs the error to console. The chat will not load. To debug:
1. Open browser DevTools → Console.
2. Check for fetch errors (CORS, 404, network timeout).
3. Verify the JSON file exists at the expected path.
4. Verify the server is running and reachable.
5. Check baseUrl in loaderOpts.

### **Q: Does minimize state persist across page reloads?**
**A:** Yes, with caveats:
- The component stores last minimize state in `localStorage` using a key based on Cognito client ID.
- On next page load, the loader checks localStorage and applies the saved state.
- However, the page script forces `shouldLoadIframeMinimized = false` on initial load, so the first load always opens expanded.
- On refresh, the localStorage value is respected (so it remembers minimize state if you minimized, then reloaded).

### **Q: Can we change the animation speed?**
**A:** Yes. Edit the CSS `transition` property in [src/website/right-panel.html](src/website/right-panel.html):
```css
.lex-web-ui-iframe {
  transition:
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),  /* Change 0.45s to, e.g., 0.2s for faster */
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    /* ... */
  ;
}
```
Smaller values = faster animation; larger values = slower animation.

### **Q: How do we disable animations for accessibility?**
**A:** The CSS includes a `@media (prefers-reduced-motion: reduce)` rule that disables transitions for users who request reduced motion in their OS settings. This is already implemented and compliant.

### **Q: What if we want to add custom JavaScript event handling?**
**A:** The parent page can listen for events from the iframe using:
```javascript
document.addEventListener('lexWebUiMessage', function(evt) {
  if (evt.detail && evt.detail.event === 'updateLexState') {
    console.log('Lex state updated:', evt.detail.state);
    // Handle custom logic here
  }
});
```
Common events: `updateLexState` (bot state changed), `toggleMinimizeUi`, `toggleIsLoggedIn`, etc.

---

## 6. File Reference

| File | Purpose | Notes |
|------|---------|-------|
| [src/website/right-panel.html](src/website/right-panel.html) | Main parent page with custom CSS and loader script | Contains all UI styling and loader initialization logic |
| [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json) | Runtime config (bot IDs, Cognito settings, UI text) | Edit this to change branding, quick-replies, initial text, etc. |
| [web-lex-standalone/right-panel.html](web-lex-standalone/right-panel.html) | Standalone build copy (same as src/website) | Used for pre-built deployments |
| [dist/right-panel.html](dist/right-panel.html) | Distribution build copy | Output of build process; deployed to production |
| [src/website/index.html](src/website/index.html) | Full-page variant (for comparison) | Upstream-style full-page example; not customized |
| [server.js](server.js) | Local dev server | Serves files on http://localhost:8000 |

---

## 7. Troubleshooting

### **Issue: Chat panel doesn't appear**
- **Cause 1:** Config JSON failed to load (fetch error).
  - **Fix:** Check browser console for fetch errors. Verify JSON file exists at expected path. Check CORS and server status.
- **Cause 2:** Loader failed to initialize iframe.
  - **Fix:** Check console for IframeLoader errors. Verify iframe src is correct. Check browser network tab for iframe load status.
- **Cause 3:** CSS not applied.
  - **Fix:** Verify lex-web-ui-loader.min.css is loaded. Check browser DevTools → Elements to confirm `.lex-web-ui-iframe` container exists and has correct styles.

### **Issue: Animations are janky or stuttering**
- **Cause:** GPU rendering issue or heavy JS on page.
- **Fix:** Reduce animation duration in CSS (currently 450ms; try 200ms). Check if other JS is blocking UI thread. Use browser DevTools → Performance to profile.

### **Issue: Chat is minimized on first load (but we want it expanded)**
- **Cause:** Override line `cfg.iframe.shouldLoadIframeMinimized = false;` is missing or set to `true`.
- **Fix:** Check [src/website/right-panel.html](src/website/right-panel.html), line ~154. Ensure it's set to `false`.

### **Issue: Cross-origin errors when iframe is on different domain**
- **Cause:** postMessage origins not configured correctly.
- **Fix:** Verify `cfg.ui.parentOrigin` and `cfg.iframe.iframeOrigin` match actual parent and iframe domains. Check browser console for postMessage errors.

### **Issue: Cognito login fails**
- **Cause:** Cognito pool ID or client ID is incorrect; callback URLs not whitelisted.
- **Fix:** Verify Cognito pool ID and client ID in config JSON. In Cognito console, check that your app's callback URLs (sign-in and sign-out) include the parent page domain.

---

## 8. Advanced Customization

### **Changing Panel Size**
Edit CSS in [src/website/right-panel.html](src/website/right-panel.html):
```css
.lex-web-ui-iframe {
  min-width: 400px !important;  /* Wider minimum */
  max-width: 500px !important;  /* Wider maximum */
  height: calc(100vh - 40px) !important;  /* Taller (more padding from top/bottom) */
}
```

### **Changing Minimized Button Size**
Edit:
```css
.lex-web-ui-iframe--minimize {
  width: 80px !important;
  height: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  min-height: 80px !important;
  max-height: 80px !important;
  border-radius: 999px !important;
}
```

### **Adding Page Content Behind Chat Panel**
Wrap your page content in a div with left padding:
```html
<div style="padding-right: 450px;">
  <!-- Your page content goes here -->
</div>
```
This ensures content doesn't hide behind the 420px-wide chat panel.

### **Dark Mode Support**
Add a dark mode variant of CSS:
```css
@media (prefers-color-scheme: dark) {
  .page-shell {
    background: #1a202c;
    color: #e2e8f0;
  }
  .lex-web-ui-iframe {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  }
}
```

---

## 9. Support & Questions

For issues or questions:
1. Check the **FAQ** section above.
2. Check the **Troubleshooting** section.
3. Review **browser console** for JavaScript errors.
4. Check **network tab** in DevTools to see if all resources load.
5. Consult the upstream [AWS Lex Web UI documentation](https://github.com/aws-samples/aws-lex-web-ui) for component-level questions.

---

## 10. README parity: implementation checklist (fresh fork)

The following checklist matches [README_RIGHT_PANEL_CUSTOMIZATION.md](README_RIGHT_PANEL_CUSTOMIZATION.md) and groups every area you must touch to reach **full parity** with this fork. Use it as a migration order; details and copy/paste snippets are in **§18** below.

1. **Page + runtime config** — [src/website/right-panel.html](src/website/right-panel.html), [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json), [src/website/custom-chatbot-style.css](src/website/custom-chatbot-style.css)
2. **Onboarding + chat UI behavior (PII flow)** — [lex-web-ui/src/components/LexWeb.vue](lex-web-ui/src/components/LexWeb.vue), [lex-web-ui/src/components/OnboardingForm.vue](lex-web-ui/src/components/OnboardingForm.vue), [lex-web-ui/src/components/DefaultQuickReplies.vue](lex-web-ui/src/components/DefaultQuickReplies.vue), [lex-web-ui/src/components/ToolbarContainer.vue](lex-web-ui/src/components/ToolbarContainer.vue), [lex-web-ui/src/config/index.js](lex-web-ui/src/config/index.js)
3. **Loader / iframe behavior fixes** — [src/dependencies/initiate-loader.js](src/dependencies/initiate-loader.js), [src/lex-web-ui-loader/js/defaults/loader.js](src/lex-web-ui-loader/js/defaults/loader.js), [src/lex-web-ui-loader/js/lib/iframe-component-loader.js](src/lex-web-ui-loader/js/lib/iframe-component-loader.js)
4. **Build + serve pipeline** — [build/copy-assets.js](build/copy-assets.js), [lex-web-ui/scripts/post-build-css.js](lex-web-ui/scripts/post-build-css.js), [server.js](server.js), root [package.json](package.json), [lex-web-ui/package.json](lex-web-ui/package.json) (if the fork is missing the same deps)
5. **Optional parent debug page** — [src/website/parent.html](src/website/parent.html)

**Also read:** [docs/right-panel-implementation-playbook.md](docs/right-panel-implementation-playbook.md) (upstream fork porting), [docs/FORK-KNOWLEDGE-TRANSFER.md](docs/FORK-KNOWLEDGE-TRANSFER.md) (architecture), [docs/online-status-indicator.md](docs/online-status-indicator.md) (toolbar 3-state status).

---

## 11. High-level recap (README alignment)

Compared to stock `aws-samples/aws-lex-web-ui`, this fork behaves like a **productized right assistant**:

- Bot opens as a **polished right-side floating panel** (responsive: `clamp` / `dvh`, full-screen on small viewports — see live CSS in [right-panel.html](src/website/right-panel.html), not only the older 380–420px figures called out earlier in §1).
- **Pre-chat onboarding** (PII + terms) when `ui.showOnboardingForm` is true.
- **Quick replies** as chips; **toolbar** branding and **connection status** (Offline / Connecting… / Online) when implemented per [docs/online-status-indicator.md](docs/online-status-indicator.md).
- **Build + server** tuned to serve custom pages from `dist/` and optional `/bot-config` assets.

---

## 12. File-by-file change map (README §2)

### A. Page entry / host pages

| File | Changes | Impact |
|------|---------|--------|
| [src/website/right-panel.html](src/website/right-panel.html) | Full page shell, right floating iframe CSS, fetch-based config, same-origin `parentOrigin` / `iframeOrigin`, default expanded | Defines host look and startup |
| [src/website/parent.html](src/website/parent.html) | Can stay as debug page or be aligned with right-panel | Diagnostics vs production-like shell |
| [src/website/custom-chatbot-style.css](src/website/custom-chatbot-style.css) | Toolbar, messages, quick replies, input theming | Branding inside the iframe app |

### B. Runtime config

| File | Changes | Impact |
|------|---------|--------|
| [src/config/lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json) | Cognito, Lex V2 IDs, UI, iframe, onboarding strings, quick replies | Main switchboard; wrong values break startup or Lex |

### C. Lex UI components (inside iframe)

| File | Changes | Impact |
|------|---------|--------|
| [lex-web-ui/src/components/OnboardingForm.vue](lex-web-ui/src/components/OnboardingForm.vue) | PII fields, terms, validation, `complete` / `close` | Pre-chat UX |
| [lex-web-ui/src/components/LexWeb.vue](lex-web-ui/src/components/LexWeb.vue) | Onboarding gate, session attributes on complete, layout for quick replies, **no auto-minimize** after onboarding (this fork) | Orchestrates onboarding → chat |
| [lex-web-ui/src/components/DefaultQuickReplies.vue](lex-web-ui/src/components/DefaultQuickReplies.vue) | Chip strip, bounded height / scroll | Avoids overlap with input |
| [lex-web-ui/src/components/ToolbarContainer.vue](lex-web-ui/src/components/ToolbarContainer.vue) | Branded toolbar, status line, **3-state dot** when Vuex `connectionStatus` is wired | Header UX |
| [lex-web-ui/src/config/index.js](lex-web-ui/src/config/index.js) | Defaults for optional UI keys | Avoids undefined config |

### D. Loader and embed behavior

| File | Changes | Impact |
|------|---------|--------|
| [src/dependencies/initiate-loader.js](src/dependencies/initiate-loader.js) | Align with embedded config expectations | Startup |
| [src/lex-web-ui-loader/js/defaults/loader.js](src/lex-web-ui-loader/js/defaults/loader.js) | e.g. `shouldIgnoreConfigWhenEmbedded: false` so iframe keeps full config | Prevents config loss in embed mode |
| [src/lex-web-ui-loader/js/lib/iframe-component-loader.js](src/lex-web-ui-loader/js/lib/iframe-component-loader.js) | Null-safe localStorage keys for minimize state | Fewer edge-case crashes |

### E. Build + serve

| File | Changes | Impact |
|------|---------|--------|
| [build/copy-assets.js](build/copy-assets.js) | Copy `right-panel.html`, `custom-chatbot-style.css` → `dist/` | Without this, `dist/` misses custom pages |
| [lex-web-ui/scripts/post-build-css.js](lex-web-ui/scripts/post-build-css.js) | CSS post-processing robustness | Reliable CSS after Vite build |
| [server.js](server.js) | ESM static server: `dist/`, `src/config/`, optional `/bot-config`, `/web-lex-standalone` | Local URL for right-panel |
| [package.json](package.json), [lex-web-ui/package.json](lex-web-ui/package.json) | Scripts / deps for the workflow | Reproducible install |

---

## 13. Required files to copy into a fresh fork (README §3)

Copy from **this** repository (sources, not hand-edited `dist/`):

- `src/website/right-panel.html`
- `src/website/custom-chatbot-style.css`
- `src/config/lex-web-ui-loader-config.json` (replace placeholders for your account)
- `lex-web-ui/src/components/OnboardingForm.vue`
- `lex-web-ui/src/components/DefaultQuickReplies.vue`
- `lex-web-ui/src/components/LexWeb.vue`
- `lex-web-ui/src/components/ToolbarContainer.vue`
- `lex-web-ui/src/config/index.js`
- `src/dependencies/initiate-loader.js`
- `src/lex-web-ui-loader/js/defaults/loader.js`
- `src/lex-web-ui-loader/js/lib/iframe-component-loader.js`
- `build/copy-assets.js`
- `lex-web-ui/scripts/post-build-css.js`
- `server.js`
- `package.json`
- `lex-web-ui/package.json`

---

## 14. Local run commands (README §4)

From repo root:

```bash
cd lex-web-ui
npm install
npm run build-dist
cd ..
npm install
node build/copy-assets.js
npm start
```

Open: `http://localhost:8000/right-panel.html`  
Optional: `http://localhost:8000/parent.html`

---

## 15. Common issues and fixes (README §5)

Use together with **§7 Troubleshooting** above.

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| White / blank page | Missing or stale `dist/` bundles | Re-run `npm run build-dist`, `node build/copy-assets.js`, restart server |
| `missing cognito poolId config` | Invalid / empty Cognito in JSON | Fix [lex-web-ui-loader-config.json](src/config/lex-web-ui-loader-config.json) |
| Bot loads but “unable to process your message” | Lex IAM, alias, locale, or bot ID mismatch | Verify `v2BotId`, `v2BotAliasId`, `v2BotLocaleId` vs Lex console; check Cognito unauth role for Lex runtime |
| Quick-reply chips overlap input | Reserved height too small | Align [LexWeb.vue](lex-web-ui/src/components/LexWeb.vue) toolbar height calcs and [DefaultQuickReplies.vue](lex-web-ui/src/components/DefaultQuickReplies.vue) `max-height` / `bottom` (see **§18** snippets) |

---

## 16. Notes on behavior (README §6)

- Onboarding shows when `ui.showOnboardingForm` is `true`.
- Terms behavior is implemented in `OnboardingForm.vue`; closing may map to minimize in `LexWeb.vue` depending on your branch.
- Quick replies send the configured **`value`** string to Lex as the user message (labels are display-only).

---

## 17. Summary (README §7)

This customization spans **host page**, **runtime JSON**, **Vue components**, **loader**, and **build/serve**. All layers are required for **full parity** when cloning a fresh upstream fork; for **iframe shell only**, see the smaller scope in [docs/right-panel-implementation-playbook.md](docs/right-panel-implementation-playbook.md) (Tier A vs Tier B).

---

## 18. Exact replacements — copy/paste guide (README §8)

This is the “do this exactly” section: what to ensure exists in key files. **Why this helps** lines mirror the README style.

### A) `src/website/right-panel.html` (or aligned `parent.html`)

**Loader options** must include:

```js
var loaderOpts = {
  baseUrl: origin + '/',
  shouldLoadConfigFromEvent: false,
  shouldLoadConfigFromJsonFile: false,
  shouldLoadMinDeps: true,
};
```

**Load logic** (fetch, patch origins, force expanded). You may add `cfg.iframe.iframeSrcPath` here for redundancy; this fork also sets it in JSON:

```js
fetch(origin + '/lex-web-ui-loader-config.json')
  .then(function (r) { return r.json(); })
  .then(function (cfg) {
    cfg.ui = cfg.ui || {};
    cfg.iframe = cfg.iframe || {};
    cfg.ui.parentOrigin = origin;
    cfg.iframe.iframeOrigin = origin;
    // Optional if already in JSON:
    // cfg.iframe.iframeSrcPath = '/index.html#/?lexWebUiEmbed=true';
    cfg.iframe.shouldLoadIframeMinimized = false;
    return iframeLoader.load(cfg);
  });
```

**Why this helps:** avoids brittle event-only config handoff and guarantees same-origin + expanded startup.

### B) `src/config/lex-web-ui-loader-config.json`

Ensure required keys exist (replace placeholders for your environment):

```json
{
  "region": "us-east-1",
  "cognito": {
    "poolId": "us-east-1:REPLACE_ME",
    "appUserPoolClientId": "REPLACE_ME"
  },
  "lex": {
    "v2BotId": "REPLACE_ME",
    "v2BotAliasId": "REPLACE_ME",
    "v2BotLocaleId": "en_US",
    "region": "us-east-1"
  },
  "ui": {
    "showOnboardingForm": true,
    "showToolbarStatus": true,
    "toolbarStatusText": "Online",
    "toolbarMinimizeButtonIcon": "close"
  },
  "iframe": {
    "iframeOrigin": "http://localhost:8000",
    "iframeSrcPath": "/index.html#/?lexWebUiEmbed=true"
  }
}
```

**Why this helps:** drives onboarding, toolbar, iframe URL, and Lex connectivity.

### C) `lex-web-ui/src/components/LexWeb.vue`

- Mount onboarding and gate chat with `!showOnboarding` (see README for `v-if` pattern).
- **Quick-reply overlap:** in the style section, reserve enough vertical space (e.g. adjust `calc(... - 140px)` vs `- 100px`) for `.toolbar-height-sm` / `-md` / `-lg` so chips do not cover the input.

**Why this helps:** chat stays hidden until onboarding completes; layout matches quick-reply strip height.

### D) `lex-web-ui/src/components/DefaultQuickReplies.vue`

Keep the strip bounded and scrollable, for example:

```css
.lex-default-quick-replies {
  bottom: 56px;
  max-height: 140px;
  overflow-y: auto;
}
```

**Why this helps:** aligns with reserved space in `LexWeb.vue`.

### E) `lex-web-ui/src/components/ToolbarContainer.vue`

**Minimum** (config-driven “Online” label from README):

```vue
<div v-if="showToolbarStatus" class="toolbar-maggi-status">
  <span class="toolbar-maggi-status-dot" aria-hidden="true"></span>
  <span class="toolbar-maggi-status-text">{{ toolbarStatusText }}</span>
</div>
```

**This fork’s extension:** dynamic dot + **Offline / Connecting… / Online** via `:class="connectionDotClass"` and `displayToolbarStatusText` — see [docs/online-status-indicator.md](docs/online-status-indicator.md) and Vuex `lex.connectionStatus` in `state.js` / `mutations.js` / `actions.js`.

**Why this helps:** branding and optional live connection feedback from the Lex call lifecycle.

### F) `src/dependencies/initiate-loader.js` and `src/lex-web-ui-loader/js/defaults/loader.js`

Set:

```js
shouldIgnoreConfigWhenEmbedded: false
```

**Why this helps:** embedded iframe mode keeps Cognito / Lex / UI fields from the merged config.

### G) `src/lex-web-ui-loader/js/lib/iframe-component-loader.js`

Guard `this.config.cognito && this.config.cognito.appUserPoolClientId` before building localStorage keys; read/write only when the key exists.

**Why this helps:** avoids crashes when client ID is absent.

### H) `build/copy-assets.js`

Website copy list must include:

```js
const websiteFiles = ['custom-chatbot-style.css', 'right-panel.html'];
```

**Why this helps:** `npm start` serves `dist/right-panel.html` after each copy.

### I) `server.js`

Serve at least `dist/` and `src/config/` (same-origin assets). Add `/bot-config` if JSON references `/bot-config/...` for logos.

**Why this helps:** avoids 404s for config and optional static icons.

---

## 19. Build, copy, run after replacements (README §9)

```bash
cd lex-web-ui
npm run build-dist
cd ..
node build/copy-assets.js
npm start
```

Hard-refresh the browser (`Cmd+Shift+R` on macOS) after changes. Source edits under `src/website` or `lex-web-ui/src` do not affect the running site until the bundle is rebuilt and website files are copied into `dist/`.

---

## 20. Document map

| Doc | Role |
|-----|------|
| [README_RIGHT_PANEL_CUSTOMIZATION.md](README_RIGHT_PANEL_CUSTOMIZATION.md) | Short README-style overview + exact §8 snippets |
| This guide (`RIGHT_PANEL_CUSTOMIZATION_GUIDE.md`) | Deep flow, stakeholder section, FAQ, troubleshooting, **and README §10–20 extensions** |
| [docs/right-panel-implementation-playbook.md](docs/right-panel-implementation-playbook.md) | Porting `right-panel.html` onto a **vanilla upstream** clone (Tier A / B) |

---

**Last Updated:** May 4, 2026  
**Version:** 1.1  
**Status:** Production Ready
