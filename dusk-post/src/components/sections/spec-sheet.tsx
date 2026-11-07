import { CHARACTER } from "@/data/press";
import { CropMarks } from "@/components/shared/crop-marks";

const FIELDS = [
  { label: "Name", value: CHARACTER.name },
  { label: "What they are", value: CHARACTER.are },
  { label: "What they do", value: CHARACTER.does },
  { label: "Their story", value: CHARACTER.story },
  { label: "Tagline", value: CHARACTER.tagline },
] as const;

export function SpecSheet() {
  return (
    <section id="sheet" className="section" aria-labelledby="sheet-title">
      <div className="sheet spec">
        <CropMarks />
        <p className="eyebrow">Printer’s spec</p>
        <h2 id="sheet-title">Five lines, no biography</h2>
        <dl>
          {FIELDS.map((field) => (
            <div key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
        <p className="hint">The bell knows the printer’s name. So does the composing stick.</p>
      </div>
    </section>
  );
}
