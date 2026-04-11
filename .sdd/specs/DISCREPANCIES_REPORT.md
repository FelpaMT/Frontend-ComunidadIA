# Discrepancies Report

**Generated**: 2026-03-07T21:30:00Z
**Repository**: comunidadia-frontend-core-develop

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| WARNING | 6 |
| INFO | 6 |

---

## WARNING Level

### W-001: `btn-danger` CSS class used but never defined
- **Location**: `src/pages/Profile.jsx` (delete publication button, delete account button)
- **Impact**: Delete buttons render with browser-default button styling (no red color cue)
- **Action**: Add `.btn-danger` rule to `src/styles.css`

### W-002: `serializeBlocks()` duplicated in 3 files
- **Locations**:
  - `src/components/HtmlEditor.jsx` ~line 111
  - `src/pages/CreatePublication.jsx` ~line 82
  - `src/pages/EditPublication.jsx` ~line 81
- **Impact**: Any bug fix or enhancement must be applied in 3 places; divergence risk is high
- **Action**: Extract to `src/utils/serializeBlocks.js` and import

### W-003: `HtmlEditorUpdate.jsx` is dead code
- **Location**: `src/components/HtmlEditorUpdate.jsx`
- **Impact**: Maintenance burden; confusion for future developers; potential security issue if `marked` on raw HTML is ever invoked
- **Action**: Delete or explicitly document as deprecated/experimental

### W-004: Dead functions in Profile.jsx
- **Location**: `src/pages/Profile.jsx` — `handleUpdateProfile()` and `handleUpdatePublication()`
- **Impact**: Code noise; `handleUpdatePublication` uses `window.prompt()` which was replaced by the EditPublication page
- **Action**: Remove both functions

### W-005: `App.css` and `index.css` conflict with design system
- **Location**: `src/App.css`, `src/index.css`
- **Impact**: These files contain Vite scaffold dark-mode defaults. Although currently not imported in `main.jsx`, if accidentally imported they would break the light-theme design.
- **Action**: Delete both files or replace with project-specific content

### W-006: Subscription response shape inconsistency across consumers
- **Location**: `src/pages/Subscriptions.jsx` vs `src/components/SidebarMyFollowers.jsx`
- **Subscriptions.jsx** accesses: `item.nick_name`, `item.user.name`, `item.user.email`
- **SidebarMyFollowers.jsx** accesses: `f.user.nick_name`, `f.user.email`
- **Impact**: One of the two components may be reading the wrong fields; runtime rendering bug likely in one
- **Action**: Verify backend response shape for both endpoints and align component data access

---

## INFO Level

### I-001: N+1 API calls on Home feed
- **Location**: `src/pages/Home.jsx` lines 21-33
- **Pattern**: Fetches following list (1 call), then for each followed user fetches publications (N calls, not parallelized — sequential `for...of` loop with `await`)
- **Impact**: With 50 followed users, the Home page makes 51 sequential API calls on mount. Significant performance issue.
- **Action**: Parallelize with `Promise.all()` short-term; request a backend aggregation endpoint long-term

### I-002: `dangerouslySetInnerHTML` without client-side sanitization
- **Locations**: `src/pages/PublicationDetail.jsx`, `src/components/HtmlEditor.jsx` (preview), `src/pages/EditPublication.jsx` (preview)
- **Impact**: If the backend does not sanitize stored HTML, stored XSS is possible
- **Action**: Add DOMPurify client-side sanitization before rendering

### I-003: Token cookies are non-HttpOnly
- **Location**: `src/api/client.js` — cookies set via JavaScript `document.cookie`
- **Impact**: Access tokens are readable by JavaScript, increasing XSS impact. If XSS occurs (see I-002), tokens can be exfiltrated.
- **Action**: Have the backend set HttpOnly, Secure, SameSite=Strict cookies

### I-004: `EditPublication` preview uses `marked.parse()` on HTML content
- **Location**: `src/pages/EditPublication.jsx` ~line 267
- **Impact**: The content is stored as HTML, but the preview passes it through a Markdown parser. The output is unpredictable (Markdown is a superset of HTML but the parser may escape or misinterpret tags).
- **Action**: For HTML content, render directly via `dangerouslySetInnerHTML` (with sanitization) instead of `marked.parse()`

### I-005: 100ms setTimeout hacks in publication save flows
- **Locations**: `src/pages/CreatePublication.jsx`, `src/pages/EditPublication.jsx`
- **Impact**: Fragile synchronization between React state updates and imperative ref calls. May fail under slow renders.
- **Action**: Refactor to use `useCallback` + `useLayoutEffect` or consolidate serialization into the save function without relying on state timing

### I-006: Backend URL hardcoded
- **Location**: `src/api/client.js` line 3 — `baseURL: 'https://comunidadia-backend.pedagogiavirtual.com'`
- **Impact**: Cannot deploy to different environments (staging, development) without code changes
- **Action**: Replace with `import.meta.env.VITE_API_BASE_URL` and add `.env.example`
