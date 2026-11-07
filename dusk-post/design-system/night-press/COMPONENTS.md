# Component conventions

Sheets are the only cards. Do not invent a second card style. Corners are square. The slug and the round controls are the exception, because they are tools, not prints.

## Sheet

Paper `#f7f1e6`, ink text, hairline border, crop marks in the corners. Padding `clamp(1.25rem, 3vw, 2rem)`. A sheet never uses the night-room colors for its text.

## Eyebrow

IBM Plex Mono, 0.72rem, uppercase, 0.16em tracking. Use it for pass names, edition codes, and section labels. Do not use it for sentences.

## Buttons

- Primary: ink fill, paper text, pill, min-height 44px. Hover darkens to `#3a3128`. Active presses down 1px. Disabled drops to 55% opacity and `not-allowed`.
- Quiet: transparent, 1px ink border. On the colophon, the border uses the room line color so it stays visible at night.
- Do not scale a button on hover. Scale shifts layout.

## Slug

Sticky, blurred room color, 44px targets. The current section uses a 2px underline, not a filled pill. Day, night, and sound are real buttons with accessible names. Icons are Lucide, `aria-hidden`, 18px. The word next to the icon hides below 760px. The sheet counter hides there too, so the links still fit.

## Sable

One interactive roller. Color ghosts are `aria-hidden` and ignore the pointer. The brass bell is a separate 44px button. Hold is pointer and keyboard (`Enter` / `Space`).

## Registration bed

The bed is a square with a center mark. Plates are 104px (84px below 760px), dragged or nudged. The selected plate has a 2px focus ring. Cyan, magenta, and yellow use multiply on the paper. The key plate does not, or it would black out the others. A status line always says whether the colors agree.

## Editions

Three columns from 760px up, one column below. The proof stamp is mono, magenta, rotated, and only appears after a pull. “Keep this sheet” is a toggle with `aria-pressed`.

## Composing stick

Sorts are 44px ink keys. The stick is Fraunces, 1.6rem, and announces through `aria-live`. Eighteen characters, then a plain status line.

## Desk

The error summary sits at the top of the form, is focused after a failed submit, and links to each field. Every invalid field also has its own message and `aria-describedby`. Tabs are `role="tab"` with `aria-selected`. An empty rack is a sentence, not a blank box. Taking a sheet down offers “Hang it back.”

## Dialog

Native `<dialog>` with `showModal`, so focus is trapped and Escape closes it. The panel is a sheet, not a blurred card.

## Motion and focus

Passes reveal with GSAP only when reduced motion is off, and they are visible if JavaScript never runs. Dots, the lamp, and ghost easing stop under reduced motion. `:focus-visible` is global. `scroll-padding-top` clears the sticky slug.
