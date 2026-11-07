"use client";

import { useMemo, useState } from "react";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { useGrantly } from "@/lib/grantly-store";
import { rankScholarshipsForProfile } from "@/lib/matching";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function GapSimulator() {
  const { profile, updateProfile, applications, financialMetrics, getScholarshipById } = useGrantly();
  const [workStudy, setWorkStudy] = useState(3500);
  const [error, setError] = useState("");

  const tuition = Math.max(0, profile.targetTuition);
  const savings = Math.max(0, profile.currentSavings);
  const grants = financialMetrics.awardedAmount;
  const covered = savings + grants + Math.max(0, workStudy);
  const deficit = Math.max(0, tuition - covered);
  const scale = Math.max(tuition, covered, 1);

  const recommendations = useMemo(() => {
    return rankScholarshipsForProfile(SCHOLARSHIPS, profile)
      .filter((match) => applications[match.scholarship.id]?.stage !== "awarded")
      .sort((a, b) => {
        const aCloses = a.scholarship.amount >= deficit ? 1 : 0;
        const bCloses = b.scholarship.amount >= deficit ? 1 : 0;
        return bCloses - aCloses || b.scholarship.amount - a.scholarship.amount;
      })
      .slice(0, 3);
  }, [applications, deficit, profile]);

  function setMoney(key: "targetTuition" | "currentSavings", raw: string) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setError("Enter a dollar amount of zero or more.");
      return;
    }
    setError("");
    updateProfile({ [key]: value });
  }

  const awardedNames = Object.values(applications)
    .filter((item) => item.stage === "awarded")
    .map((item) => getScholarshipById(item.scholarshipId)?.title)
    .filter((name): name is string => Boolean(name));

  return (
    <section className="g-section" id="gap" aria-labelledby="gap-title">
      <p className="g-kicker">Gap simulator</p>
      <h2 id="gap-title">Tuition against savings, grants, and work-study</h2>
      <p className="g-note">Tuition and savings stay in this browser. Work-study is for this visit. Nothing is filed with a server.</p>
      <div className="g-split">
        <form className="g-panel" onSubmit={(event) => event.preventDefault()}>
          <label className="g-field">
            Annual tuition
            <input type="number" min={0} inputMode="numeric" value={profile.targetTuition} onChange={(event) => setMoney("targetTuition", event.target.value)} />
          </label>
          <label className="g-field">
            Savings
            <input type="number" min={0} inputMode="numeric" value={profile.currentSavings} onChange={(event) => setMoney("currentSavings", event.target.value)} />
          </label>
          <label className="g-field">
            Work-study
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={workStudy}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value) || value < 0) {
                  setError("Enter a work-study amount of zero or more.");
                  return;
                }
                setError("");
                setWorkStudy(value);
              }}
            />
          </label>
          <p className="g-meta">Grants already marked Awarded: {money(grants)}{awardedNames.length ? ` (${awardedNames.join(", ")})` : ""}.</p>
          {error ? (
            <p className="g-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
        <div className="g-panel">
          <div className="g-bars" aria-hidden="true">
            <div className="g-bar">
              <span style={{ width: `${Math.min(100, (tuition / scale) * 100)}%` }} />
            </div>
            <div className="g-bar">
              <span style={{ width: `${Math.min(100, (covered / scale) * 100)}%` }} />
            </div>
          </div>
          <p>
            Tuition {money(tuition)}. Covered {money(covered)}. Deficit {money(deficit)}.
          </p>
          {deficit === 0 ? (
            <p>This mix covers the tuition on the page.</p>
          ) : (
            <>
              <h3>Awards that can close {money(deficit)}</h3>
              <ul>
                {recommendations.map((match) => (
                  <li key={match.scholarship.id}>
                    {match.scholarship.title} — {match.scholarship.amountFormatted}
                    {match.scholarship.amount >= deficit ? " covers the remaining gap" : " narrows the gap"}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
