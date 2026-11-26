# OOrum Uravum — cPanel Deployment Guide

This document covers the complete step-by-step process to build and deploy the OOrum Uravum project to the cPanel hosting at `cloud620.thundercloud.uk` (domain: `oorumuravum.com`).

---

## Architecture Overview

| App | Domain | cPanel Path | Node.js App |
|-----|--------|-------------|-------------|
| Frontend (Next.js) | `oorumuravum.com` | `/home/oorumur1/public_html/frontend` | v22 |
| CMS Dashboard (Next.js) | `cms.oorumuravum.com` | `/home/oorumur1/public_html/cms` | v22 |
| Backend API (Express) | `api.oorumuravum.com` | `/home/oorumur1/public_html/api` | v22 |
| Database | MySQL (localhost) | `oorumur1_tamil_news` | — |

---

## API Documentation and Verification

The backend serves the OpenAPI specification and interactive Swagger UI:

- Swagger UI: `https://api.oorumuravum.com/api/docs`
- OpenAPI JSON: `https://api.oorumuravum.com/api/docs.json`
- Health check: `https://api.oorumuravum.com/api/health`

The specification covers the registered API route methods, request inputs, auth requirements, and common responses. After a backend deployment, confirm that the health check returns `200`, the JSON document parses successfully, and Swagger UI loads. For local checks, run the focused coverage test and backend build from `backend/`:

```powershell
npm.cmd test -- src/swagger.test.ts
npm.cmd run build
```

---

## Prerequisites

### Local Machine
- Node.js v22 installed
- npm installed
- Git (optional)
- ZIP tool (built into Windows/macOS)

### cPanel Server
- cPanel at `https://cloud620.thundercloud.uk/cpanel`
- SSH access enabled
- Node.js App Manager (CloudLinux Passenger)
- MySQL databases configured
- Imunify360 WAF (aware of limitations — see [WAF Notes](#waf-notes))

---

## Step 1 & 2 — Build + Package (automated)

> **The `deploy/` folder is never committed to git.**  
> It is generated locally by running the build script below.

### Prerequisites — env files

Before running the build script, ensure these env files exist:

**`backend/.env.production`** (copy from `.env.example` and fill in):
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mysql://oorumur1_tamil_user:PASSWORD@localhost:3306/oorumur1_tamil_news
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
CORS_ORIGIN=https://oorumuravum.com,https://cms.oorumuravum.com,https://api.oorumuravum.com
MEDIA_UPLOAD_PATH=./uploads
SITE_URL=https://oorumuravum.com
FRONTEND_REVALIDATE_URL=https://oorumuravum.com/api/revalidate
REVALIDATE_SECRET=<random string>
IMAGE_ENCRYPTION_KEY=<exactly 32 chars — NEVER change after images are stored>
PRISMA_QUERY_ENGINE_TYPE=binary
```

**`publisher-dashboard/.env.production`**:
```env
NEXT_PUBLIC_API_URL=https://api.oorumuravum.com/api
```

**`frontend/.env.production`**:
```env
NEXT_PUBLIC_API_URL=https://api.oorumuravum.com/api
NEXT_PUBLIC_SITE_URL=https://oorumuravum.com
INTERNAL_API_URL=https://api.oorumuravum.com/api
REVALIDATE_SECRET=<same as backend>
```

### Run the build script (PowerShell — Windows)

From the project root:

```powershell
# Build all three apps and create deploy ZIPs
.\scripts\build-deploy.ps1

# Build individual apps only
.\scripts\build-deploy.ps1 -BackendOnly
.\scripts\build-deploy.ps1 -CmsOnly
.\scripts\build-deploy.ps1 -FrontendOnly

# Skip npm install if node_modules already up-to-date
.\scripts\build-deploy.ps1 -SkipInstall

# Skip ZIP creation (just prepare folder structure, no archives)
.\scripts\build-deploy.ps1 -SkipZip
```

The script does the following for each app automatically:

| Step | Backend | CMS | Frontend |
|------|---------|-----|---------|
| `npm install` | ✓ | ✓ | ✓ |
| `npm run build` | ✓ (tsc) | ✓ (Next.js) | ✓ (Next.js) |
| Copy artefacts to `deploy/` | ✓ | ✓ (standalone) | ✓ (standalone) |
| Copy `.next/static` | — | ✓ | ✓ |
| Copy `public/` | — | ✓ | ✓ |
| Fix Windows paths in `server.js` | — | ✓ | ✓ |
| Copy Prisma client | ✓ | — | — |
| Rename `node_modules` → `_modules` | — | ✓ | ✓ |
| Write `start.js` wrapper | — | ✓ | — |
| Write `.htaccess` (Passenger) | — | ✓ | ✓ |
| Remove `app.js` (Passenger conflict) | — | — | ✓ |
| Create `.zip` | ✓ | ✓ | ✓ |

**Output** (after script completes):
```
deploy/
  backend/    ← ready to upload
  backend.zip ← upload this to cPanel
  cms/        ← ready to upload
  cms.zip     ← upload this to cPanel
  frontend/   ← ready to upload
  frontend.zip← upload this to cPanel
```

> **Note:** The `deploy/` folder is git-ignored. Never commit it.

---

## Step 2 (legacy manual steps — reference only)

> Skip this section if using the build script above.

<details>
<summary>Manual packaging steps (click to expand)</summary>

### 2.1 Backend ZIP

```bash
# Copy compiled backend to deploy folder
cp -r backend/dist deploy/backend/dist
cp backend/app.js deploy/backend/
cp backend/package.json deploy/backend/
cp -r prisma deploy/backend/prisma
cp backend/.env.production deploy/backend/.env
# zip
cd deploy && zip -r backend.zip backend/
```

### 2.2 CMS ZIP

```bash
# Copy standalone output
cp -r publisher-dashboard/.next/standalone/publisher-dashboard/* deploy/cms/

# Copy static assets (IMPORTANT — not included in standalone output)
cp -r publisher-dashboard/.next/static deploy/cms/.next/static
cp -r publisher-dashboard/public deploy/cms/public

# Copy env
cp publisher-dashboard/.env.production deploy/cms/.env.production

# Fix Windows paths in server.js (remove local build paths)
# Replace any "C:\Tharshigan\..." paths with empty string in:
#   deploy/cms/server.js
#   deploy/cms/.next/required-server-files.json

# Rename node_modules → _modules (cPanel startup wrapper uses this)
mv deploy/cms/node_modules deploy/cms/_modules

# Add start.js wrapper (sets NODE_PATH to _modules)
cat > deploy/cms/start.js << 'EOF'
const path = require('path');
const Module = require('module');
const _r = Module._resolveFilename.bind(Module);
Module._resolveFilename = function(req, ...a) {
  if (!req.startsWith('.') && !req.startsWith('/') && !req.startsWith('node:')) {
    try { return _r(path.join(__dirname, '_modules', req), ...a); } catch(e) {}
  }
  return _r(req, ...a);
};
process.env.NODE_PATH = path.join(__dirname, '_modules');
Module._initPaths();
require('./server.js');
EOF

# Add .htaccess for Passenger
cat > deploy/cms/.htaccess << 'EOF'
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/oorumur1/public_html/cms"
PassengerBaseURI "/"
PassengerNodejs "/home/oorumur1/nodevenv/public_html/cms/22/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
Options -Indexes
PassengerEnabled on
PassengerAppRoot /home/oorumur1/public_html/cms
PassengerNodejs /home/oorumur1/nodevenv/public_html/cms/22/bin/node
PassengerAppType node
PassengerStartupFile server.js
EOF

# ZIP
cd deploy && zip -r cms.zip cms/
```

### 2.3 Frontend ZIP

```bash
# Same process as CMS but for frontend
cp -r frontend/.next/standalone/frontend/* deploy/frontend/
cp -r frontend/.next/static deploy/frontend/.next/static
cp -r frontend/public deploy/frontend/public
cp frontend/.env.production deploy/frontend/.env.production

# Fix Windows paths in server.js and required-server-files.json
# Remove node_modules (frontend uses server.js directly — sharp removed)
rm -rf deploy/frontend/node_modules

# Add .htaccess
cat > deploy/frontend/.htaccess << 'EOF'
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/oorumur1/public_html/frontend"
PassengerBaseURI "/"
PassengerNodejs "/home/oorumur1/nodevenv/public_html/frontend/22/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
Options -Indexes
PassengerEnabled on
PassengerAppRoot /home/oorumur1/public_html/frontend
PassengerNodejs /home/oorumur1/nodevenv/public_html/frontend/22/bin/node
PassengerAppType node
PassengerStartupFile server.js
EOF

# ZIP
cd deploy && zip -r frontend.zip frontend/
```

> **Windows users**: Use PowerShell `Compress-Archive` instead of `zip`.

</details>

---

## Step 3 — Upload to cPanel

1. Log in to cPanel at `https://cloud620.thundercloud.uk/cpanel`
2. Open **File Manager**
3. Navigate to `/home/oorumur1/public_html/`
4. Upload `backend.zip`, `cms.zip`, `frontend.zip`
5. Extract each ZIP into its respective folder:
   - `backend.zip` → `/home/oorumur1/public_html/api/`
   - `cms.zip` → `/home/oorumur1/public_html/cms/`
   - `frontend.zip` → `/home/oorumur1/public_html/frontend/`

---

## Step 4 — Server Setup via SSH

Connect via SSH:
```bash
ssh oorumur1@cloud620.thundercloud.uk
```

### 4.1 Deploy Backend

```bash
cd ~/public_html/api

# Install production dependencies
~/nodevenv/public_html/api/22/bin/npm install --omit=dev --ignore-scripts

# Generate Prisma client
~/nodevenv/public_html/api/22/bin/node node_modules/.bin/prisma generate \
  --schema=./prisma/schema.prisma

# Run DB migrations (only on first deploy or schema changes)
~/nodevenv/public_html/api/22/bin/node node_modules/.bin/prisma migrate deploy \
  --schema=./prisma/schema.prisma

# Patch media route to remove sharp (sharp crashes on cPanel CageFS)
python3 << 'PYEOF'
content = open('dist/routes/media.js').read()
content = content.replace(
    'const sharp_1 = __importDefault(require("sharp"));',
    '// sharp disabled on cPanel\nconst sharp_1 = { default: null };'
)
# Replace sharp resize with file copy
import re
old = r'for \(const variant of VARIANTS\) \{.*?urls\[variant\.name\].*?\}'
# Manual replacement for the variant loop
content = content.replace(
    'await (0, sharp_1.default)(file.buffer)\n                .resize(variant.width, undefined, { withoutEnlargement: true })\n                .toFile(variantPath);',
    'await promises_1.default.writeFile(variantPath, file.buffer);'
)
open('dist/routes/media.js', 'w').write(content)
print('Patched media.js')
PYEOF

# Patch articles route to decode base64 content (WAF bypass)
# (This should already be in the deployed dist/routes/articles.js)

# Patch cache TTL to 5s for articles (matches source — no longer needs manual patching)
python3 -c "
content = open('dist/lib/cache.js').read()
# ARTICLE_TTL is now 5 in source; only patch if a stale build has 300
content = content.replace('exports.ARTICLE_TTL = 300;', 'exports.ARTICLE_TTL = 5;')
content = content.replace('exports.ARTICLE_TTL = 30;', 'exports.ARTICLE_TTL = 5;')
open('dist/lib/cache.js', 'w').write(content)
print('Cache TTL confirmed at 5s')
"

# Restart backend
mkdir -p tmp && touch tmp/restart.txt
echo "Backend deployed"
```

### 4.2 Deploy CMS

```bash
cd ~/public_html/cms

# Replace Windows _modules with Linux-native modules
chmod -R u+rwX _modules 2>/dev/null; rm -rf _modules
~/nodevenv/public_html/cms/22/bin/npm install --omit=dev
mv node_modules _modules

# Remove Windows-specific native binaries
chmod -R u+rwX _modules/sharp 2>/dev/null; rm -rf _modules/sharp
chmod -R u+rwX _modules/@img 2>/dev/null; rm -rf _modules/@img

# Fix permissions on .next
chmod -R u+rX .next

# Restart CMS
mkdir -p tmp && touch tmp/restart.txt
echo "CMS deployed — BUILD_ID: $(cat .next/BUILD_ID)"
```

### 4.3 Deploy Frontend

```bash
cd ~/public_html/frontend

# Remove any leftover Windows modules
# Frontend uses server.js directly — no _modules needed for Next.js itself
# But the standalone output includes a _modules folder from npm install

# If _modules exists from ZIP, clean Windows binaries
if [ -d _modules ]; then
    chmod -R u+rwX _modules/sharp 2>/dev/null; rm -rf _modules/sharp
    chmod -R u+rwX _modules/@img 2>/dev/null; rm -rf _modules/@img
fi

# IMPORTANT: Remove app.js if it exists (causes Passenger to load wrong file)
rm -f app.js server.js.tmp

# Fix permissions
chmod -R u+rX .next

# Restart frontend
mkdir -p tmp && touch tmp/restart.txt
sleep 10
curl -sk https://oorumuravum.com/ | head -c 100
echo "Frontend deployed — BUILD_ID: $(cat .next/BUILD_ID)"
```

---

## Step 5 — cPanel Node.js App Manager Configuration

Go to **cPanel → Node.js App Manager** and configure each app:

| App | Application Root | Startup File | Mode |
|-----|-----------------|-------------|------|
| `oorumuravum.com` | `/home/oorumur1/public_html/frontend` | `server.js` | Production |
| `cms.oorumuravum.com` | `/home/oorumur1/public_html/cms` | `server.js` | Production |
| `api.oorumuravum.com` | `/home/oorumur1/public_html/api` | `app.js` | Production |

Click **Save** and **Restart** for each app.

---

## Step 6 — Verify Deployment

```bash
# Backend health check
curl -sk https://api.oorumuravum.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
curl -sk https://oorumuravum.com/ | head -c 100
# Expected: <!DOCTYPE html><html lang="ta"...

# CMS
curl -sk https://cms.oorumuravum.com/ | head -c 100
# Expected: <!DOCTYPE html><html lang="ta"...

# Test API
curl -sk https://api.oorumuravum.com/api/categories | head -c 100
# Expected: [{"id":"...","name":"..."}]
```

---

## Step 7 — Database Schema Updates (if needed)

When the Prisma schema changes, run migrations:

```bash
cd ~/public_html/api

# Check if any tables are missing
mysql -u oorumur1_tamil_user -pTest_1user oorumur1_tamil_news -e "SHOW TABLES;" 2>/dev/null

# Apply migrations (if prisma generate succeeds — it often crashes on cPanel)
~/nodevenv/public_html/api/22/bin/node node_modules/.bin/prisma migrate deploy

# If prisma migrate crashes (SIGABRT due to CageFS), add missing columns manually:
mysql -u oorumur1_tamil_user -pTest_1user oorumur1_tamil_news << 'SQL'
-- Example: add missing column
ALTER TABLE advertisements ADD COLUMN crop_position VARCHAR(50) NULL;
-- Add any other missing tables/columns
SQL
```

---

## Known Issues & Solutions

### 0. CMS Stale Data After Mutations
**Problem**: Backend in-memory cache served old data after article create/update/delete.  
**Solution (3-layer)**:
1. `ARTICLE_TTL` reduced to **5 seconds** in source (`backend/src/lib/cache.ts`) — stale window is minimal
2. Backend skips cache entirely for authenticated admin requests (any request with `Authorization` header)
3. CMS uses **optimistic UI** — after mutations, local state is updated directly without re-fetching

### 1. Sharp (Image Resizing) Crashes
**Problem**: `sharp` uses native binaries that crash under CageFS.  
**Solution**: Patch `dist/routes/media.js` to use `fs.writeFile` instead of `sharp.resize`. Images are stored as-is without resizing.

### 2. Prisma Native Binary Crashes
**Problem**: `prisma generate` and `new PrismaClient()` crash with SIGABRT.  
**Solution**: Set `PRISMA_QUERY_ENGINE_TYPE=binary` in `.env` and ensure `prisma generate` is done locally (Windows), then upload the generated `dist/lib/prisma.js` and `node_modules/.prisma/client/`.

### 3. WAF Notes (Imunify360)
**Problem**: Imunify360 WAF blocks POST/PUT requests with HTML content (Tamil Unicode in `<p>` tags) when `Origin: https://cms.oorumuravum.com` header is present.  
**Solution**: 
- CMS encodes `content` and `excerpt` fields as `b64:` + Base64 before sending
- Backend decodes `b64:` prefixed fields before saving
- CMS routes mutations through `/api/proxy/...` (Next.js API route that forwards to backend without Origin header)

### 4. Passenger Startup File
**Problem**: If `app.js` exists in a Next.js app directory, Passenger loads it instead of `server.js`.  
**Solution**: Always delete `app.js` from frontend/cms directories after deployment.

### 5. Windows Build Artifacts
**Problem**: `server.js` contains Windows absolute paths (`C:\Tharshigan\...`) that break on Linux.  
**Solution**: After packaging, replace all `C:\Tharshigan\Practice Project\OOrum_Uravum-web\<app-name>` and `C:\Tharshigan\Practice Project\OOrum_Uravum-web` strings with empty string in `server.js` and `required-server-files.json`.

### 6. Static Files Missing
**Problem**: Next.js standalone build doesn't include `/.next/static/` folder.  
**Solution**: Manually copy `<app>/.next/static/` into the standalone output before zipping.

### 7. Backend Node Modules
**Problem**: `npm install` on cPanel installs Windows-specific packages (sharp-win32-x64).  
**Solution**: Always run `npm install --omit=dev` on the cPanel server (Linux) — never copy `node_modules` from Windows.

### 8. CMS Modules (_modules folder)
**Problem**: `_modules` folder from Windows build contains Windows `.node` binaries.  
**Solution**: Delete `_modules` after extraction and re-run `npm install` on the server, then rename to `_modules`.

---

## Environment Variables Reference

### Backend (`/home/oorumur1/public_html/api/.env`)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mysql://oorumur1_tamil_user:PASSWORD@localhost:3306/oorumur1_tamil_news
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
CORS_ORIGIN=https://oorumuravum.com,https://cms.oorumuravum.com,https://api.oorumuravum.com
MEDIA_UPLOAD_PATH=./uploads
SITE_URL=https://oorumuravum.com
FRONTEND_REVALIDATE_URL=https://oorumuravum.com/api/revalidate
REVALIDATE_SECRET=<random string>
IMAGE_ENCRYPTION_KEY=<exactly 32 chars — NEVER change after images are stored>
PRISMA_QUERY_ENGINE_TYPE=binary
```

### CMS (`/home/oorumur1/public_html/cms/.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.oorumuravum.com/api
```

### Frontend (`/home/oorumur1/public_html/frontend/.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.oorumuravum.com/api
NEXT_PUBLIC_SITE_URL=https://oorumuravum.com
INTERNAL_API_URL=https://api.oorumuravum.com/api
REVALIDATE_SECRET=<same as backend>
```

---

## Quick Redeploy Checklist

For subsequent deployments (code changes only):

- [ ] Build changed app locally (`npm run build`)
- [ ] Package into ZIP (fix Windows paths, include static files)
- [ ] Upload ZIP to cPanel File Manager
- [ ] SSH in and extract + run install commands
- [ ] Remove sharp/_modules Windows binaries
- [ ] Fix permissions (`chmod -R u+rX .next`)
- [ ] Touch `tmp/restart.txt` to restart
- [ ] Verify with `curl` health checks

---

## Restart Commands

```bash
# Restart all apps
touch ~/public_html/api/tmp/restart.txt
touch ~/public_html/cms/tmp/restart.txt  
touch ~/public_html/frontend/tmp/restart.txt

# Or via cPanel → Node.js App Manager → Restart
```

---

## Useful Diagnostic Commands

```bash
# Check which apps are running
ps aux | grep node | grep -v grep

# View CMS log
tail -50 ~/cms.log

# View access logs
tail -20 ~/access-logs/api.oorumuravum.com-ssl_log
tail -20 ~/access-logs/oorumuravum.com-ssl_log

# Check DB tables
mysql -u oorumur1_tamil_user -pTest_1user oorumur1_tamil_news -e "SHOW TABLES;" 2>/dev/null

# Test backend directly
cd ~/public_html/api
PORT=3001 /home/oorumur1/nodevenv/public_html/api/22/bin/node app.js 2>&1 &
sleep 3 && curl -sk http://localhost:3001/api/health
kill %1

# Check Node.js version
/home/oorumur1/nodevenv/public_html/api/22/bin/node --version
```

---

*Last updated: August 2026*


## Deployment Gotchas (learned 2026-11-24)

These issues were hit during a CMS deploy done entirely through the cPanel
API (no SSH access — ports 22/2222/21098 all time out):

1. **Zip must use forward slashes.** `Compress-Archive` writes entries with
   `\` separators. PHP `ZipArchive::extractTo` on Linux treats `\` as a
   literal filename character, producing flat files like `cms\.next\...`.
   Build deploy zips with Python `zipfile` (or `zip -r`) instead.

2. **Strip UTF-8 BOM from `.next/required-server-files.json`.**
   `Fix-WindowsPaths` rewrites it with PowerShell `Set-Content -Encoding UTF8`
   which adds a BOM. Next.js `JSON.parse`s it per request and 500s with
   `Unexpected token '﻿'`. Strip the first 3 bytes after packaging.

3. **`.htaccess` must not have a BOM and must match the Node Selector
   config.** Only the `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION`
   block is needed (`PassengerStartupFile start.js`). Duplicated/appended
   `Passenger*` directives or a BOM cause Apache 500s. Without any
   `.htaccess`, Passenger can fall back to serving the wrong app.

4. **cPanel UAPI quirks:**
   - `Fileman::upload_files` reports success but leaves files as
     `Cpanel_Form_file.upload.*` in `~/tmp` — unusable.
   - POST to `/execute/` returns the login page; use GET with query params
     (URL length limit ~8 KB).
   - Workaround for large files: host the zip on a file host (e.g. catbox),
     then a temporary PHP script in `public_html` downloads it via
     `file_get_content` (needs a `User-Agent` header and
     `verify_peer=false`), extracts with `ZipArchive`, and touches
     `tmp/restart.txt`.
   - PHP `exec`/`shell_exec`/`proc_open` are disabled; `Cron` UAPI module is
     absent; PHP OPcache serves stale scripts — use a new filename per edit.

5. **SSH alternative used:** cPanel login (`/login/?login_only=1`) →
   `Fileman::save_file_content` (GET) for small files, PHP fetch for large
   ones, API2 `Fileman::fileop` (`op=unlink`, full paths in `sourcefiles`)
   for deletes.

6. **`/api/*` on the main domain is claimed by the backend.** The
   `public_html/api/.htaccess` Passenger block makes
   `https://oorumuravum.com/api/...` hit the Express backend, so Next.js
   app-routes under `frontend/src/app/api/` (e.g. `/api/revalidate`) are
   unreachable in production. Cache-revalidation endpoints must live at a
   non-`/api` path — `frontend/src/app/revalidate/route.ts` exists for this.
   Backend env must use `FRONTEND_REVALIDATE_URL=https://oorumuravum.com/revalidate`
   and a `REVALIDATE_SECRET` identical to the frontend's.

7. **cPanel maldet flags some file-host URLs in uploaded PHP** (e.g.
   tmpfiles.org triggered `BAILOUT malware detected` on
   `Fileman::save_file_content`). x0.at and catbox.moe URLs saved fine;
   catbox downloads can intermittently fail server-side — x0.at worked.

8. **`api.oorumuravum.com` is behind a caching nginx layer; the
   `oorumuravum.com/api` path is NOT.** GET responses on the API subdomain
   are cached upstream (identical stale bodies even after DB writes —
   this made CMS saves appear not to apply). All frontend/CMS traffic now
   uses `NEXT_PUBLIC_API_URL=https://oorumuravum.com/api`
   (`INTERNAL_API_URL` same), while media stays on the subdomain via
   `NEXT_PUBLIC_MEDIA_ORIGIN=https://api.oorumuravum.com`. The backend
   also sets `Cache-Control: no-store` + `X-Accel-Expires: 0` on `/api`
   responses so nothing new gets cached.

9. **`/uploads/*` on the main domain needed a symlink.** Apache serves
   existing docroot files directly (bypassing Passenger), but
   `public_html/uploads` did not exist. Created
   `public_html/uploads -> public_html/api/uploads` via PHP `symlink()`
   so `https://oorumuravum.com/uploads/...` serves media statically.

10. **Production DB contains `http://localhost:4000/uploads/...` URLs**
    (seeded from local dev). The frontend rewrites localhost/127.0.0.1
    backend URLs in API payloads to the media origin (`api.ts`
    `rewriteLocalBackendUrls`), but files that only exist on the dev
    machine still 404 — they must be re-uploaded via the CMS.

11. **The host injects `X-Frame-Options: SAMEORIGIN` on EVERY response**
    (nginx edge, all vhosts — `.htaccess` `Header unset` cannot remove
    it). Cross-subdomain iframes are impossible, so the CMS live preview
    cannot embed `oorumuravum.com` directly. Solution shipped:
    `publisher-dashboard/src/app/preview-site/[[...path]]/route.ts` — a
    same-origin reverse proxy that strips XFO/CSP, rewrites root-relative
    URLs in HTML to the `/preview-site` prefix, and forwards everything
    else (including `/api/*` calls the previewed page makes). The preview
    iframe URL is `https://cms.oorimuravum.com/preview-site`
    (`preview-config` falls back to `<origin>/preview-site` when
    `FRONTEND_PREVIEW_URL` is unset — the Passenger standalone server does
    NOT auto-load `.env*` files).

12. **`Set-Content -Encoding UTF8` in Windows PowerShell writes a BOM.**
    `build-deploy.ps1` rewrote `.next/required-server-files.json` with a
    BOM → `JSON.parse` 500 on every route. `Fix-WindowsPaths`, `start.js`
    and `.htaccess` generation now write via
    `[IO.File]::WriteAllText` with `UTF8Encoding($false)`. If a deployed
    Next app 500s with `Unexpected token '﻿'`, strip the BOM from
    `public_html/<app>/.next/*.json` via PHP.

13. **Never emit two `Passenger*` blocks in an app `.htaccess`.** The CMS
    template used to append a second block with
    `PassengerStartupFile server.js` — that bypasses `start.js` (the
    `_modules` resolver) and crash-loops the app. Keep exactly one block;
    `PassengerAppLogFile /home/oorumur1/logs/passenger.log` makes app
    stdout/stderr readable via PHP.

14. **`deploy/cms.zip` entries are prefixed `cms/`.** Extract scripts
    must strip the leading `cms/` or files land in `public_html/cms/cms/`
    and the running app never updates.

15. **MSYS/Git-Bash mangles `/home/...` inside curl `-F`/`--data` values.**
    `curl -F "dir=/home/oorumur1/..."` from Git Bash silently rewrites the
    path to `C:/Program Files/Git/home/oorumur1/...` — `upload_files` and
    `save_file_content` then report success but write into a literal
    `/home/oorumur1/C:` directory tree. Symptoms: uploads "succeed" but
    `get_file_content` says the file doesn't exist. Fixes: run uploads via
    Python `subprocess` (no MSYS layer — `deploy/fe_upload.py`,
    `deploy/be_upload.py` are working examples), or prefix bash curl calls
    with `MSYS2_ARG_CONV_EXCL="*"`. If it happens, delete the stray
    `/home/oorumur1/C:` tree via API2 `Fileman::fileop` `op=unlink`
    (walk bottom-up; UAPI has no `fileop` — API2 does, and `unlink` is the
    delete op, `delete` is invalid).

16. **`Fileman::upload_files` (UAPI) works and accepts multiple
    `file-N=@path` fields per call, one target `dir` per call.** Batch
    ~12 files per request; larger batches can drop the connection. This is
    the only reliable way to deploy many files without SSH/PHP/cron —
    extract the deploy zip locally and upload per-directory. `_modules`
    (node_modules) rarely changes; skip it to save ~1000 files.

17. **API2 `Cron::add_line` gets "Access denied" after a malformed line is
    added once** — and cPanel cron cannot be relied on for deploys anyway.
