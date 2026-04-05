# n3n.com

Personal site for Neha Nupoor. Built with [Astro](https://astro.build), hosted on Cloudflare Pages.

## Structure

- `src/content/blog/` — markdown posts
- `src/pages/` — site pages
- `src/layouts/` — page templates

## Adding a post

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A short description."
pubDate: 2026-04-05
---

Your content here.
```

Push to `main` → Cloudflare auto-deploys.
