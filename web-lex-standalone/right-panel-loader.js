/*
 * Right-panel bootstrap: fetches the loader config, patches the
 * origin-dependent fields, and loads the chat iframe.
 *
 * Config keys "ui", "lex", "cognito", "iframe", "recorder" must be
 * TOP-LEVEL in the JSON — nesting "recorder" under "ui" silently
 * re-enables the mic button.
 */
(function () {
  'use strict';

  var origin = window.location.origin;

  var loaderOpts = {
    baseUrl: origin + '/',
    shouldLoadConfigFromEvent: false,
    // We fetch the config ourselves so the loader doesn't double-fetch it.
    shouldLoadConfigFromJsonFile: false,
    shouldLoadMinDeps: true,
  };

  var IframeLoader = window.ChatBotUiLoader.IframeLoader;
  var iframeLoader = new IframeLoader(loaderOpts);

  // 10s timeout so a hung endpoint fails loudly; content-type check so a
  // proxy's HTML error page fails clearly instead of as a JSON SyntaxError.
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
      cfg.ui = cfg.ui || {};
      cfg.iframe = cfg.iframe || {};

      // Must match the actual serving origin or the iframe rejects the
      // config handshake ("chatbot loading time out").
      cfg.ui.parentOrigin = origin;
      cfg.iframe.iframeOrigin = origin;

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
