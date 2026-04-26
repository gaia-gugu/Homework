# Session Handoff — Paternal Grandma + Cousin

## What we built
- New grandparent title `嫲嫲` (paternal grandmother) alongside `公公` / `婆婆`.
- Per-grandchild **allow-list** (`allowedGrandparentIds`) — restricts who a child can message.
- Per-grandchild **title overrides** (`grandparentTitleOverrides`) — e.g. the cousin sees 嫲嫲 displayed as 姥姥.
- Centralised colour/emoji helpers (`gpColorFromTitle`, `gpEmojiFromTitle`) in `constants.ts`.

## Key architectural decisions
- **Allow-list lives on the grandchild user, not in a separate collection.** Simplest data model; empty array = no restriction (preserves existing kids' behaviour).
- **Title overrides are a per-grandchild map keyed by grandparent id.** Avoids modelling family-tree branches (paternal/maternal) which doesn't survive divorces/step-relatives.
- **Conversation docs snapshot the resolved title at creation.** Each child's chat history shows the right name even if overrides change later.
- **Allow-list enforced in UI + `createConversation`, not Firestore rules.** Family app, low blast radius; rule-level enforcement adds latency and complexity.
- **`createFamilyUser` uses a secondary Firebase App for signup.** Primary `createUserWithEmailAndPassword` auto-signs in the new user, breaking the parent's session and tripping `allow create: if isParent()`. Secondary app keeps the parent authed so Firestore writes pass.

## Immediate next steps
1. Create the cousin: New Account → Child → tick only 嫲嫲 → Show as 姥姥.
2. Log in as cousin (incognito) — confirm she sees only 姥姥 and can message.

## Gotchas
- **PWA cache.** After deploy, refresh isn't enough — use incognito or DevTools → "Clear site data".
- **Two separate workflows.** `deploy.yml` → GitHub Pages (unused). `firebase-hosting.yml` → live site at `my-kin-app.web.app`. Only the latter matters.
- **Firestore rules are not deployed by the Hosting workflow** — edit them via `firebase deploy --only firestore` if needed.
- **`firebase.json` now pins `"site": "my-kin-app"`** — required, otherwise deploys land on the project's default site.
- **Soft-deleted accounts leave Auth users.** Reusing a username triggers `auth/email-already-in-use`; pick a fresh one.
