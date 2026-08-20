# Changes needed in `reemploy-usa-core`
# Based on actual LibConstants.ts, chatbot.service.ts, and loader source analysis
# ─────────────────────────────────────────────────────────────────────────────
#
# NOTE: FullPageLoader has been removed from this repo entirely.
# window.ChatBotUiLoader now only exposes { IframeLoader }.
# FullPageLoader, FullPageComponentLoader, optionsFullPage, dependenciesFullPage,
# and lex-web-ui-fullpage.css have all been deleted from src/.
# The Angular app ONLY ever uses IframeLoader — this is intentional.
# ─────────────────────────────────────────────────────────────────────────────

# ═══════════════════════════════════════════════════════════════════════════
# FILE 1: LibConstants.ts  — ALREADY DONE ✅
# ═══════════════════════════════════════════════════════════════════════════
#
# You already have these 3 lines — NO CHANGES NEEDED:
#
#   chatbotProvider: window["env"]["chatbotProvider"] || "lex",
#   lexAssetsBase:   window["env"]["lexAssetsBase"]   || "/assets/lex/",
#   lexWebSdkUrl:    window["env"]["lexWebSdkUrl"]    || "http://localhost:8000",
#
# ✅ Trailing slash is NOT required — the IframeLoader source auto-appends it:
#   (index.js line 78-80): if baseUrl doesn't end with "/" it appends one.
#   So "http://localhost:8000" works exactly as well as "http://localhost:8000/"


# ═══════════════════════════════════════════════════════════════════════════
# FILE 2: script.const.ts  — ADD lexImportUrls
# ═══════════════════════════════════════════════════════════════════════════
#
# The IframeLoader loads its own CSS/JS dependencies internally from baseUrl.
# The ONLY thing the service needs to inject is the loader library itself.
#
# Add this static property alongside the existing importUrls:

  static lexImportUrls = [
    {
      // Registers window.ChatBotUiLoader — served by the reusa-lex-ui Express server
      url:   'web-lex-standalone/lex-web-ui-loader.min.js',
      type:  ScriptConstant.jsProperty,   // same 'js' string used by Kore entries
      async: false,   // MUST be false — openBotLex() calls window.ChatBotUiLoader in onload
    },
  ];

# NOTE: chat-frame.css and lex-web-ui-loader.min.css are already wired into
# angular.json styles[] so they are globally loaded — no entry needed here.


# ═══════════════════════════════════════════════════════════════════════════
# FILE 3: chatbot.service.ts — REPLACE openBotLex() only
# ═══════════════════════════════════════════════════════════════════════════
#
# ROOT CAUSE of the bug in current openBotLex():
#
#   new (window as any).ChatBotUiLoader.IframeLoader(...)
#
#   This line runs SYNCHRONOUSLY but window.ChatBotUiLoader is undefined because
#   the loader script has never been injected into the DOM.
#   loadLexScripts() was commented out in the constructor — correct decision,
#   but the script injection must happen INSIDE openBotLex() before IframeLoader
#   is instantiated.
#
# Replace the entire openBotLex() method with this:

  openBotLex(): void {
    // ── Guard 1: already loaded — toggle show/hide on subsequent clicks ───
    if (this.lexLoaded && this.lexLoader) {
      try {
        const container = document.getElementById('lex-web-ui');
        if (container && container.classList.contains('lex-web-ui-iframe--show')) {
          this.lexLoader.api.hidePanel();
        } else {
          this.lexLoader.api.showPanel();
        }
      } catch (_e) { /* safe to ignore */ }
      return;
    }

    // ── Guard 2: first load already in-flight ─────────────────────────────
    if (this.lexLoading) {
      this.logger.info('Lex is still loading — ignoring duplicate click.');
      return;
    }
    this.lexLoading = true;   // MUST be synchronous, before any async

    const lexWebSdkUrl: string = LibConstants.lexWebSdkUrl;
    const LOADER_SCRIPT_ID = 'reusa-lex-loader-script';

    const bootstrapIframeLoader = () => {
      const ChatBotUiLoader = (window as any).ChatBotUiLoader;
      if (!ChatBotUiLoader?.IframeLoader) {
        this.lexLoading = false;
        this.logger.error('ChatBotUiLoader.IframeLoader not found after script load.');
        return;
      }

      const loader = new ChatBotUiLoader.IframeLoader({
        shouldIgnoreConfigWhenEmbedded: false,
        shouldLoadMinDeps:              true,
        baseUrl:                        lexWebSdkUrl,
      });

      loader.load()   // loader reads config from baseUrl, panel stays hidden
        .then(() => {
          this.lexLoader  = loader;
          this.lexLoaded  = true;
          this.lexLoading = false;
          this.logger.info('=== LEX loaded successfully ===');
          // Show the panel immediately after first load
          loader.api.showPanel();
        })
        .catch((err: Error) => {
          this.lexLoading = false;
          this.logger.error('=== LEX load failed: ' + err.message);
        });
    };

    if (document.getElementById(LOADER_SCRIPT_ID)) {
      bootstrapIframeLoader();
    } else {
      const script = document.createElement('script');
      script.id    = LOADER_SCRIPT_ID;
      script.src   = `${lexWebSdkUrl}/web-lex-standalone/lex-web-ui-loader.min.js`;
      script.type  = 'text/javascript';
      script.async = false;
      script.onload  = () => bootstrapIframeLoader();
      script.onerror = () => {
        this.lexLoading = false;
        this.logger.error('Failed to load lex-web-ui-loader.min.js from: ' + script.src);
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

# ═══════════════════════════════════════════════════════════════════════════
# URL MAP — what each URL resolves to at runtime (local dev)
# ═══════════════════════════════════════════════════════════════════════════
#
# Angular app:            http://localhost:8100   (ionic serve)
# reusa-lex-ui server:    http://localhost:8000   (npm start in web-lex-standalone/)
#
# Script injected by openBotLex():
#   http://localhost:8000/web-lex-standalone/lex-web-ui-loader.min.js
#   ↳ served by: app.use('/web-lex-standalone', static(standaloneDir))
#
# Config fetched by IframeLoader internally:
#   http://localhost:8000/lex-web-ui-loader-config.json
#   ↳ served by: app.use('/', static(configDir))  where configDir = src/config/
#
# Iframe src loaded by IframeLoader:
#   http://localhost:8000/index.html#/?lexWebUiEmbed=true
#   ↳ served by: app.use('/', static(distDir))
#
# Bot icon:
#   http://localhost:8000/bot-config/AvatarIcon.png
#   ↳ served by: app.use('/bot-config', static(botConfigDir))
#
# lex-web-ui-loader-config.json fields that MUST be correct:
#   "ui.parentOrigin":    "http://localhost:8100"  ← Angular app origin
#   "iframe.iframeOrigin":"http://localhost:8000"  ← reusa-lex-ui server origin
#   These two are DIFFERENT — parentOrigin ≠ iframeOrigin
#
# ═══════════════════════════════════════════════════════════════════════════
# CORS — server.js env var for dev vs deployed
# ═══════════════════════════════════════════════════════════════════════════
#
# server.js reads: process.env.CORS_ORIGIN || 'http://localhost:4200'
#
# For ionic/angular local dev on port 8100, start the server with:
#   CORS_ORIGIN=http://localhost:8100 npm start
#
# Or update the default in server.js:
#   const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8100';
