"use client";

import { useEffect } from "react";

export function HalftoneTrail() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const colors = ["#0e8ea8", "#c43b72", "#d4a017", "#1c1916"];
    let index = 0;
    let last = 0;
    const dots: HTMLSpanElement[] = [];

    function onMove(event: PointerEvent) {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      const dot = document.createElement("span");
      dot.className = "halftone-dot";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.style.background = colors[index % colors.length] ?? "#1c1916";
      index += 1;
      document.body.appendChild(dot);
      dots.push(dot);
      window.setTimeout(() => {
        dot.remove();
      }, 650);
      if (dots.length > 18) dots.shift()?.remove();
    }

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      dots.forEach((dot) => dot.remove());
    };
  }, []);

  return <div className="lamp" aria-hidden="true" />;
}
