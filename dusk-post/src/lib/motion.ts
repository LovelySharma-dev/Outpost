import { useSyncExternalStore } from "react";

type Tween = { pause: () => void; resume: () => void };

/** Fine pointers get tilt and drag. Coarse pointers keep buttons and menus. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia("(pointer: fine)");
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}

/** Infinite tweens should stop while the tab is hidden so the ticker can sleep. */
export function pauseTweensWhenHidden(tweens: Tween[]) {
  const onChange = () => {
    for (const tween of tweens) {
      if (document.hidden) tween.pause();
      else tween.resume();
    }
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
