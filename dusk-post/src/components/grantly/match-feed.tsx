"use client";

import { useMemo, useState } from "react";
import { PERSONAS, SCHOLARSHIPS, type Scholarship } from "@/data/scholarships";
import { daysUntil } from "@/lib/dates";
import { useGrantly } from "@/lib/grantly-store";
import { rankScholarshipsForProfile } from "@/lib/matching";

type Difficulty = "any" | "light" | "standard" | "heavy";
type Urgency = "any" | "7" | "14" | "30";

function difficultyOf(scholarship: Scholarship): Exclude<Difficulty, "any"> {
  const words = scholarship.requirements.wordCount ?? 0;
  if (!scholarship.requirements.essay && scholarship.requirements.recommendationLetters <= 1) return "light";
  if (words >= 650 || (scholarship.requirements.recommendationLetters >= 2 && scholarship.requirements.portfolio)) {
    return "heavy";
  }
  return "standard";
}

export function MatchFeed() {
  const { profile, updateProfile, applications, trackScholarship } = useGrantly();
  const [query, setQuery] = useState("");
  const [renewable, setRenewable] = useState(false);
  const [noEssay, setNoEssay] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("any");
  const [urgency, setUrgency] = useState<Urgency>("any");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rankScholarshipsForProfile(SCHOLARSHIPS, profile).filter(({ scholarship }) => {
      const days = daysUntil(scholarship.deadline);
      if (renewable && !scholarship.renewable) return false;
      if (noEssay && scholarship.requirements.essay) return false;
      if (difficulty !== "any" && difficultyOf(scholarship) !== difficulty) return false;
      if (urgency === "7" && days > 7) return false;
      if (urgency === "14" && days > 14) return false;
      if (urgency === "30" && days > 30) return false;
      if (!needle) return true;
      return `${scholarship.title} ${scholarship.provider} ${scholarship.category}`.toLowerCase().includes(needle);
    });
  }, [difficulty, noEssay, profile, query, renewable, urgency]);

  function clearFilters() {
    setQuery("");
    setRenewable(false);
    setNoEssay(false);
    setDifficulty("any");
    setUrgency("any");
  }

  return (
    <section className="g-section" id="match" aria-labelledby="match-title">
      <p className="g-kicker">Smart match</p>
      <h2 id="match-title">Awards ranked for this profile</h2>
      <p className="g-note">Ranked on this device from the catalog. Nothing is sent to a server.</p>
      <div className="g-personas" role="group" aria-label="Student persona">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            type="button"
            className="g-persona"
            aria-pressed={profile.personaId === persona.id}
            onClick={() => updateProfile(persona.profile)}
          >
            {persona.label}
          </button>
        ))}
      </div>
      <form className="g-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Name or funder" />
        </label>
        <label>
          <input type="checkbox" checked={renewable} onChange={(event) => setRenewable(event.target.checked)} /> Renewable
        </label>
        <label>
          <input type="checkbox" checked={noEssay} onChange={(event) => setNoEssay(event.target.checked)} /> No essay
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
            <option value="any">Any load</option>
            <option value="light">Light</option>
            <option value="standard">Standard</option>
            <option value="heavy">Heavy</option>
          </select>
        </label>
        <label>
          Days left
          <select value={urgency} onChange={(event) => setUrgency(event.target.value as Urgency)}>
            <option value="any">Any deadline</option>
            <option value="7">Within 7 days</option>
            <option value="14">Within 14 days</option>
            <option value="30">Within 30 days</option>
          </select>
        </label>
      </form>
      {matches.length === 0 ? (
        <div className="g-panel">
          <h3>No award matches these filters.</h3>
          <button type="button" className="g-text-button" onClick={clearFilters}>
            Show the full ranking
          </button>
        </div>
      ) : (
        <div className="g-feed">
          {matches.map((match) => {
            const saved = Boolean(applications[match.scholarship.id]);
            return (
              <article key={match.scholarship.id} className="g-card">
                <p className="g-score">{match.score}% match</p>
                <h3>{match.scholarship.title}</h3>
                <p className="g-meta">
                  {match.scholarship.provider} · {match.scholarship.amountFormatted} · {daysUntil(match.scholarship.deadline)} days ·{" "}
                  {difficultyOf(match.scholarship)}
                </p>
                <ul className="g-chips">
                  {match.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                  {match.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => trackScholarship(match.scholarship.id)} disabled={saved}>
                  {saved ? "On the board" : "Save to the board"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
