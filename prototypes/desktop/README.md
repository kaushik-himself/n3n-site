# Desktop prototype

A saved, runnable copy of the n3n.lol desktop mockup. It is kept outside Astro's `public` and `src` folders and is not deployed by the site build.

Run from this folder:

```sh
python3 -m http.server 8769 --bind 127.0.0.1
```

Open http://127.0.0.1:8769/index.html. The app uses the existing public Reading Room at https://reading.nehanupoor.com/#journey. It does not contain a private Reading Room backend or user credentials.

`index.html` is the built preview, including its isolated app frame and local state bridge. `source/` keeps the editable desktop fragment and the main interaction/style files used to build it. Fonts, optimized artwork, and the owner's isolated doodles are included. No sketchbook photos or computer screenshots are included.

How it's made fetches the article index and Markdown from `codex/github-build-notes` in this repository. Rendering uses text nodes rather than executing Markdown HTML. The desktop has one shared draggable/resizable app window, a compact dock, a neutral white palette, full-width Reading Room, and a rotating Home sketchbook frame with pause and reduced-motion support.

The prototype is for review. It does not replace the production Astro pages. To rebuild from the full fragment in a plain environment, provide a page shell with the same icon/font dependencies and the optional `window.openai.setWidgetState` bridge; the saved index already includes those pieces.
