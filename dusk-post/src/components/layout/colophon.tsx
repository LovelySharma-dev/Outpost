"use client";

import { usePress } from "@/components/press-provider";

export function Colophon() {
  const { egg, openEgg } = usePress();

  return (
    <footer className="colophon">
      <div>
        <p className="eyebrow">Colophon</p>
        <p>
          Sable, the plates, the posters, and the sounds were made for this press. Day and night, the mute switch, and
          the objects are part of the work.
        </p>
        {egg ? (
          <button type="button" className="button button-quiet" onClick={openEgg}>
            Open the first misprint
          </button>
        ) : null}
      </div>
      <ul>
        <li>Space Grotesk, Fraunces, and IBM Plex Mono, served by Next.js.</li>
        <li>GSAP and ScrollTrigger for the four passes.</li>
        <li>Lucide for the day, night, and sound controls.</li>
        <li>Paper, editions, and ink are the reference. No catalog imagery is used.</li>
        <li>Lines on the rack stay in this browser. There is no server behind the desk.</li>
      </ul>
    </footer>
  );
}
