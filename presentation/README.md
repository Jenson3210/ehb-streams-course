# Presentation: Mastering Java Streams API

A local browser presentation of the course. Plain HTML, CSS and JavaScript: no build step, no dependencies, no network
access needed. It mirrors the lesson `task.md` files and the demo `Main.java` files, in the order of the course.

## Open it

Open `index.html` in a browser (double-click it, or `open presentation/index.html` on macOS). It works from `file://`.
It reads the lesson images from the course folders (`../Introduction/...`), so keep it in this repository.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `→` `Space` `PgDn` | next step (a hidden item appears) or next slide |
| `←` `PgUp` | previous step or slide |
| `Home` / `End` | first / last slide |
| `O` | slide overview, grouped per course section; click to jump |
| `N` | presenter notes (solutions of the hands-on tasks live here, not on the slide) |
| `F` | fullscreen |
| `T` | dark / light theme |
| `?` | help |

Click the right half of the screen to go forward, the left half to go back. The URL hash is the slide number
(`index.html#14`), so you can bookmark or restart at any slide.

**PDF / handout:** print the page (Ctrl/Cmd+P, "Save as PDF", margins "None", background graphics on). Every slide gets its
own page with all hidden items revealed. Presenter notes are not printed.

## Files

| File | Purpose |
|---|---|
| `index.html` | all slides, one `<section class="slide">` each, in course order |
| `css/presentation.css` | theme, layout and the 1280x720 stage |
| `js/presentation.js` | navigation, step reveals, overview, notes, Java syntax highlighting |

## Editing slides

- **A slide** is a `<section class="slide" data-title="..." data-section="...">`. `data-title` and `data-section` feed
  the overview and the footer. Use `class="slide section"` for a section divider and `class="slide title"` for a title slide.
- **Step reveals:** add class `frag` to anything that should appear on the next key press. Items appear in document order.
- **Java code:** put it in `<script type="text/x-java" data-size="sm|xs">...</script>`. You can write `<` and `>` freely.
  End a line with `//>` to highlight it. Use `type="text/x-output"` for plain console output and `data-frag` to reveal it
  as a step.
- **Presenter notes:** an `<aside class="notes">` inside the slide. It is never shown on the slide itself.
- **Number boxes** (the `limit`/`skip` and `range` visuals): `<div class="boxes" data-from="0" data-to="14" data-keep="5-9"
  data-drop="0-4" data-gone="10-14"></div>`.
- A slide is designed for a 1280x720 stage, so keep text to what fits. The stage is scaled to the window.

## Keeping it in sync with the course

The slides copy text, tables and results from the `task.md` files and the `Main.java` demos. When a lesson changes, update the
matching slide. The course constraint still applies: the presentation adds **no class time** and no new code or activities;
it presents what the lessons already contain. Solutions of the hands-on tasks stay out of the slides (only in the notes).
