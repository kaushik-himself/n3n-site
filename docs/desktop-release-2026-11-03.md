# Desktop production release

The approved desktop design previously existed only in `prototypes/desktop/`.
The production Astro routes still used the old homepage. This release connects
that design to the actual homepage, writing index, articles, Reading Room, and
Agents & Skills routes. The Codex iframe export stays a preview artifact.

## Verification

- Astro static build, eight public-page discovery checks, and Wrangler dry run pass.
- Home at 1440 × 900: window 1180 × 756, at (130, 32); content overflow 0px.
- At 390 × 844: app remains inside the viewport; sidebar uses the icon rail;
  long content scrolls inside the app, with the compact dock below it.
- App links update the URL, page title, description, canonical, social metadata,
  article dates, and structured data. Browser Back restores the previous app.
- Article links open the full local article in the same window. Direct article
  responses include their text and the correct visible H1 without JavaScript.
- Close, minimize, reopen from dock, maximize, restore, drag, and keyboard resize
  work in the browser. Drag and resize retain window geometry across app changes.
- Reading Room loads the real production Journey with descending 2026–2019 years.
  At 1440px, iframe and content region both measure 972px wide.
- Self-hosted Manrope loads. Original SVG artwork remains in place; cloned mask
  IDs are unique. Console inspection found no application errors.

The terminal and wallpaper controls remain hidden. Reading Room is a separate
public application; this release does not rebuild or change its backend.
Actual search indexing and answer-engine citation are not measured here.
