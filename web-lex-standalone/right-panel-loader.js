/* ============================================================
   RIGHT-PANEL BOOTSTRAP
   ============================================================
   Initializes the Lex Web UI iframe loader on the host page.

   Step-by-step flow:
     1. Derive origin from window.location so this file works
        unchanged on localhost, CloudFront, or any other host.
     2. Create IframeLoader with shouldLoadConfigFromJsonFile: false
        so the loader itself does NOT fetch the config — we do it
        manually below to guarantee correct key placement.
     3. fetch() the config JSON from the same origin.
     4. Patch origin-dependent fields (parentOrigin, iframeOrigin)
        so they always match the actual host.
     5. Force shouldLoadIframeMinimized = false so the panel opens
        immediately (not as a minimized bubble).
     6. Call iframeLoader.load(cfg) which:
         a. Creates <div class="lex-web-ui-iframe"> in the DOM
         b. Injects <iframe src="/index.html#/?lexWebUiEmbed=true">
         c. Waits for Vue app inside iframe to post "ready"
         d. Exchanges config via postMessage (initIframeConfig)
         e. Calls showIframe() → adds --show class → CSS animates in
     7. On success, "right-panel: Lex iframe ready" logs to console.

   Config key nesting rules (from prior debugging):
     - "recorder"  must be TOP-LEVEL (not inside "ui") — otherwise
       store state.js `isRecorderEnabled` won't see it and the mic
       button will still appear.
     - "ui", "lex", "cognito", "iframe" must all be TOP-LEVEL.
   ============================================================ */
(function () {
  'use strict';

  var origin = window.location.origin;

  /*
    shouldLoadConfigFromJsonFile: false
      We fetch the config ourselves (below) so we can guarantee the
      correct structure before passing to load(). If true, the loader
      would also fetch it internally — a race / double-merge risk.

    shouldLoadConfigFromEvent: false
      No dynamic event-based config injection needed.

    shouldLoadMinDeps: true
      Use minified production bundles (lex-web-ui.min.js etc.).

    shouldIgnoreConfigWhenEmbedded: false  (loader default)
      The iframe must receive the full config including Cognito pool
      ID and Lex bot IDs; true would strip those and break auth.
  */
  var loaderOpts = {
    baseUrl: origin + '/',
    shouldLoadConfigFromEvent: false,
    shouldLoadConfigFromJsonFile: false,
    shouldLoadMinDeps: true,
  };

  var IframeLoader = window.ChatBotUiLoader.IframeLoader;
  var iframeLoader = new IframeLoader(loaderOpts);

  /*
    GET /lex-web-ui-loader-config.json
    → maps to src/config/lex-web-ui-loader-config.json on disk (server.js)

    Guarded fetch: a 10s timeout so a hung endpoint fails loudly instead
    of leaving the widget silently absent, and a content-type check so a
    proxy's HTML error page fails with a clear message rather than an
    opaque JSON SyntaxError.
  */
  var abort = new AbortController();
  var configTimeout = setTimeout(function () { abort.abort(); }, 10000);
  fetch(origin + '/lex-web-ui-loader-config.json', { signal: abort.signal })
    .then(function (response) {
      clearTimeout(configTimeout);
      if (!response.ok) {
        throw new Error(
          'Failed to load config: ' + response.status + ' ' + response.statusText
        );
      }
      var type = response.headers.get('content-type') || '';
      if (type.indexOf('json') === -1) {
        throw new Error('Config endpoint returned non-JSON (' + type + ')');
      }
      return response.json();
    })
    .then(function (cfg) {
      /* Guarantee required top-level keys exist */
      cfg.ui = cfg.ui || {};
      cfg.iframe = cfg.iframe || {};

      /* Patch origin-dependent fields */
      cfg.ui.parentOrigin = origin;
      cfg.iframe.iframeOrigin = origin;

      /* Always open expanded, not as a minimized bubble */
      cfg.iframe.shouldLoadIframeMinimized = false;

      return iframeLoader.load(cfg);
    })
    .then(function () {
      console.log('right-panel: Lex iframe ready');
    })
    .catch(function (err) {
      console.error('right-panel: failed to load Lex chat widget', err);
    });
}());
