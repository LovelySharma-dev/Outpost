# Design decisions

Night Press is a proofing table for Sable, an original baby ink roller. These decisions override the generated black-and-white portfolio system where the two disagree.

## What the skill recommended, and what we kept

The generator (`creative print studio portfolio editorial`, variance 7, motion 6, density 3) returned:

- Pattern: scroll-triggered storytelling, with a progress indicator and a readable story if motion is off.
- Style: motion-driven, light and dark both supported.
- Spacing: spacious (density 3).
- Motion: short GSAP reveals, about 400ms, and no motion when `prefers-reduced-motion` is set.
- Stack notes: keep the page as a Server Component and push interaction into leaves. Forms need an error summary that takes focus, plus an inline error tied to each field with `aria-describedby`. Sticky UI must not cover focus (`scroll-padding-top`).

Those rules are in the build.

## What we rejected

The generator matched a photography studio and prescribed pure black, white buttons on an off-white fill, and Archivo. That palette is the generic dark portfolio the brief warned against, and the sample button (white text on `#F8FAFC`) fails contrast. It also sits too close to a dark-room entrance.

Print Rest was the material reference: paper, editions, ink, a collection you can handle. We did not take its shop layout, prices, sale badges, or religious catalog imagery.

Void was the interaction reference: obvious sound and light, objects that answer a tap or a hold, a story told as scenes, and a return visit that does not lock the door. We did not take the kitten, the nursery, the flashlight room, the polaroids, or the handwritten navigation.

## The system we actually used

- Room: warm proofing gray `#e4dccb` by day, press green-black `#121413` by night.
- Sheets stay paper `#f7f1e6` with ink `#1c1916` in both themes, so text contrast does not flip under the work.
- Cyan `#0e8ea8`, magenta `#c43b72`, and yellow `#d4a017` are plate colors, not decoration. Body text stays ink or `#5c564c` / `#c9c0b2`.
- Focus is `#7a1844` by day and `#ffc1dc` by night, 2px, offset 3px.
- Type: Space Grotesk for the shop voice (the skill’s body family), Fraunces for anything that is “printed,” IBM Plex Mono for edition marks and errors.
- Spacing follows the spacious scale: sections at about 4.25rem, content width 1120px.
- Motion is GSAP on the four passes only (`y: 14`, 0.4s, `power1.out`, `immediateRender: false`). The roller, plates, and halftone dots are CSS. Reduced motion disables them.
- No scroll hijacking, no parallax, no SplitText.
- Persistence is `localStorage`, and the desk says so. A server action cannot be the source of truth for a browser rack without pretending a server exists. The Next.js note about server actions does not fit this constraint.
- 3D, Lenis, Lottie, and Recharts were skipped. They would not make the plates, the proofs, or the rack clearer.

## Requirement mapping

| Requirement | Where it lives |
| --- | --- |
| Who Sable is | Proofing table and the five-line spec sheet |
| What Sable does | Registration bed, pocket editions, composing stick |
| Story, not a text wall | Four passes with a “Pass n of 4” meter |
| Visitor reaction | Plates follow the pointer, hold rolls the ink, bell, mute |
| Day and night | Slug control, `N`, lamp that follows the pointer at night |
| Phone and tablet | Stacked table, nudge buttons, wrapping sorts, 44px targets |
| Hidden delight | Four bells, or lock up the word SABLE |
| Return visit | Sheet number, “Back on the sill,” plates stay registered |
| Guestbook | Drying rack, validated, filtered, removable, local only |
| Click sound and mute | Press, clack, bell, lock, rustle. Mute is always in the slug |
| Pointer trail | Halftone dots on fine pointers, off for reduced motion |

## Libraries

- Next.js, React, TypeScript, Tailwind CSS: the app.
- GSAP and `@gsap/react`: the four passes, cleaned up by `useGSAP`.
- Zod: the desk and the stored rack.
- Lucide: day, night, and sound only.
