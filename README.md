# Element Grabber

Browser extension: hover over any part of a webpage, click it, and see the
HTML and CSS needed to recreate it. Save snippets for later.

## Status

Early development (v0.1). Works on Chromium browsers and Firefox.

## Install (development)

- **Chrome/Edge/Brave:** open `chrome://extensions`, enable Developer mode,
  click "Load unpacked", select this folder.
- **Firefox:** open `about:debugging#/runtime/this-firefox`,
  click "Load Temporary Add-on", select `manifest.json`.

## Usage

1. Press `Alt+Shift+G` on any page to toggle selection mode.
2. Hover to highlight, click to select.
3. Use Copy or Save in the panel. Press `Esc` to exit.

## Project structure

- `manifest.json`: extension config
- `content.js`: runs on pages: selection, extraction, panel UI

## Roadmap

- [ ] Include child elements' CSS
- [ ] Saved snippets library page
- [ ] Hover states and pseudo-elements
- [ ] AI cleanup (optional)

## License

MIT
