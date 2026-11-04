---
title: "Build a desktop-style personal website"
description: "Build the app window, glass surfaces, sketchbook animations, and embedded pages used on n3n.lol."
pubDate: 2026-11-03
draft: true
---

Build the desktop with HTML, CSS, and JavaScript. Use one shared app window for Home, Writing, Reading Room, and Agents & Skills.

The [prototype source](https://github.com/kaushik-himself/n3n-site/tree/codex/github-build-notes/prototypes/desktop) includes a working version. Download it and serve the desktop folder locally:

```sh
cd prototypes/desktop
python3 -m http.server 8769 --bind 127.0.0.1
```

Open `http://127.0.0.1:8769/index.html`. To build your own version, follow these steps.

## 1. Create the desktop layout

Use three layers: a background, an app window, and a dock. Keep the dock outside the window so it stays available when the window closes.

```html
<div class="desktop">
  <div class="background" aria-hidden="true"></div>
  <section class="app-window" aria-label="Personal website">
    <header class="titlebar">n3n.lol</header>
    <div class="app-layout">
      <aside class="sidebar" aria-label="Site navigation"></aside>
      <main class="app-content"></main>
    </div>
  </section>
  <nav class="dock" aria-label="Website apps"></nav>
</div>
```

Make the desktop fill the viewport. Use a two-column grid inside the app: a fixed-width sidebar and a flexible content area. Give the content area `min-width: 0` and `overflow: auto` so long pages scroll inside the window.

Start with an app width of `min(1180px, calc(100vw - 96px))`. Reduce the outside margin on small screens. Reserve space below the window for the dock.

## 2. Keep navigation inside one window

Put each page in a section with a `data-view` attribute. Give sidebar and dock buttons a matching `data-page` value. Show the selected section and hide the others.

```js
const pages = document.querySelectorAll('[data-view]');
const buttons = document.querySelectorAll('[data-page]');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.page;
    pages.forEach(page => {
      page.hidden = page.dataset.view !== selected;
    });
    buttons.forEach(item => {
      item.setAttribute('aria-pressed', String(item.dataset.page === selected));
    });
  });
});
```

Keep the window's position and size separate from the selected page. Changing pages should not move the window.

Use Pointer Events for dragging and resizing. Record the starting pointer position and window rectangle. On each move, calculate the new rectangle and clamp it inside the desktop. Call `setPointerCapture()` on the active handle so the gesture continues when the pointer leaves it. Ignore title-bar buttons when starting a drag.

Close hides the window. Minimize hides it until a dock app is selected. Maximize fills the available area; restore returns to the saved rectangle. Keep the dock buttons available in every state.

## 3. Add neutral glass surfaces

Keep the desktop white and the reading area opaque. Apply glass to the title bar, sidebar, and dock. Blur alone has little effect against white, so add a bright inner edge, a light grey rim, and a soft neutral shadow.

```css
.glass {
  background: rgb(239 239 239 / 55%);
  border: 1px solid rgb(255 255 255 / 85%);
  backdrop-filter: grayscale(1) blur(24px);
  box-shadow:
    inset 0 1px 0 white,
    inset 0 -1px 0 rgb(0 0 0 / 8%),
    0 12px 30px rgb(0 0 0 / 10%);
}
```

Use equal red, green, and blue values for neutral greys. Keep coloured glows out of the shadows.

Use a readable font and host its files locally. This site uses Manrope. Include the font's licence with the files. For reduced transparency or increased contrast, replace the translucent surfaces with solid ones.

## 4. Prepare and animate the drawings

Photograph or scan the sketchbook page. Crop each drawing, remove the paper background, and export the ink as an SVG or transparent image. Keep the original marks; automatic smoothing can change their character.

For a drawn-on effect, place a mask over the finished artwork. Animate white strokes inside the mask with `stroke-dasharray` and `stroke-dashoffset`. The mask reveals the drawing while the original ink supplies the visible lines.

```css
.reveal-stroke {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 2s linear forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

Set `pathLength="1"` on each reveal path. Adjust its width to cover the ink beneath it. Group nearby strokes and overlap their start times. This keeps individual strokes slow without making a detailed drawing take too long to finish. Check intermediate frames, especially around eyes and glasses.

For the rotating Home illustration, use a fixed-size frame. Reset each drawing's position and transform before inserting it. Fit the SVG inside the frame with `preserveAspectRatio="xMidYMid meet"`. Give cloned SVG masks unique IDs so they do not affect another drawing.

This site changes drawings every 6.5 seconds. It includes a pause button and stops automatic changes when reduced motion is requested or the page is hidden.

## 5. Load build notes from GitHub

Store articles as Markdown. Keep a JSON index with each article's title, summary, date, and file path. Fetch the index to build the blog list. Fetch the selected article when its link is clicked.

Render the article inside the existing app window. Add a back link to the list. Generate the article outline from its headings.

Use text nodes for article content and an explicit set of supported Markdown elements. Treat raw HTML as text. Allow only expected article paths and safe link URLs. Add loading, error, and retry states. Public GitHub content does not need a token in the browser.

Keep a draft article out of the published writing collection until it is ready. The prototype can still load that draft from its review branch.

## 6. Embed the Reading Room

Put the Reading Room in an iframe. Set its initial URL to `https://reading.nehanupoor.com/#journey` so it opens Journey. Keep its own navigation and design inside the frame.

The embedded page must use the full app content area. Remove any width limit inherited from text pages, along with the parent's reading padding.

```css
.app-content.is-embedded {
  padding: 0;
}

.app-content.is-embedded .embedded-page {
  width: 100%;
  height: 100%;
  max-width: none;
}

.embedded-page iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
```

If the embedded site has an unsuitable middle breakpoint, render it at a known layout width and scale it to fit. Recalculate the frame dimensions with `ResizeObserver` when the app window changes size.

## 7. Test the layout and metadata

Check a wide desktop, a small laptop, and a narrow phone view. Resize and drag the app. Open every page. Use the controls with a keyboard.

Check that the dock fits on screen, drawings stay out of the text, and embedded pages fill their container. Make the Home page fit where practical. Let long articles and reading lists scroll.

Give each page a browser title. Add a favicon and Open Graph image. This site uses the takeaway coffee doodle for both, with a 1200 × 630 PNG for the share image and an SVG for the favicon.

Commit the source and optimized assets to Git. Review the result in a preview before publishing it.
