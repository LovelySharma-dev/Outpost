"use client";

import { useEffect, useRef } from "react";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";

export function EggDialog() {
  const { eggOpen, closeEgg } = usePress();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!eggOpen) return;
    const node = ref.current;
    if (!node) return;
    node.showModal();
    const handleClose = () => closeEgg();
    node.addEventListener("close", handleClose);
    return () => {
      node.removeEventListener("close", handleClose);
      if (node.open) node.close();
    };
  }, [eggOpen, closeEgg]);

  if (!eggOpen) return null;

  return (
    <dialog ref={ref} className="misprint" aria-labelledby="misprint-title">
      <div className="sheet">
        <CropMarks />
        <p className="eyebrow">Hidden drawer</p>
        <h2 id="misprint-title">The first misprint</h2>
        <svg className="misprint-mark" viewBox="0 0 180 110" aria-hidden="true">
          <circle cx="78" cy="54" r="30" fill="#0e8ea8" opacity="0.88" />
          <circle cx="104" cy="46" r="30" fill="#c43b72" opacity="0.72" />
          <circle cx="92" cy="70" r="30" fill="#d4a017" opacity="0.78" />
          <circle cx="94" cy="56" r="18" fill="#1c1916" />
          <circle cx="88" cy="52" r="2.4" fill="#f7f1e6" />
          <circle cx="101" cy="52" r="2.4" fill="#f7f1e6" />
          <path d="M86 64 q8 6 16 0" fill="none" stroke="#f7f1e6" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p>
          Sable kept the sheet that made them. It is off by a hair, and the hair is the point. The four colors almost
          agreed. Almost was enough to become a person.
        </p>
        <button type="button" className="button" onClick={() => ref.current?.close()}>
          Close the drawer
        </button>
      </div>
    </dialog>
  );
}
