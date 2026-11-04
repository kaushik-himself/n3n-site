---
title: "Build this site with an AI agent"
description: "An implementation brief for a coding agent, with design constraints, build stages, and acceptance checks."
pubDate: 2026-11-03
slug: build-with-an-ai-agent
draft: false
---

Give your coding agent a brief, your content, and your drawings. Ask it to build and test the site. Review the result in the same browser where you will use it.

The [desktop prototype and source](https://github.com/kaushik-himself/n3n-site/tree/codex/github-build-notes/prototypes/desktop) provide the visual reference. The brief below describes the finished site, including work needed before publishing the prototype.

## Provide the inputs

Give the agent the repository, your name and bio, links to your writing and projects, and the drawings it may use. Mark private material clearly. Supply reference screenshots and state which details matter.

For this site, the main constraints were a white background, neutral grey glass, original sketchbook lines, and one shared app window. Those decisions belong in the brief. The agent can choose the code structure after inspecting the project.

## Give the agent this brief

```text
Build a personal website with a desktop interface in this repository.
Use the supplied prototype as the visual reference and the supplied content as the source of facts.

1. Inspect the project.
Read the repository instructions, routes, content model, build scripts, and deployment configuration. Reuse the existing stack. Identify the changes needed to add the desktop interface without breaking published pages.
Done when you can name the files to change and the checks to run.

2. Build one app window.
Add Home, Writing, Reading Room, and Agents & Skills to the sidebar and compact dock. Switch their content inside one shared frame. Preserve the frame's size and position when changing pages. Support dragging, resizing, close, minimize, maximize, and restore. Reopen a hidden app from the dock.
Done when every control works with pointer and keyboard input and the window stays within the viewport.

3. Apply the visual constraints.
Use a white desktop, near-black text, and neutral grey surfaces. Keep the reading surface opaque. Make glass visible through its rim, inner highlight, blur, and neutral shadow. Use compact dock icons and give the app most of the available height. Keep body text readable.
Done when screenshots show no blue or pink tint and the dock does not cover the window.

4. Use the supplied drawings.
Isolate the original ink and preserve its line quality. Reveal the artwork with SVG masks. Overlap groups of strokes so detailed drawings finish promptly while individual strokes stay slow. Check intermediate frames around the glasses and other dense areas.
Cycle the Home illustration inside one fixed frame. Reset inherited position and transform styles for every drawing. Give cloned SVG masks unique IDs. Include pause and reduced-motion support. Keep ambient clouds away from text.
Done when every drawing stays inside its intended area throughout the animation and the final image matches the supplied artwork.

5. Connect the content.
Use real content and verified links. Read a skill's README before describing it. Show build notes as a list that opens an article inside the shared window. Open Reading Room at Journey and make its iframe fill the content area. Keep the terminal out of this version.
For publication, give each public page and article a stable URL, a normal link, and readable HTML in its initial response. Use GitHub as an authoring source; build published content into the site. Treat click-triggered GitHub fetching as a preview convenience.
Done when direct links, browser history, page reloads, and in-app navigation reach the same content.

6. Verify the result.
Check desktop, laptop, and phone widths, including the user's normal browser pane. Measure overflow, app bounds, dock clearance, drawing positions, and iframe width. Test focus, keyboard controls, pause, and reduced motion.
Check titles, descriptions, canonicals, social images, crawl directives, and discovery links. Compare declared metadata with the visible content. Report indexing and answer-engine visibility as unverified unless you have evidence from the relevant tools.
Done when you have screenshots and check results for the actual implementation, with any remaining limits stated.

Deliver the working preview, a short change summary, and the verification evidence. Preserve the scoped source and optimized assets in Git and open a draft pull request. Keep production publishing as a separate step.
```

## Review the result with specific corrections

Review a screenshot or the running site. Name the element, the fault, and the expected result. Give the agent one observable target per correction.

```text
The Reading Room leaves empty space on the right. Measure its container and iframe. Make the frame fill the available width. Verify the result at desktop and phone widths.
```

```text
The next doodle moves over the heading. Keep every rotating drawing inside the same frame. Verify each drawing's position after the transition, including the pizza and coffee.
```

```text
The glass looks tinted. Keep the background white and use neutral greys for the surfaces and shadows. Show the result in the browser pane I am using.
```

Ask for proof after each fix. A screenshot can confirm appearance; it cannot prove that a button, route, or keyboard interaction works. Have the agent test those actions and report the result.
