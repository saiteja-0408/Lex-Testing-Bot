#!/bin/sh
# Substitute per-environment origins into the runtime config, then hand off
# to nginx. Runs on every container start so one image serves every tier.
set -e

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║ OPEN QUESTIONS                                                            ║
# ╠═══════════════════════════════════════════════════════════════════════════╣
# ║ Q1  IFRAME_ORIGIN  — origin of THIS service, per environment.
# ║     THE ONE TO GET RIGHT. iframe-component-loader.js:315 does:
# ║         if (evt.origin !== iframeOrigin) { ... }
# ║     a strict comparison against the browser's evt.origin, which NEVER
# ║     contains a path. Append one and every postMessage is silently
# ║     rejected: the panel opens, the chat never answers, nothing is logged.
# ║     The guard below refuses to start if it sees a path — but the real
# ║     per-environment values still need to come from you.
# ║     ST / UAT / PROD = ?
# ║
# ║ Q2  PARENT_ORIGIN  — origin of the Angular claimant app, per environment.
# ║     Written into ui.parentOrigin AND returned by nginx as
# ║     Access-Control-Allow-Origin. Wrong value blocks the config fetch, and
# ║     the loader treats a non-200 as fatal, so nothing renders at all.
# ║     ST / UAT / PROD = ?
# ║
# ║ Q3  ASSET_BASE — leave empty when served at the web root. Set to the same
# ║     value as @URL_PATH@ when served under a prefix, or the avatar 404s.
# ╚═══════════════════════════════════════════════════════════════════════════╝

CONFIG="/usr/share/nginx/html@URL_PATH@/lex-web-ui-loader-config.json"

if [ ! -f "$CONFIG" ]; then
  echo "FATAL: $CONFIG missing - the loader rejects a non-200 config fetch" >&2
  exit 1
fi

if [ -z "$PARENT_ORIGIN" ] || [ -z "$IFRAME_ORIGIN" ]; then
  echo "FATAL: PARENT_ORIGIN and IFRAME_ORIGIN must both be set" >&2
  exit 1
fi

# Reject a path on IFRAME_ORIGIN early - a trailing path silently breaks every
# postMessage, which presents as a panel that opens but never responds.
case "${IFRAME_ORIGIN#*://}" in
  */*) echo "FATAL: IFRAME_ORIGIN must be a bare origin, got '$IFRAME_ORIGIN'" >&2; exit 1 ;;
esac

# Match on the key, not the current value, so this is independent of whatever
# the committed config happens to say.
sed -i "s#\"parentOrigin\"[[:space:]]*:[[:space:]]*\"[^\"]*\"#\"parentOrigin\": \"${PARENT_ORIGIN}\"#" "$CONFIG"
sed -i "s#\"iframeOrigin\"[[:space:]]*:[[:space:]]*\"[^\"]*\"#\"iframeOrigin\": \"${IFRAME_ORIGIN}\"#" "$CONFIG"

# Avatar paths are root-relative in the committed config. Re-anchor them when
# the app is served under a path prefix.
if [ -n "$ASSET_BASE" ]; then
  sed -i "s#\"/bot-config/#\"${ASSET_BASE}/bot-config/#g" "$CONFIG"
fi

echo "lex-web-ui: parentOrigin=${PARENT_ORIGIN} iframeOrigin=${IFRAME_ORIGIN} assetBase=${ASSET_BASE:-/}"
exec nginx -g 'daemon off;'
