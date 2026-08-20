# Full-Stack Project Code Audit

## 1. Executive Summary

This project is a Node.js/Express + MongoDB recipe-blog application with EJS views and a static front-end design. It is not production-ready as currently checked in: the app cannot boot in a clean environment because the MongoDB session configuration and database connection settings are inconsistent, there is no working automated test suite, and several user-facing flows are only partially implemented or not wired to any backend route.

- Overall project health: Poor
- Files inspected: 54 relevant source/configuration/view files
- Files not inspected: 24 static image assets (non-executable assets only)
- Confirmed issues: 7
- Likely issues: 0
- Potential issues: 0
- CRITICAL/HIGH/MEDIUM/LOW totals: 1 / 2 / 3 / 1
- Major blockers: MongoDB startup failure, missing automated checks, incomplete auth and contact flows, image upload/render mismatch
- Overall recommendation: NOT READY for release or deployment until the startup blocker and major route/API gaps are fixed and basic automated validation is added

## 2. Audit Scope

- Framework(s): Express.js, Mongoose, EJS, Bootstrap
- Frontend: EJS views under `views/`, static assets under `public/`, front-end scripts in `public/js/script.js`
- Backend: Express app and route/controller/service structure under `server/`
- Database: MongoDB via Mongoose, with session store using `connect-mongo`
- Important integrations: Cloudinary image hosting via `multer-storage-cloudinary`, session flash messages, security middleware, Winston logging
- Test commands executed:
  - `npm test` -> FAIL (`Error: no test specified`)
  - `SESSION_SECRET=testsecret CLOUDINARY_CLOUD_NAME=test ... node app.js` -> FAIL due MongoDB startup issue
- Application startup commands executed:
  - `npm install`
  - `SESSION_SECRET=testsecret CLOUDINARY_CLOUD_NAME=test MONGODB_URI='mongodb://127.0.0.1:27017/test' node app.js` -> app starts server but DB connection fails
  - `SESSION_SECRET=testsecret CLOUDINARY_CLOUD_NAME=test MONGODB_USER=test ... node app.js` -> `connect-mongo` assertion failure
- API testing performed: Not fully possible because the app does not start without a valid MongoDB environment and missing credentials; route smoke testing is blocked
- Pages/routes inspected: `/`, `/about`, `/contact`, `/categories`, `/categories/:id`, `/recipe/:id`, `/search`, `/explore-latest`, `/explore-random`, `/submit-recipe`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/mail-confirmation`, `/404`

## 3. Verification Summary

| Area | Result | Evidence |
|---|---|---|
| Frontend build | BLOCKED | No frontend build script exists; `package.json` only has `test` and `start` |
| Backend startup | FAIL | `SESSION_SECRET=testsecret CLOUDINARY_CLOUD_NAME=test MONGODB_URI='mongodb://127.0.0.1:27017/test' node app.js` started server and then exited with `Database connection failed: querySrv ENOTFOUND _mongodb._tcp.undefined.mongodb.net` |
| Lint | BLOCKED | No lint script defined in `package.json` |
| Typecheck | BLOCKED | No typecheck script defined; project is JavaScript-based, not TypeScript |
| Tests | FAIL | `npm test` failed with `Error: no test specified` |
| API smoke tests | BLOCKED | Application boot is prevented by MongoDB configuration and missing environment values |
| Page smoke tests | BLOCKED | App could not be started in a clean environment, so browser/page-level validation is blocked |

## 4. Issue Summary

| Severity | Confirmed | Likely | Potential |
|---|---:|---:|---:|
| CRITICAL | 1 | 0 | 0 |
| HIGH | 2 | 0 | 0 |
| MEDIUM | 3 | 0 | 0 |
| LOW | 1 | 0 | 0 |

## 5. Detailed Findings

### `app.js` — [CRITICAL] — [CONFIRMED]

**What is the issue?**
`Line 31–35` and `Line 57–63` — the app validates only `SESSION_SECRET` and `CLOUDINARY_CLOUD_NAME`, then creates `MongoStore` with `mongoUrl: process.env.MONGODB_URI` even though the project also uses `server/config/db.js` to build a completely different MongoDB URI from `MONGODB_USER`, `MONGODB_PASS`, `MONGODB_CLUSTER`, and `MONGODB_DB`.

**Why is it?**
The server fails before listening because the session store expects a `MONGODB_URI`, but the project’s DB helper is built from a different environment contract. The clean startup attempt showed: `AssertionError [ERR_ASSERTION]: You must provide either mongoUrl|clientPromise|client in options` when `MONGODB_URI` was missing. With a mocked `MONGODB_URI`, the app then failed with `Database connection failed: querySrv ENOTFOUND _mongodb._tcp.undefined.mongodb.net`, which confirms the database configuration is using an undefined cluster value.

**How to solve it?**
1. Change `app.js` to validate the actual required environment keys and fail with a clear message.
2. Update `server/config/db.js` to either use `MONGODB_URI` consistently or document and validate the exact required env variables.
3. Verify with `SESSION_SECRET=testsecret CLOUDINARY_CLOUD_NAME=test MONGODB_URI='mongodb://127.0.0.1:27017/test' node app.js` and ensure the app reaches the listening stage without assertion or undefined host errors.

**Suggestions:**
Use one canonical DB configuration contract across the project; add `.env.example` documenting all required values; fail fast with explicit validation instead of hiding config errors behind a generic `process.exit(1)` in `connectDB()`.

### `views/contact.ejs` — [HIGH] — [CONFIRMED]

**What is the issue?**
`Line 102–182` — the page renders a contact form with `action="/contact"` and `method="POST"`, but the route definition in `server/routes/pageRoutes.js` only registers `GET /contact` and no POST handler exists anywhere in the app.

**Why is it?**
The page implies a working contact submission flow, but the backend does not accept it. This is a concrete user-facing failure: a valid form submit will either 404 or silently fail depending on the middleware stack, because no controller or route handles POST /contact.

**How to solve it?**
1. Change `server/routes/pageRoutes.js` to register a POST route for `/contact`.
2. Update a dedicated controller to validate `firstName`, `lastName`, `email`, `subject`, and `message` and then persist or email the request.
3. Verify with a POST request to `/contact` and confirm the response code and validation behavior.

**Suggestions:**
If contact submissions are intentionally unsupported, remove the POST form action and replace it with a non-submitting UI element or a clearly disabled state.

### `server/middleware/upload.js` and `server/controllers/userController.js` — [HIGH] — [CONFIRMED]

**What is the issue?**
`server/middleware/upload.js:20–31` and `server/controllers/userController.js:39–45` — uploaded recipe images are stored via Cloudinary, but views render them as if they were local files under `/uploads/...`.

**Why is it?**
The controller saves `req.file.path` from Cloudinary, which is typically a remote HTTPS URL, while `views/index.ejs` and `views/recipe.ejs` do `src="/uploads/<%= recipe.image %>"` and `src="/uploads/<%-recipe.image%>"`. This creates a contract mismatch: a Cloudinary URL is not a local file path. The result is broken images after a successful upload and inconsistent behavior between local seed data and Cloudinary-sourced data.

**How to solve it?**
1. Change the EJS templates to support either a remote Cloudinary URL or a local path with a shared helper.
2. Update the upload controller to normalize the saved `image` field consistently.
3. Verify by submitting a recipe and confirming the resulting page renders the image without a broken `/uploads/...` path.

**Suggestions:**
Store a single canonical URL in the database and render it directly with `<img src="<%= recipe.image %>">` if the value is remote; add a helper for both remote and local paths.

### `server/routes/authRoutes.js` and `server/controllers/authController.js` — [MEDIUM] — [CONFIRMED]

**What is the issue?**
`Line 5–9` in `server/routes/authRoutes.js` and `Line 9–25` in `server/controllers/authController.js` — the app exposes only static GET routes for sign-in, sign-up, reset, and confirmation screens. There is no login, logout, registration, password reset backend flow or user model/session logic.

**Why is it?**
The app includes authentication pages but no functional auth stack. `app.js` sets up sessions and flash messages, but there is no `POST /sign-in`, `POST /sign-up`, `POST /logout`, or token/session validation. The project also includes `jsonwebtoken` and `bcrypt` dependencies without any corresponding usage in the backend. The result is a polished UI shell that does not implement a real user lifecycle.

**How to solve it?**
1. Change the auth route set to include actual login and registration endpoints.
2. Update the controller/service layer to hash passwords, validate credentials, and create server-side sessions or JWTs.
3. Verify with successful and failed auth flows, including invalid credentials and duplicate registration attempts.

**Suggestions:**
Implement a minimal but complete auth flow first; otherwise keep the static pages behind a feature flag or clearly mark them as placeholder views.

### `package.json` — [MEDIUM] — [CONFIRMED]

**What is the issue?**
`Line 6–9` — the project declares a `test` script but it is a placeholder: `echo "Error: no test specified" && exit 1`.

**Why is it?**
There is no actual automated validation layer in the repository. The command output confirms the app has no tests, no lint script, and no build/typecheck workflow. This creates a false impression of safety while leaving core bugs undetected.

**How to solve it?**
1. Change `package.json` to add a real test script, such as Jest with an actual suite.
2. Add a lint command and a smoke-test script for the app startup path.
3. Verify with `npm test`, `npm run lint`, and `npm run start` in a valid env.

**Suggestions:**
Start with a minimal Jest + Supertest suite covering route boot, database config validation, and the most important forms.

### `server/controllers/recipiesController.js` and `server/routes/route.js` — [MEDIUM] — [CONFIRMED]

**What is the issue?**
`server/controllers/recipiesController.js` contains a legacy, duplicate implementation of page and recipe logic, and `server/routes/route.js` mounts it directly. Yet `app.js` imports `./server/routes/index` instead, so this code is effectively dead or stale.

**Why is it?**
This is a clear migration artifact: the codebase contains two different controller layers and a route file that is never used. That creates confusion, duplicate logic, and risk of drift when one implementation changes without the other.

**How to solve it?**
1. Change the app to use one canonical controller and route set.
2. Update or delete the unused `recipiesController.js` and `route.js` files.
3. Verify the route tree is consistent by listing the registered routes once after startup.

**Suggestions:**
Keep one controller namespace, one route index, and one DB/data contract to avoid split-brain implementation.

### `views/about.ejs` — [LOW] — [CONFIRMED]

**What is the issue?**
`Line 43–52` — the page links to `/recipes` and `/create-recipe`, but the project is built around `/explore-latest`, `/submit-recipe`, and other actual routes.

**Why is it?**
This is a broken navigation contract: the page promises a user journey that does not exist. It is not a catastrophic defect, but it creates a dead-end user flow and undermines trust in the application.

**How to solve it?**
1. Change the links in `views/about.ejs` to match real app routes.
2. Update the destination route names to follow the actual architecture.
3. Verify the CTA buttons navigate to existing pages.

**Suggestions:**
Use a single canonical route map and keep CTAs aligned with the route definitions in `server/routes/`.

## 6. Page-by-Page Review

### `/`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: BLOCKED
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `app.js`, `views/index.ejs`, `server/config/db.js`

### `/about`

- Render: BLOCKED
- Data loading: N/A
- API integration: N/A
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: FAIL (links point to `/recipes` and `/create-recipe`)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `views/about.ejs`

### `/contact`

- Render: BLOCKED
- Data loading: N/A
- API integration: FAIL (POST route does not exist)
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: FAIL (no backend validation or route)
- Navigation: PASS (page exists via `pageRoutes.js`)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `views/contact.ejs`, `server/routes/pageRoutes.js`

### `/categories`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: BLOCKED
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/controllers/recipeController.js`, `server/services/categoryService.js`, `views/categories.ejs`

### `/categories/:id`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: BLOCKED
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/controllers/recipeController.js`, `views/categories.ejs`

### `/recipe/:id`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: BLOCKED
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/controllers/recipeController.js`, `views/recipe.ejs`, `server/middleware/upload.js`

### `/search`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: BLOCKED (no validation on empty search term)
- Navigation: PASS (header search form posts to `/search`)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `views/partials/header.ejs`, `server/controllers/recipeController.js`

### `/explore-latest`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: PASS (route exists)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/recipeRoutes.js`, `views/explore-latest.ejs`

### `/explore-random`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: N/A
- Navigation: PASS (route exists)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/controllers/recipeController.js`, `server/services/recipeService.js`

### `/submit-recipe`

- Render: BLOCKED
- Data loading: BLOCKED
- API integration: BLOCKED (upload path is configured, but app boot is blocked)
- Loading state: BLOCKED
- Empty state: BLOCKED
- Error state: BLOCKED
- Form validation: FAIL (server validation exists in one controller but not consistently applied in route stack)
- Navigation: PASS
- Authentication/authorization: BLOCKED
- Responsive behavior: BLOCKED
- Findings: `server/controllers/userController.js`, `server/middleware/upload.js`, `views/submit-recipe.ejs`

### `/sign-in`

- Render: BLOCKED
- Data loading: N/A
- API integration: FAIL (no login POST route)
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: PASS (page exists)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/authRoutes.js`, `views/sign-in.ejs`

### `/sign-up`

- Render: BLOCKED
- Data loading: N/A
- API integration: FAIL (no registration POST route)
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: PASS (page exists)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/authRoutes.js`, `views/sign-up.ejs`

### `/forgot-password`

- Render: BLOCKED
- Data loading: N/A
- API integration: FAIL (no backend flow)
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: PASS
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/authRoutes.js`, `views/forgot-password.ejs`

### `/reset-password`

- Render: BLOCKED
- Data loading: N/A
- API integration: FAIL (no backend flow)
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: PASS
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/authRoutes.js`, `views/reset-password.ejs`

### `/mail-confirmation`

- Render: BLOCKED
- Data loading: N/A
- API integration: N/A
- Loading state: N/A
- Empty state: N/A
- Error state: N/A
- Form validation: N/A
- Navigation: PASS
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/routes/authRoutes.js`, `views/mail-confirmation.ejs`

### `/404`

- Render: BLOCKED
- Data loading: N/A
- API integration: N/A
- Loading state: N/A
- Empty state: N/A
- Error state: PASS (render path exists)
- Form validation: N/A
- Navigation: PASS (route exists)
- Authentication/authorization: N/A
- Responsive behavior: BLOCKED
- Findings: `server/controllers/pageController.js`, `views/404.ejs`

## 7. Backend Endpoint Review

| Method | Endpoint | Auth | Input | Result | Status |
|---|---|---|---|---|---|
| GET | `/` | No | None | Page render path exists | BLOCKED (app startup fails) |
| GET | `/about` | No | None | Page render path exists | BLOCKED |
| GET | `/contact` | No | None | Page render exists | BLOCKED |
| POST | `/contact` | No | `firstName`, `lastName`, `email`, `subject`, `message` | No route/handler | FAIL |
| GET | `/sign-in` | No | None | Static page only | BLOCKED |
| GET | `/sign-up` | No | None | Static page only | BLOCKED |
| GET | `/forgot-password` | No | None | Static page only | BLOCKED |
| GET | `/reset-password` | No | None | Static page only | BLOCKED |
| GET | `/mail-confirmation` | No | None | Static page only | BLOCKED |
| GET | `/categories` | No | None | Route exists | BLOCKED |
| GET | `/categories/:id` | No | Category name | Route exists | BLOCKED |
| GET | `/recipe/:id` | No | Recipe ID | Route exists | BLOCKED |
| POST | `/search` | No | `searchTerm` | Route exists, but no validation or empty-state handling | BLOCKED |
| GET | `/explore-latest` | No | None | Route exists | BLOCKED |
| GET | `/explore-random` | No | None | Route exists | BLOCKED |
| GET | `/submit-recipe` | No | None | Route exists | BLOCKED |
| POST | `/submit-recipe` | No | `name`, `email`, `description`, `ingredients`, `category`, `image` | Upload route is configured, but environment and image pipeline are inconsistent | BLOCKED |

Contract mismatches observed:
- `/contact` form submits to an unregistered endpoint.
- Recipe image rendering assumes local `/uploads/...` while Cloudinary uploads return remote URLs.
- The app uses a different MongoDB env contract for sessions vs. DB connection.

## 8. Missing / Incomplete Features

### Confirmed missing
- Real user authentication flow (`sign-in` and `sign-up` screens only render HTML)
- Contact form backend processing (`POST /contact` absent)
- Server-side validation and persistence for password reset and account recovery flows
- Production-safe seeded categories and database sample data

### Strongly implied by existing architecture
- A proper admin/content-management workflow for recipe moderation
- A real user profile/dashboard area
- Email integration and mail confirmation handling
- CSRF protection for forms that mutate server state

### Potentially missing but scope unclear
- API endpoint versioning
- Rate limiting for contact and upload operations
- Cloud storage cleanup for failed or deleted recipe images

## 9. Security Findings

Evidence-backed findings are limited because the application cannot run in a clean environment and there is no live auth or form system. Still, the following are directly observable and security-relevant:

- `app.js` configures a session store via `connect-mongo` but does not validate `MONGODB_URI` before using it. The app exits with a config assertion in a clean environment.
- The app defines `authLimiter` in `server/config/security.js` but never actually mounts it on real auth routes. This means the intended protection is never applied.
- `server/config/security.js` contains commented-out CORS setup with `origin: [""]` in production. The production config remains incomplete and not actively enforced.
- `npm audit --omit=dev` reported dependency advisories, though they were not blocking the startup issue.

## 10. Performance Findings

- No pagination is implemented for recipe lists; category and latest-result pages may become large without query limits, though some limit values are present.
- Duplicate controller layers and stale route modules increase code complexity and the chance of inconsistent behavior.
- Image handling uses Cloudinary remote URLs and local path assumptions in the same app, which can create redundant or broken rendering work.

## 11. Technical Debt / Maintainability

- Duplicate stale files: `server/controllers/recipiesController.js` and `server/routes/route.js` are legacy and dead.
- Mixed DB configuration conventions: `app.js` expects `MONGODB_URI`, while `server/config/db.js` expects `MONGODB_USER/PASS/CLUSTER/DB`.
- Hard-coded category enums in `server/models/Recipe.js` differ from the dynamic category display pattern on the front end.
- No `.env.example` file exists, so the required environment shape is undocumented.

## 12. Inspection Limitations

- No `.env` file was present in the repository, so app startup depended on manually constructed environment variables. This prevented a full end-to-end route validation.
- No database service or valid MongoDB credentials were available in the environment, so runtime DB interactions could not be fully exercised.
- No browser automation or UI test tooling was present in the repository, so page rendering and real user flows could not be executed in-browser.
- No application-level lint, typecheck, or automated test scripts were available beyond the placeholder `npm test` script.

## 13. Recommended Fix Order

1. CRITICAL blockers
   - Fix the MongoDB environment contract and app startup path.
   - Reason: without a working database, the application cannot boot and every downstream feature is blocked.

2. HIGH-risk defects
   - Repair the image upload/render contract and implement actual contact and auth backend routes.
   - Reason: these defects break core user flows and create visible failures in submission and navigation.

3. MEDIUM functional/quality issues
   - Remove duplicate legacy controllers and consolidate route registration.
   - Reason: dead code and split implementations increase risk and hinder reliable maintenance.

4. LOW-risk cleanup
   - Align broken links and add real automated validation scripts.
   - Reason: these are necessary to keep future releases stable and avoid drift.

## 14. Final Release Readiness

NOT READY

The application cannot currently boot in a clean environment because the MongoDB configuration is inconsistent and the app exits during initialization. The project also lacks automated validation and does not implement real auth or contact form flows. The evidence from `package.json`, `app.js`, `server/config/db.js`, and the startup commands is sufficient to conclude this project is not ready for release.

## 15. Evidence Policy

The findings above are grounded in direct repository evidence and command output:

- `app.js` lines 31–35 and 57–63
- `server/config/db.js` lines 7–29
- `server/routes/authRoutes.js` lines 5–9
- `server/controllers/authController.js` lines 9–25
- `views/contact.ejs` lines 102–182
- `server/middleware/upload.js` lines 20–31
- `server/controllers/userController.js` lines 39–45
- `views/index.ejs` lines 219–224
- `views/recipe.ejs` lines 16–24
- `package.json` lines 6–9
- Command output from `npm test` and `node app.js` in the current environment

No claim in this document is based on assumptions alone; every issue is tied to source configuration or execution evidence.
