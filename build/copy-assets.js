#!/usr/bin/env node

/**
 * Copy assets script - replaces dist/Makefile functionality
 * Copies dependencies and bundle files to dist directory after Vite build
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const distDir = path.join(rootDir, 'dist')
const depsDir = path.join(rootDir, 'src', 'dependencies')
const bundleDir = path.join(rootDir, 'lex-web-ui', 'dist', 'bundle')
const websiteDir = path.join(rootDir, 'src', 'website')
const stylesDir = path.join(websiteDir, 'styles')
const standaloneDir = path.join(rootDir, 'web-lex-standalone')

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

console.log('[INFO] Building theme CSS from partials...')

// Build custom-chatbot-style.css by concatenating src/website/styles/*.css
// in filename order (00-fonts first — CSS @import must precede all rules).
// The generated file is the ONLY copy anyone should serve; edit the partials.
if (fs.existsSync(stylesDir)) {
  const partials = fs
    .readdirSync(stylesDir)
    .filter((f) => f.endsWith('.css'))
    .sort()
  const banner =
    '/* GENERATED FILE — DO NOT EDIT.\n' +
    '   Source partials: src/website/styles/*.css\n' +
    '   Rebuild with:    node build/copy-assets.js  (or npm run sync-assets)\n' +
    `   Built from: ${partials.join(', ')} */\n\n`
  const css =
    banner +
    partials
      .map((f) => fs.readFileSync(path.join(stylesDir, f), 'utf8').trim())
      .join('\n\n')
  fs.writeFileSync(path.join(websiteDir, 'custom-chatbot-style.css'), `${css}\n`)
  console.log(`  ✓ Built custom-chatbot-style.css from ${partials.length} partials`)
} else {
  console.log('  ⚠ styles/ directory not found — using existing custom-chatbot-style.css')
}

console.log('[INFO] Copying dependencies...')

// Copy dependency files
if (fs.existsSync(depsDir)) {
  const files = fs.readdirSync(depsDir)
  files.forEach(file => {
    const srcPath = path.join(depsDir, file)
    const destPath = path.join(distDir, file)
    
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied: ${file}`)
    }
  })
} else {
  console.log('  ⚠ Dependencies directory not found')
}

console.log('[INFO] Copying lex-web-ui bundle files...')

// Copy lex-web-ui bundle files
if (fs.existsSync(bundleDir)) {
  const files = fs.readdirSync(bundleDir)
  files.forEach(file => {
    // Copy lex-web-ui and worker files
    if (file.match(/^(lex-web-ui|wav-worker)\.(min\.)?(js|css|map)$/)) {
      const srcPath = path.join(bundleDir, file)
      const destPath = path.join(distDir, file)
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied bundle: ${file}`)
    }
  })
} else {
  console.log('  ⚠ Bundle directory not found - run "cd lex-web-ui && npm run build-dist" first')
}

console.log('[INFO] Copying website files...')

// Copy website files (HTML, CSS)
// index.html is the chat iframe's entry page (CSP lives there) — its
// source is src/website/index.html; the dist copy is generated.
if (fs.existsSync(websiteDir)) {
  const websiteFiles = ['custom-chatbot-style.css', 'right-panel.html', 'index.html']
  websiteFiles.forEach(file => {
    const srcPath = path.join(websiteDir, file)
    const destPath = path.join(distDir, file)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied: ${file}`)
    }
  })
}

console.log('[INFO] Syncing standalone folder...')

// web-lex-standalone/ is the self-contained deployable — keep its theme CSS
// AND its loader bundle in sync automatically (both used to be manual
// `cp`s, which drifted). The loader files only exist in dist/ after a
// root `npm run build-prod`, so their sync is best-effort.
if (fs.existsSync(standaloneDir)) {
  const themeSrc = path.join(websiteDir, 'custom-chatbot-style.css')
  if (fs.existsSync(themeSrc)) {
    fs.copyFileSync(themeSrc, path.join(standaloneDir, 'custom-chatbot-style.css'))
    console.log('  ✓ Synced: web-lex-standalone/custom-chatbot-style.css')
  }
  const loaderFiles = ['lex-web-ui-loader.min.js', 'lex-web-ui-loader.min.css']
  loaderFiles.forEach((file) => {
    const loaderSrc = path.join(distDir, file)
    if (fs.existsSync(loaderSrc)) {
      fs.copyFileSync(loaderSrc, path.join(standaloneDir, file))
      console.log(`  ✓ Synced: web-lex-standalone/${file}`)
    }
  })
}

console.log('[INFO] Asset copying complete!')
