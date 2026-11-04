# n3n — Neha Nupoor

Personal desktop-style website built with Astro and hosted as the `n3n-site` Cloudflare
Worker with static assets. The same deployment serves n3n.lol, www.n3n.lol,
nehanupoor.com, and www.nehanupoor.com. The canonical address is n3n.lol.

## Develop and deploy

```sh
npm ci
npm run dev
npm run build
npx wrangler deploy --keep-vars
```

The checked-in Wrangler configuration preserves all four existing domains and
pins the owner's Cloudflare account. Wrangler requires an authorized login to
that account. Keep preview deployments disabled. Review changes through a
feature branch and draft PR before merging. GitHub is the code source; a push
alone does not prove Cloudflare deployed it.

## Writing

Writing navigation opens the local `/writing/` index. Each published content entry has a canonical `/writing/<slug>/` HTML page. Substack remains an external link on the writing index. Set `draft: true` to exclude unfinished posts from both page generation and the sitemap. The agent build brief is published at `/writing/build-with-an-ai-agent/`.

`/sitemap.xml` is generated from the same published collection. `/robots.txt` allows crawling and declares that sitemap. Page metadata includes canonical URLs, social images, and accurate Person/WebSite/WebPage or BlogPosting JSON-LD. Run `python3 scripts/check-discovery.py` after building to check these public-page contracts.

## Privacy, terms, and Google OAuth branding

`/privacy/` and `/terms/` are public static pages on both n3n.lol and
nehanupoor.com. They cover the personal websites and the private
`Hermes - Signups` and `Hermes Personal Work` assistants, with nehan.signup@gmail.com as the support and
privacy contact. Keep their descriptions consistent with the assistant's actual
data handling and configured providers.

The OAuth branding URLs use the canonical domain: `https://n3n.lol/`,
`https://n3n.lol/privacy/`, and `https://n3n.lol/terms/`. Publishing these pages does
not change OAuth permissions, audience, publishing status, or verification.

## Reading room

The Reading Room app at `/reading/` embeds https://reading.nehanupoor.com/#journey. That hostname
and reading.n3n.lol are served by the separate reading-room-public gateway in the
same Cloudflare account, with code in neha-nupoor/reading-room. The writing site
has no reading database credential and never queries the library. Daily and
monthly enrichment remain with the existing reading-room app.


## Desktop interface

The public homepage now uses `src/layouts/DesktopLayout.astro`. It renders the
Home, Writing, Reading Room, and Agents & Skills pages inside one shared frame.
Every app and published article has a real URL. Links enhance into same-window
navigation with browser Back/Forward support, canonical metadata updates, and
local persistence for window geometry. A direct URL always selects that page,
regardless of the previously saved app.

`src/components/desktop/` holds the approved shell and original isolated SVG
artwork. `src/styles/desktop.css` carries its neutral glass styles, and
`src/scripts/desktop.js` manages the window and drawing animation. The separate
prototype remains a visual reference; its Codex iframe wrapper is not the public
site. Manrope fonts and optimized artwork are served from `public/art-assets/`.

Build notes are authored in the GitHub repository's content collection, then
rendered into the published HTML at build time. They do not depend on a runtime
GitHub request. The terminal and wallpaper picker stay hidden in this release.

Before publishing: build, run `npm run check:discovery`, check the desktop and
phone layouts, and test window controls, app navigation, direct article URLs,
and the embedded Reading Room. After deploying, verify the actual custom domains
and the rendered homepage; a passing build alone does not prove the new design
is live.
