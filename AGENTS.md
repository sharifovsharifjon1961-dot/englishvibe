# Project Guidance

## User Preferences

- Audience is CEFR students at B1, B2 and C1 levels only
- Admin must be able to post and edit any content without coding
- No placeholders or TODOs; every module ships with real seed content
- No paid APIs; optional AI features must work without a key
- Colors: primary #7C3AED, accent #06B6D4, dark background #0B0F1A, light background #F8FAFC
- Dark/light toggle saved to localStorage with no flash on load
- Flashlight cursor effect and pointer-following glow cards, disabled on touch devices and with prefers-reduced-motion
- Neon buttons, animated page transitions, hover lift on cards
- Mobile-first, fully responsive, keyboard accessible
- Finish with a README covering setup, environment variables and admin login

## Accepted Requirements

- Mock Tests Hub with Full-Length and Topic-Wise tabs, level and skill filters, and a test runner with countdown timer, question navigator, flag for review, auto-submit, and a result summary with CEFR level estimate.
- Reading module with passage left and questions right, multiple-choice and matching questions, adjustable font size, text highlighter, and a start/pause/reset timer.
- Listening module with a custom audio player (play/pause, seek, 0.75x/1x/1.25x speed, skip ±10s, play-once mode) and question sets below.
- Speaking module with a question-card bank by level, prep and speaking countdowns, and a voice recorder with playback and download.
- Writing module with essay prompts, a live word counter against a target range, autosaved drafts, and a collapsible model answer.
- AI Dictionary with debounced search, CEFR level badge from local cefrWords.json, definitions, synonyms, example sentences, pronunciation audio, saved words, and flashcard mode, using the Free Dictionary API and Datamuse through a single lookupWord() function.
- Link Manager with a categorized directory of external links, search and category filter, and admin add/edit/delete/categorize.
- Admin Dashboard with passcode login, create/edit/delete for tests, passages, audio, speaking cards, writing prompts, links, and announcements, plus JSON import/export.
- Dark/light toggle saved to localStorage with no flash on load.
- Flashlight cursor effect and pointer-following glow cards, disabled on touch devices and with prefers-reduced-motion.
- Neon buttons, animated page transitions, and hover lift on cards.
- Mobile-first, fully responsive, keyboard-accessible layout.
- Eight uploaded PDF reading materials seed the Reading module content.
- README covering setup, environment variables, and admin login.

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Theme no-flash relies on index.html reading the same `cefr-theme` key the Zustand persist middleware writes; keep both in sync.
- Content writes are admin-gated in src/backend/mixins/content-api.mo requireAdmin, so a forged localStorage isAdmin flag only reveals UI and never grants writes.
- Reading PDFs map to passages by seed order index, so PASSAGE_PDFS in src/frontend/src/pages/ReadingPage.tsx must stay aligned with seedPassages() ordering.
- Backend upsert treats id 0 as create and non-zero as update; blank admin drafts must set id 0n so the canister assigns the next id.
- Biome rejects role=group/radio/dialog on div or button; use a fieldset, native input type=radio, or a native dialog element.
- Biome useMediaCaption needs a literal track child, and useExhaustiveDependencies rejects extra deps unless the value is read inside the effect body.
- A ui/Skeleton.tsx duplicate of the existing ui/skeleton.tsx breaks tsc with TS1149; import the lowercase module.
- GlowCard accepts only children, className and lift; put data-ocid markers on a wrapper div.
- CefrLevel is a value enum, so filter literals must use CefrLevel.b1 rather than the string "b1".
- OQL 0.7.1 exposes Entity.Decl rather than Entity.Entity, and MapEntity.toEntityManual takes two type params <K, V>.
- mo:core has no Text.fromChar, Nat32.toChar, Float.fromText or Text.toFloat; use Char.toText(), Char.fromNat32() and manual float parsing.
- Migration files must inline every record type; project imports like ../types fail with M0029.
