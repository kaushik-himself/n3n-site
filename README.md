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

Create a Markdown or MDX file in `src/content/blog/` with `title`, `description`,
and `pubDate` frontmatter. Set `draft: true` to exclude a post from both listings
and generated article pages. Published writing is generated under `/writing/`.

## Reading room

Navigation and homepage links use https://reading.nehanupoor.com/. That hostname
and reading.n3n.lol are served by the separate reading-room-public gateway in the
same Cloudflare account, with code in neha-nupoor/reading-room. The writing site
has no reading database credential and never queries the library. Daily and
monthly enrichment remain with the existing reading-room app.
