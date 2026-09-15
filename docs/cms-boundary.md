# CMS boundary contract

This document describes the **current** integration boundary between the React application and the Google-backed CMS. It is a test target and an operational reference, not a redesign proposal.

The goal is to keep local development and CI deterministic without pretending that Google Apps Script, Sheets or Drive are available during every build.

## Authority map

| Responsibility | Current authority |
| --- | --- |
| HTTP request/action mapping | `src/cms/api.ts` |
| Browser admin session | `src/cms/auth.ts` |
| Public/admin bootstrap selection and local fallback | `src/context/CmsContext.tsx` |
| Static public fallback entities | `src/data/landing` |
| Media proxy / Drive-image boundary | `api/media.ts` |
| CMS response types | `src/cms/types.ts` |

Production Google credentials/endpoints are **not** source authority and are not required by CI.

## Environment boundary

The browser CMS client reads:

```text
VITE_MORA_CMS_URL
```

The server-side media proxy reads:

```text
MORA_CMS_URL
```

These are intentionally separate runtime surfaces:

- `VITE_MORA_CMS_URL` is compiled into the browser app and points at the Apps Script HTTP API;
- `MORA_CMS_URL` is server-side and is used by `/api/media` to retrieve media payloads upstream.

If `VITE_MORA_CMS_URL` is missing, `requestCms()` returns a structured failure rather than throwing during application startup.

CI must not require either production value to typecheck or build the repository.

## Public read contract

The public application requests the `bootstrap` action through `cmsApi.getPublicBootstrap()` using HTTP `GET`.

`CmsProvider` deduplicates simultaneous public bootstrap work with a shared promise so React development StrictMode does not intentionally create parallel bootstrap requests.

### Successful CMS response

When the response is `success: true` and includes `data`:

- `source` becomes `cms`;
- CMS content/settings/entities are authoritative for that request;
- entity media is normalized before it reaches consumers;
- an empty array from CMS is a valid authoritative empty collection;
- local fallback data is **not** mixed into a successful CMS result.

This distinction is important: **empty CMS data is not the same thing as unavailable CMS**.

### CMS unavailable or unsuccessful

For the public site only, an unsuccessful/missing CMS response moves the provider to:

```text
source = fallback
```

The public fallback maps the repository-owned static datasets:

- `PRODUCTS` → product-shaped entities;
- `MURALS` → project-shaped entities;
- `EXHIBITIONS` → event-shaped entities.

Fallback identifiers are generated locally (`fallback-p-*`, `fallback-m-*`, `fallback-e-*`) and the mapped entities are treated as published public content.

### Content and settings fallback

`CmsContext` does not invent a second global content/settings object when CMS is unavailable.

Instead:

- `content` / `settings` resolve to empty objects when there is no CMS data;
- `getContent(key, fallback)` and `getSetting(key, fallback)` let each consumer provide its explicit local fallback value.

This is the current contract and should be reflected in tests: entity fallback is provider-level, while copy/settings fallback is consumer-provided.

## Admin contract

The admin surface intentionally does **not** use public fallback data as if it were editable CMS state.

### No stored session

When the path starts with `/admin` and there is no valid stored token:

- `CmsProvider` does not trigger the public bootstrap;
- the admin/login experience can render without contacting production services;
- no local static fallback is presented as admin data.

### Stored session

A valid admin token is stored under:

```text
mora_admin_session
```

in `sessionStorage`.

The stored shape includes:

- `token`;
- optional `expiresAt`;
- optional `user`.

`cmsAuth.getToken()` removes an expired session before returning `null`.

With a valid token, admin bootstrap uses a `POST` request and includes the token in the JSON body prepared by `requestCms()`.

If authenticated admin bootstrap fails:

- `source` does not become `fallback`;
- an admin error is surfaced;
- static public data is not substituted for editable server state.

That asymmetry between public and admin behavior is intentional.

### Logout

`cmsApi.logout()` calls the authenticated `logout` action and then clears the local session through `cmsAuth.logout()`.

The local session is therefore cleared even when the upstream response is an unsuccessful `ApiResponse`, because the request helper normalizes request errors into a returned failure object.

## Request/action matrix

Public reads use `GET` without auth:

- `health`;
- `bootstrap`;
- `products`;
- `projects`;
- `events`;
- `content`;
- `settings`.

Login uses unauthenticated `POST`.

Admin reads/writes use authenticated `POST`, including:

- admin bootstrap and entity reads;
- create/update/status/archive/restore operations;
- content/settings writes;
- media upload and media metadata operations.

For authenticated POST actions, the browser token is included in the request body rather than a custom authorization header.

This document describes the existing protocol; changing the auth transport is a separate security/API design decision.

## Response/error normalization

`requestCms()` currently guarantees a useful client-side failure shape for transport problems:

```ts
{
  success: false,
  error: string
}
```

The helper normalizes at least:

- missing browser CMS URL;
- non-2xx HTTP responses;
- failed fetch/network operations;
- JSON/request exceptions caught by the helper.

The current TypeScript types describe expected response payloads, but `response.json()` is **not runtime-schema validated** before use. CI/documentation must not claim runtime response validation that the code does not yet perform.

A future Zod/schema layer would be an explicit product-hardening change, not documentation of current behavior.

## Media normalization contract

Entities returned by the CMS can include media records.

When a media id starts with `med_`:

- its browser URL is rewritten to `/api/media?id=<id>`;
- a cover media item is preferred for the entity-level `image` field;
- otherwise the first media item can supply the entity image;
- non-`med_` media URLs are not blindly rewritten.

This keeps Google/Drive media retrieval behind the application proxy instead of making UI components understand upstream storage details.

## `/api/media` proxy contract

The server-side proxy accepts only ids matching:

```text
^med_[A-Za-z0-9_-]+$
```

Current safeguards include:

- server-only `MORA_CMS_URL` requirement;
- 15 second upstream timeout;
- upstream non-2xx → proxy failure;
- required `success` + base64 payload;
- MIME allowlist: JPEG, PNG, WebP;
- rejection of zero-byte decoded payloads;
- `X-Content-Type-Options: nosniff`;
- bounded cache headers for successful media;
- `no-store` for JSON errors.

The proxy is a deterministic boundary that can be tested with mocked `fetch`; tests do not need real Drive files.

## What CI can test without Google

Useful focused tests should use fixtures/mocks around these contracts:

1. missing `VITE_MORA_CMS_URL` returns a structured failure;
2. non-2xx/network failures are normalized;
3. `med_*` media ids are rewritten through `/api/media`;
4. cover-media selection is deterministic;
5. successful empty CMS collections stay empty rather than falling back;
6. public CMS failure activates static entity fallback;
7. admin failure never activates static public fallback;
8. expired `sessionStorage` auth is removed;
9. authenticated requests include the token in the POST body;
10. media proxy rejects invalid ids/MIME/empty data and handles timeout/upstream errors.

None of those tests require production credentials.

## What should not be tested in ordinary CI

Do not make PR quality depend on:

- live Google Apps Script availability;
- a real Google Sheet;
- real Drive media;
- production admin passwords/tokens;
- production Vercel secrets;
- mutable production content.

Those are integration/deployment concerns and need a separately controlled environment if end-to-end verification is ever added.

## Security and truth boundary

This document intentionally describes the current implementation rather than overstating it.

In particular:

- browser admin auth currently uses `sessionStorage`, not an HttpOnly cookie;
- expected CMS payloads are typed but not runtime-schema validated;
- production endpoint/secrets stay outside source control and CI;
- public fallback is a resilience behavior, not evidence that the CMS is healthy;
- static fallback and live CMS content must not be merged silently because they have different authority.

## Next test slice

The first automated CMS tests should target **pure/deterministic boundaries**, especially response/media normalization and fallback selection. If extracting small pure helpers improves testability, do that narrowly rather than introducing a generalized data layer or requiring Google services in tests.
