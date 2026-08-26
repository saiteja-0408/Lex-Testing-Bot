/**
 * chatbot.service.ts — LEX ADDITIONS ONLY
 *
 * Instructions:
 *  1. Add the private helpers below to your existing ChatbotService class.
 *  2. In initializeChatbot(), add the if/else branch shown at the bottom.
 *  3. Do NOT touch any existing Kore code.
 *
 * Assumes:
 *  - env.js has: window["env"]["chatbotProvider"] = "lex" | "kore"
 *  - env.js has: window["env"]["lexWebUiUrl"]      = "http://localhost:8000"
 *  - angular.json assets include node_modules/reusa-lex-ui/web-lex-standalone → lex-ui/
 */

// ─── ADD: provider getter (reads env.js at runtime) ────────────────────────
private get provider(): string {
  return (window as any)['env']?.chatbotProvider ?? 'kore';
}

// ─── ADD: Lex entry point ───────────────────────────────────────────────────
private initializeLex(): void {
  const lexUrl: string =
    (window as any)['env']?.lexWebUiUrl ?? 'http://localhost:8000';

  if (!document.getElementById('lex-loader-script')) {
    const script = document.createElement('script');
    script.id    = 'lex-loader-script';
    script.src   = `${lexUrl}/lex-ui/lex-web-ui-loader.min.js`;
    script.onload = () => this.bootstrapLexIframe(lexUrl);
    document.body.appendChild(script);
  } else {
    this.bootstrapLexIframe(lexUrl);
  }
}

// ─── ADD: Lex iframe bootstrap (runs after loader script is ready) ──────────
private bootstrapLexIframe(lexUrl: string): void {
  fetch(`${lexUrl}/lex-ui/bot-config/config.json`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Lex config fetch failed: ${r.status} ${r.statusText}`);
      }
      return r.json();
    })
    .then((cfg: any) => {
      cfg.ui                              = cfg.ui    || {};
      cfg.iframe                          = cfg.iframe || {};
      // Must match the actual serving origin or the iframe rejects the handshake.
      cfg.ui.parentOrigin                 = window.location.origin;
      cfg.iframe.iframeOrigin             = lexUrl;
      cfg.iframe.shouldLoadIframeMinimized = false;

      const IframeLoader = (window as any).ChatBotUiLoader?.IframeLoader;
      if (!IframeLoader) {
        throw new Error('ChatBotUiLoader not found — loader script may not have loaded');
      }

      const loader = new IframeLoader({
        baseUrl:          lexUrl + '/',
        shouldLoadMinDeps: true,
      });
      return loader.load(cfg);
    })
    .then(() => console.log('Lex Web UI ready'))
    .catch((err: Error) => console.error('Lex Web UI failed to load:', err.message));
}

// ─── MODIFY: initializeChatbot() — add the if/else branch ──────────────────
//
// BEFORE (existing):
//   initializeChatbot(): void {
//     /* ... existing kore code ... */
//   }
//
// AFTER:
initializeChatbot(): void {
  if (this.provider === 'lex') {
    this.initializeLex();
  } else {
    // ← existing Kore initialization code stays here, completely untouched →
  }
}
