---
title: "Making n3n.lol"
description: "A personal website that feels like a desktop, with my sketchbook running through it."
pubDate: 2026-11-03
draft: true
---

The idea, the details that took a few attempts, and the small technical choices behind the result. Built in conversation with an AI coding assistant, and refined through a lot of looking at the actual screen.

## A small place with a few doors.

I wanted this site to hold the things I keep coming back to: art, books, writing, and software. A desktop gave those interests a useful home. Each part could feel like its own app, while still belonging to one place.

The starting reference was [PostHog’s website](https://posthog.com/blog/comparison-content-guide), where the content sits inside an application-like frame. The direction here became more personal: a white workspace, glass navigation, and drawings from my own sketchbooks around the edges.

The first versions tried separate windows. After using them, I chose one shared window instead. Home, Writing, Reading Room, and Agents & Skills change what is inside the frame. The window itself stays where you put it. There is less to manage, and each part still has a clear place in the dock.

## Keep the drawing. Animate the reveal.

The illustrations began as photographs of my daily sketchbook pages. They include the girl with glasses, clouds, a pencil, a brush, pizza, and a takeaway coffee cup. The aim was to keep the character of the original lines, including the small irregularities that make them mine.

The drawn-on effect uses SVG masks over the isolated ink. A mask reveals the drawing a little at a time. This lets the original linework remain the final image, while a separate set of paths controls how it appears.

This distinction mattered most around the glasses. Early intermediate frames looked like linked loops rather than scribbled lines. The reveal needed to respect the structure of the drawing, especially where the glasses, eyes, and hair meet. Changing the reveal was more useful than smoothing away the original marks.

The timing needed its own pass. Sending every little stroke through a single sequence made the portrait take too long, even when each stroke was fast. Letting groups of strokes overlap helped the drawing arrive sooner while keeping the individual marks slower. The clouds reveal from left to right, then move gently within a small area. Reduced-motion preferences show the finished drawings without the animation.

[Read about SVG masks ↗](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask)

## Making glass visible on white.

Glass was the hardest visual detail to judge. A blur is easy to add. On an empty white background, it has very little to blur. Increasing the blur alone did not make the interface feel more like glass.

The useful changes were at the edges: a reflective rim, a bright inner edge, a quieter gray edge underneath, and a soft shadow that separates the window from the desktop. The title bar and dock also have a light reflection that follows the pointer. Those details give the surface a little thickness without making the page itself transparent.

The palette is deliberately neutral. The gradient stops use equal red, green, and blue values. A grayscale backdrop filter stops a colored wallpaper from tinting the navigation. The text and reading surfaces stay opaque, so the material does not compete with the content.

```css
.glass {
  background: rgb(239 239 239 / 55%);
  backdrop-filter: grayscale(1) blur(24px);
  box-shadow: 0 18px 44px rgb(0 0 0 / 11%);
}
```

This is the small version of the material. The visible rim and reflection use extra layers. It is a web interpretation of [Apple’s Liquid Glass guidance](https://developer.apple.com/design/human-interface-guidelines/materials); it does not use Apple’s native rendering system. Reduced-transparency and higher-contrast preferences switch the navigation to more solid surfaces.

## A window that belongs to the browser.

The app frame is an element inside the page. It does not open another browser window. Its position, size, selected page, and open state are kept separately, which lets the content change without resetting the frame.

Dragging starts in the title bar. Pointer capture keeps the gesture connected to that title bar even if the pointer moves away from it. Each movement is checked against the desktop bounds so the window stays within reach. The same idea handles resizing from the edges and corners.

The three window controls have distinct jobs: close hides the window, minimize puts it away until an app is selected again, and maximize fills the available workspace. Restore returns to the previous rectangle. The resize control also accepts arrow keys.

The default desktop width is now up to 1180 pixels. That gives the pages enough space to read like an application on a laptop. On smaller screens, the frame fits the viewport, the sidebar becomes an icon rail, and the text returns to one column. Manrope is hosted locally with the site, and the buttons and dock share a neutral palette.

[Read about pointer events ↗](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## Let the reading room keep its character.

The Reading Room already has its own world: a calendar, book passages, and a softer illustrated style. Putting it inside the desktop should not erase that. It keeps its own design and navigation inside an embedded frame. Journey is the first view when the app opens; the calendar is still available from Home.

The main challenge was fitting it. The Reading Room’s middle breakpoint made the calendar feel too large inside a medium-sized window. The frame now chooses between the compact layout and the full desktop layout, rather than forcing that awkward middle size into a smaller space.

There was also a date issue. The calendar opened the latest month with activity. In November, a library with activity only through October still opened October. The initial selection now uses the current month, even if that month is empty. Browsing to an older month remains a separate choice.

The useful lesson across all of this was to test the real layout. A detail that looked fine in a wide capture could become cramped in the sidebar. The site needed checks at desktop, laptop, and phone widths, plus the ordinary browser size where it would actually be used.

This is still a small, evolving workspace. The aim is to keep the useful details and the personal ones close together: a tool that works, a passage worth returning to, and a line from a sketchbook.

[Explore Dynamic Visual Reply ↗](https://github.com/neha-nupoor/dynamic-visual-reply)
