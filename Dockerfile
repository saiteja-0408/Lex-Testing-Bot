# ─────────────────────────────────────────────────────────────────────────────
# reusa-lex-ui — chat widget static host
#
# Two stages, mirroring web-kore-standalone/Dockerfile:
#   1. node  — install deps and build the Vue bundle
#   2. nginx — serve the result; no Node at runtime
#
# Everything this service serves is static (server.js is only three
# express.static mounts), so nginx replaces it entirely in production.
#
# Origins are substituted at CONTAINER START, not build time, so one image
# is promoted unchanged through ST -> UAT -> PROD.
# ─────────────────────────────────────────────────────────────────────────────

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║ OPEN QUESTIONS — answer these before the first build                      ║
# ╠═══════════════════════════════════════════════════════════════════════════╣
# ║ Q4  @SERVICE_NAME@   Kore uses "chatwebsdk-service". Use "lexwebui-service"?
# ║                      Becomes the ECR repository name, so it must match
# ║                      whatever your registry expects.
# ║
# ║ Q5  @SERVICE_PORT@   Kore listens on 9017. Is 9018 free, or does the
# ║                      ingress expect a specific port?
# ║
# ║ Q3  @URL_PATH@       Empty for the web root, or "/lexui" for a path prefix.
# ║                      Kore serves at /koreui/. Recommend the web root on its
# ║                      own hostname — under a prefix, baseUrl and iframeOrigin
# ║                      must diverge (see Q1) and that is easy to get wrong.
# ║
# ║ Q8  Does the config differ per environment beyond origins? v2BotAliasId is
# ║     "TSTALIASID" and the Cognito pool is fixed in the committed config. If
# ║     UAT/PROD use different aliases or pools, docker-entrypoint.sh needs two
# ║     more substitutions. Kore never had this — its bot ids come from env.js.
# ╚═══════════════════════════════════════════════════════════════════════════╝

FROM node:20 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY lex-web-ui/package*.json ./lex-web-ui/
RUN npm install && cd lex-web-ui && npm install

COPY . .

# Compile Vue -> lex-web-ui/dist/bundle, then promote into dist/
RUN npm run build-dist && node build/copy-assets.js

# The runtime config lives in src/config/ and is served from the web root by
# server.js. Flatten it into dist/ so nginx needs only one document root.
RUN cp src/config/lex-web-ui-loader-config.json dist/ \
 && cp -r bot-config dist/bot-config

# Fail the build if the Vue rebuild did not take (see the min-button check
# in the developer manual).
RUN if grep -q "min-button" dist/lex-web-ui.min.js; then \
      echo "BUILD FAILED: stale Vue bundle - MinButton still present" && exit 1; \
    fi


FROM nginx:alpine

COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html@URL_PATH@/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE @SERVICE_PORT@

# PARENT_ORIGIN  - origin of the Angular claimant app  (postMessage source check)
# IFRAME_ORIGIN  - origin of THIS service              (must be a bare origin:
#                  scheme://host[:port], never a path — iframe-component-loader.js
#                  compares it with === against the browser's evt.origin)
# ASSET_BASE     - URL prefix the avatar images resolve from; "" when served at
#                  the web root, "/lexui" when served under a path prefix
ENV PARENT_ORIGIN=""
ENV IFRAME_ORIGIN=""
ENV ASSET_BASE=""

COPY docker-entrypoint.sh /docker-entrypoint-lex.sh
RUN chmod +x /docker-entrypoint-lex.sh

CMD ["/docker-entrypoint-lex.sh"]
