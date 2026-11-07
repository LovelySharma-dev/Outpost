"use client";

import { useId } from "react";

type SableProps = {
  roll?: number;
  ink?: string;
  platesOnly?: boolean;
};

export function Sable({ roll = 0, ink = "#1c1916", platesOnly = false }: SableProps) {
  const clipId = useId();
  const stripe = ((roll % 36) + 36) % 36;

  return (
    <svg viewBox="0 0 220 250" className="sable" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="24" y="108" width="172" height="96" rx="48" />
        </clipPath>
      </defs>
      {platesOnly ? null : (
        <>
          <g className="sable-handle">
            <rect x="99" y="6" width="22" height="78" rx="11" fill="#c4893a" />
            <rect x="104" y="12" width="6" height="64" rx="3" fill="#e7c27a" />
          </g>
          <path d="M36 86h148v16H36z" fill="#8a8378" />
          <path d="M36 86h16v28H36z" fill="#6f6a62" />
          <path d="M168 86h16v28h-16z" fill="#6f6a62" />
          <circle cx="186" cy="78" r="10" fill="#d4a017" />
          <circle cx="186" cy="82" r="2.2" fill="#1c1916" />
        </>
      )}
      <g clipPath={`url(#${clipId})`}>
        <rect x="24" y="108" width="172" height="96" fill={ink} />
        <rect x="24" y={96 + stripe} width="172" height="10" fill="#3c362f" opacity="0.55" />
        <rect x="24" y={120 + stripe} width="172" height="10" fill="#3c362f" opacity="0.45" />
        <ellipse cx="110" cy="128" rx="62" ry="10" fill="#f4efe4" opacity="0.16" />
      </g>
      <rect x="24" y="108" width="172" height="96" rx="48" fill="none" stroke="#1c1916" strokeWidth="3" />
      {platesOnly ? null : (
        <>
          <g className="sable-eyes">
            <ellipse className="sable-lid" cx="86" cy="156" rx="11" ry="13" fill="#f7f1e6" />
            <ellipse className="sable-lid" cx="134" cy="156" rx="11" ry="13" fill="#f7f1e6" />
            <g className="sable-pupils">
              <circle cx="88" cy="158" r="4" fill="#1c1916" />
              <circle cx="136" cy="158" r="4" fill="#1c1916" />
            </g>
          </g>
          <path d="M102 176c6 6 14 6 20 0" fill="none" stroke="#f7f1e6" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
