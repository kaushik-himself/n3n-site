# n3n — Neha Nupoor

Personal writing site built with Astro and hosted as the `n3n-site` Cloudflare
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

Writing navigation and homepage calls to action open https://nupoorneha.substack.com.
The static asset `_redirects` file sends `/writing` and `/writing/` there with HTTP 301.
The generated index includes a browser redirect and clickable fallback. Existing
article routes are preserved; Markdown or MDX content remains in `src/content/blog/`.

## Privacy, terms, and Google OAuth branding

`/privacy/` and `/terms/` are public static pages on both n3n.lol and
nehanupoor.com. They cover the personal websites and the private
`Hermes - Signups` assistant, with nehan.signup@gmail.com as the support and
privacy contact. Keep their descriptions consistent with the assistant's actual
data handling and configured providers.

The OAuth branding URLs use the canonical domain: `https://n3n.lol/`,
`https://n3n.lol/privacy/`, and `https://n3n.lol/terms/`. Publishing these pages does
not change OAuth permissions, audience, publishing status, or verification.

## Reading room

Navigation and homepage links use https://reading.nehanupoor.com/. That hostname
and reading.n3n.lol are served by the separate reading-room-public gateway in the
same Cloudflare account, with code in neha-nupoor/reading-room. The writing site
has no reading database credential and never queries the library. Daily and
monthly enrichment remain with the existing reading-room app.
