# ⚡ Quick Start Checklist: Right-Panel Implementation

## 📋 Copy-Paste Commands (Run These in Order)

### PHASE 1: Fork & Clone (5 minutes)
```bash
# 1. Go to GitHub and fork
# https://github.com/aws-samples/aws-lex-web-ui → Click "Fork"

# 2. Clone YOUR fork
git clone https://github.com/YOUR-USERNAME/aws-lex-web-ui.git
cd aws-lex-web-ui

# 3. Create branch
git checkout -b right-panel-customization
```

### PHASE 2: Copy Your Files (2 minutes)

#### File 1: right-panel.html
**Copy from:** `src/website/right-panel.html` (your current repo)  
**Paste to:** `src/website/right-panel.html` (forked repo)

#### File 2: Config JSON
**Copy from:** `src/config/lex-web-ui-loader-config.json` (your current repo)  
**Paste to:** `src/website/lex-web-ui-loader-config.json` (forked repo)

```bash
# Do these in forked repo:
cp /path/to/current/src/website/right-panel.html src/website/right-panel.html
cp /path/to/current/src/config/lex-web-ui-loader-config.json src/website/lex-web-ui-loader-config.json
```

### PHASE 3: Install & Build (3-5 minutes)
```bash
# In forked repo root
npm install
cd lex-web-ui && npm install && cd ..
npm run build
npm start
```

### PHASE 4: Test (2 minutes)
```bash
# Open browser
http://localhost:8000/right-panel.html

# Check console (F12)
# Should see: "right-panel: Lex iframe ready" ✓
```

### PHASE 5: Commit & Push (1 minute)
```bash
git add .
git commit -m "feat: Add right-panel customization"
git push -u origin right-panel-customization
```

---

## 🎯 The 3 Most Important Things

### 1️⃣ The CSS Animation
```css
.lex-web-ui-iframe {
  opacity: 0;
  transform: translate3d(16px, 0, 0) scale(0.98);
  transition: opacity 0.45s, transform 0.45s;
}

.lex-web-ui-iframe.lex-web-ui-iframe--show {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}
```
**Why:** Makes panel slide in smoothly from right

---

### 2️⃣ The Override Line (CRITICAL!)
```javascript
cfg.iframe.shouldLoadIframeMinimized = false;
```
**Why:** Forces panel to open expanded (not minimized circle)

---

### 3️⃣ The Config Fetch
```javascript
fetch(origin + '/lex-web-ui-loader-config.json')
  .then(r => r.json())
  .then(cfg => {
    cfg.iframe.shouldLoadIframeMinimized = false;  // ← This line!
    return iframeLoader.load(cfg);
  })
```
**Why:** Loads your Lex bot configuration from JSON

---

## ✅ Verification Checklist

- [ ] Panel appears on **right side** of page
- [ ] Panel is **380-420px wide**
- [ ] Panel has **smooth animation** when loading
- [ ] Panel **starts expanded** (not minimized)
- [ ] Can **type messages**
- [ ] **Bot responds** to messages
- [ ] **Quick reply buttons** show
- [ ] Can **minimize to circle** (bottom-right)
- [ ] **Circle icon** is 68x68px
- [ ] Clicking circle **expands panel again**
- [ ] **No errors** in console (F12)

---

## 🐛 If Something's Wrong

| Problem | Fix |
|---------|-----|
| **Panel doesn't appear** | Run `npm run build` again |
| **Panel is minimized** | Check `shouldLoadIframeMinimized = false` line |
| **No bot response** | Verify AWS credentials in config JSON |
| **Config not loading** | Check network tab in F12 → see if JSON loads |
| **CSS not applied** | Hard refresh browser (Cmd+Shift+R on Mac) |

---

## 📂 File Structure After Changes

```
forked-aws-lex-web-ui/
├── src/
│   └── website/
│       ├── right-panel.html                    ← NEW (your custom)
│       ├── lex-web-ui-loader-config.json      ← NEW (your config)
│       ├── index.html                          ← Original
│       ├── lex-web-ui-loader.min.js           ← Built
│       └── lex-web-ui-loader.min.css          ← Built
├── lex-web-ui/
│   └── src/
│       ├── App.vue
│       ├── components/
│       └── store/
├── package.json
├── npm start runs on port 8000
└── All built files go to dist/
```

---

## 🚀 Once You Verify It Works Locally

### Deploy to Production

#### Option A: S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/

# CloudFront auto-updates
```

#### Option B: Direct Hosting
```bash
# Use npm start in production with PM2
npm install -g pm2
pm2 start server.js --name "lex-web-ui"
```

---

## 📞 Support Resources

| Issue | Where to Look |
|-------|---|
| Browser errors | F12 → Console tab |
| Network errors | F12 → Network tab → see if config.json loads |
| AWS errors | Check AWS IAM permissions |
| Cognito errors | Verify pool ID in config |
| Lex bot not responding | Check bot alias in config |

---

## 🎓 What's Actually Happening

```
User Opens right-panel.html
         ↓
Page Loads (CSS already hidden: opacity=0)
         ↓
JavaScript fetches config.json
         ↓
Override: shouldLoadIframeMinimized = false
         ↓
Lex loader creates iframe
         ↓
Browser detects new iframe (has class .lex-web-ui-iframe--show)
         ↓
CSS animation triggers (opacity: 0→1, transform)
         ↓
Panel slides in from right with fade effect
         ↓
User sees beautiful floating panel ready to chat ✨
```

---

## 🎯 Success Indicators

✅ **Green flags:**
- Console shows no errors
- Panel appears on right side within 1-2 seconds
- Has smooth slide-in animation
- Can type and bot responds
- Minimize button works
- Refreshing page shows animation again

❌ **Red flags:**
- Console has red errors
- Panel doesn't appear
- Appears as full page (not right panel)
- Appears minimized (circle) instead of expanded
- No animation
- Bot doesn't respond

---

## 🔄 Update Loop

Every time you want to update:

```bash
# Pull latest from upstream (optional)
git fetch upstream
git rebase upstream/main

# Make changes
# Test locally: npm start

# Commit
git add .
git commit -m "your message"

# Push to fork
git push
```

---

**That's it! You're ready to go! 🚀**

Any questions? Check FORK_AND_APPLY_CHANGES_GUIDE.md for detailed explanations.
