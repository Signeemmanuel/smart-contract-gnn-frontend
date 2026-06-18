# smart-contract-gnn-frontend

The web front end (repository **3 of 3**) for the SC-GNN smart-contract flaw
detector. It consumes the [`smart-contract-gnn-api`](https://Signeemmanuel-smart-contract-gnn-api.hf.space)
backend and turns a Solidity contract into a set of DASP findings — each with a
confidence and the **source lines the model holds responsible**, highlighted
directly in the rendered contract.

Built with **Vue 3** (`<script setup>` SFCs), **Vue Router**, and **Vite**. No UI
framework — the interface is hand-built from a small, documented design-token
system, so it stays light and fully themeable.

---

## Features

- **Analyse by paste, sample, drag-drop, or upload.** Six one-click sample
  contracts (one per class plus a clean one); a `.sol` upload that exercises the
  backend's file endpoint; drag-drop to load a file for editing.
- **Linked source ↔ findings.** Hovering or focusing a finding lights up its
  ranked lines in the source viewer and scrolls them into view. A scan sweep
  plays while the model is working.
- **Full async lifecycle.** Submit → queue → analyse → done is shown as a live
  stepper with elapsed time; the client polls the job to completion with a single
  automatic retry on `503` backpressure and a ceiling above the server timeout.
- **Honest result states.** A clean contract shows a "no findings" panel with the
  safety caveat; a degraded control-flow graph is flagged; failures show the
  backend's structured `code` and message.
- **Live service status.** A header pill polls `/health` (live / mock / not ready
  / offline); the Status page shows the resolved commit, threshold and device.
- **Light & dark themes.** A System / Light / Dark switch in the header defaults to
  the operating-system setting and tracks it live, remembers an explicit choice in
  `localStorage`, and is applied before first paint so there is no flash.
- **Flaw reference.** Plain-language descriptions of all five DASP classes, served
  from `/flaws`, plus a short "how a contract is read" explainer.
- **Quality floor.** Responsive to mobile, visible keyboard focus, reduced-motion
  respected, semantic colour per flaw class.

## API coverage

Every backend endpoint is consumed (see `src/api/scgnn.js`):

| Endpoint | Used by |
|----------|---------|
| `GET /health` | `useHealth` → header pill + Status page |
| `GET /flaws` | `useFlaws` → finding names/DASP numbers + Reference page |
| `POST /analyze` | `useAnalysis.analyzeSource` (textarea / samples) |
| `POST /analyze/file` | `useAnalysis.analyzeFile` (`.sol` upload) |
| `GET /analyze/{job_id}` | `useAnalysis` polling loop |

## Project structure

```
smart-contract-gnn-frontend/
├── index.html
├── vite.config.js
├── .env.example
└── src/
    ├── main.js                 # app bootstrap
    ├── config.js               # env-driven config (API URL, polling)
    ├── App.vue                 # shell: header / router-view / footer
    ├── router/index.js         # hash routes: Analyse, Reference, Status
    ├── api/
    │   ├── client.js           # fetch wrapper + typed ApiError
    │   └── scgnn.js            # one method per backend endpoint (JSDoc typedefs)
    ├── composables/
    │   ├── useHealth.js        # GET /health
    │   ├── useFlaws.js         # GET /flaws (session-cached)
    │   └── useAnalysis.js      # submit + poll lifecycle, abort, 503 retry
    ├── constants/flaws.js      # class colours, descriptions, sample contracts
    ├── assets/styles/
    │   ├── tokens.css          # design tokens (colour, type, spacing, motion)
    │   └── base.css            # reset + base + utilities
    ├── components/             # reusable UI (Base*, SourceViewer, FlawCard, …)
    └── views/                  # AnalyzeView, ReferenceView, StatusView
```

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the built dist/ locally
```

The app works out of the box against the deployed backend — no `.env` needed.

## Configuration

Copy `.env.example` to `.env` to override defaults:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | the deployed Space | Backend base URL (point at a local API or your own Space) |
| `VITE_POLL_INTERVAL_MS` | `1000` | Job polling cadence |
| `VITE_POLL_TIMEOUT_MS` | `150000` | Client ceiling (above the server's 120s analysis timeout) |

**CORS:** the browser calls the API directly, so the backend must allow this
app's origin. Set `SCGNN_CORS_ORIGINS` on the backend to include your dev origin
(`http://localhost:5173`) and your deployed front-end origin.

## Design system

All colour, type, spacing and motion live as CSS custom properties in
`src/assets/styles/tokens.css`; components reference the variables and never
hard-code values, so retheming is a single-file change. Colour tokens are
theme-scoped — the dark palette is the default and `[data-theme="light"]`
overrides the colour set — which is why adding the light mode touched only the
tokens file plus a small `useTheme` composable and the header toggle. The palette
is a layered ink base with a teal "signal" primary, a violet secondary, and a
five-hue ramp mapped one-to-one to the DASP classes (also exposed as
`--flaw-<type>`). Type pairs Space Grotesk (display) with Inter (UI) and
JetBrains Mono (code and data).

## Deployment

`npm run build` emits a static `dist/` (relative asset paths, so it serves from
any subpath). Host it on any static host — Netlify, Vercel, GitHub Pages, or a
Hugging Face **static** Space — and set `VITE_API_BASE_URL` at build time if your
backend differs from the default. Remember to add the deployed origin to the
backend's `SCGNN_CORS_ORIGINS`.

## Limitations

The detector is a decision-support aid, not a guarantee: confidence is a
probability, line localisation is approximate and can be empty, and a clean
result is not proof a contract is safe. Detection is stronger on some classes
than others. These caveats are surfaced in the UI by design.

## Licence

Apache-2.0.
