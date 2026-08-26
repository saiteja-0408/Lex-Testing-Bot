# `script.const.ts` — Analysis and exact `lexImportUrls` for Lex
# Based on: actual ScriptConstant format + IframeLoader dependency-loader source
# ─────────────────────────────────────────────────────────────────────────────

# ═══════════════════════════════════════════════════════════════════════════
# CRITICAL FINDING: lexImportUrls IS NOT USED by openBotLex()
# ═══════════════════════════════════════════════════════════════════════════
#
# The Kore flow uses lexImportUrls through loadLexScripts() which iterates the
# array and injects each entry.  BUT:
#
# For Lex, openBotLex() does NOT call loadLexScripts().
# It injects the ONE loader script itself (lex-web-ui-loader.min.js) and then
# the IframeLoader takes over from there — it loads its OWN CSS dependencies
# internally via DependencyLoader.
#
# Looking at the IframeLoader source (dependencies.js lines 71-84):
#
#   dependenciesIframe = {
#     css: [
#       { name: 'lex-web-ui-loader',       url: './lex-web-ui-loader.css' },
#       { name: 'custom-chatbot-style',     url: './custom-chatbot-style.css', optional: true },
#     ],
#     script: []   ← NO scripts loaded by the loader itself
#   };
#
# These CSS files are resolved against baseUrl (the reusa-lex-ui server origin)
# So they become:
#   http://localhost:8000/lex-web-ui-loader.css        ← from dist/ (served at /)
#   http://localhost:8000/custom-chatbot-style.css      ← from dist/ (served at /)
#
# The IframeLoader handles all of this automatically. The angular.json styles[]
# entries for lex-web-ui-loader.min.css and chat-frame.css are OVERRIDES that
# apply only to the host page (Angular app), not the iframe content.


# ═══════════════════════════════════════════════════════════════════════════
# PROBLEM WITH THE CURRENT lexImportUrls in script.const.ts
# ═══════════════════════════════════════════════════════════════════════════
#
# Current lexImportUrls has these 4 entries:
#
#   { type: 'js',  url: '/web-lex-standalone/lex-web-ui-loader.min.js', async: false }
#   { type: 'css', url: '/web-lex-standalone/lex-web-ui-loader.min.css' }
#   { type: 'css', url: '/web-lex-standalone/chat-frame.css' }
#   { type: 'css', url: '/web-lex-standalone/custom-chatbot-style.css' }
#
# These URLs start with "/" so when loadLexScripts() builds them it does:
#   LibConstants.lexWebSdkUrl + scriptElement.url
#   = "http://localhost:8000" + "/web-lex-standalone/lex-web-ui-loader.min.js"
#   = "http://localhost:8000/web-lex-standalone/lex-web-ui-loader.min.js"   ✅ correct
#
# BUT loadLexScripts() is never called from openBotLex() — so this array is
# currently dead code.
#
# The correct flow is: openBotLex() injects the script ITSELF with a stable ID
# so it's idempotent. lexImportUrls via loadLexScripts() is not the right path
# for Lex because the CSS must be loaded AFTER the IframeLoader initializes
# (it creates the iframe container div that the CSS targets).


# ═══════════════════════════════════════════════════════════════════════════
# CORRECT lexImportUrls — keep it, but only the JS entry matters
# ═══════════════════════════════════════════════════════════════════════════
#
# Keep your current lexImportUrls exactly as-is:
#
#   public static lexImportUrls = [
#     {
#       type: ScriptConstant.jsProperty,
#       url: '/web-lex-standalone/lex-web-ui-loader.min.js',
#       async: false,
#     },
#     {
#       type: ScriptConstant.cssProperty,
#       url: '/web-lex-standalone/lex-web-ui-loader.min.css',
#     },
#     {
#       type: ScriptConstant.cssProperty,
#       url: '/web-lex-standalone/chat-frame.css',
#     },
#     {
#       type: ScriptConstant.cssProperty,
#       url: '/web-lex-standalone/custom-chatbot-style.css',
#     },
#   ];
#
# NO CHANGES NEEDED to script.const.ts ✅
#
# The array is correct as written. It is just not the path used by openBotLex().
# openBotLex() injects the script directly by ID — that is the right approach.


# ═══════════════════════════════════════════════════════════════════════════
# FULL RUNTIME DEPENDENCY CHAIN — what loads what
# ═══════════════════════════════════════════════════════════════════════════
#
# 1. Angular app starts on http://localhost:8100
#    angular.json styles[] already loaded globally (no JS needed yet):
#      lex-web-ui-loader.min.css  → positions the iframe container div
#      chat-frame.css             → MDES sizing overrides for the container
#
# 2. User clicks chatbot button → openBotLex() runs
#    Injects <script id="reusa-lex-loader-script">:
#      src = "http://localhost:8000/web-lex-standalone/lex-web-ui-loader.min.js"
#      Registers: window.ChatBotUiLoader = { IframeLoader, FullPageLoader }
#
# 3. onload fires → bootstrapIframeLoader() runs
#    new ChatBotUiLoader.IframeLoader({ baseUrl: "http://localhost:8000" })
#
# 4. loader.load() runs — IframeLoader does this internally:
#
#    4a. DependencyLoader loads dependenciesIframe CSS from baseUrl:
#          http://localhost:8000/lex-web-ui-loader.css         (from dist/)
#          http://localhost:8000/custom-chatbot-style.css      (from dist/)
#
#    4b. ConfigLoader fetches config from:
#          http://localhost:8000/lex-web-ui-loader-config.json  (from src/config/)
#
#    4c. IframeComponentLoader creates the <div class="lex-web-ui-iframe"> in DOM
#        and sets iframe src to:
#          http://localhost:8000/index.html#/?lexWebUiEmbed=true (from dist/)
#
# 5. iframe loads → inside it: Vue + Vuex + Vuetify + lex-web-ui.js boot up
#    These are loaded by the FullPageLoader running INSIDE the iframe
#    (dependenciesFullPage: Vue, Vuex, Vuetify, LexWebUi — all from dist/)
#
# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY: what files need changes in reemploy-usa-core
# ═══════════════════════════════════════════════════════════════════════════
#
#  LibConstants.ts     → ✅ ALREADY DONE (chatbotProvider, lexWebSdkUrl present)
#  script.const.ts     → ✅ NO CHANGE NEEDED (lexImportUrls already correct)
#  chatbot.service.ts  → ⚠️  REPLACE openBotLex() — see reusa-core-changes.md
#
# Only ONE file needs a code change: chatbot.service.ts → openBotLex()
