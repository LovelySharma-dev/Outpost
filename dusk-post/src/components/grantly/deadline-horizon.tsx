"use client";

import { SCHOLARSHIPS, type Scholarship } from "@/data/scholarships";
import { daysUntil, formatDate } from "@/lib/dates";
import { downloadIcsFile, generateGoogleCalendarUrl } from "@/lib/calendar-export";

const TIERS = [
  { id: "week", label: "7-day", test: (days: number) => days >= 0 && days <= 7 },
  { id: "fortnight", label: "14-day", test: (days: number) => days > 7 && days <= 14 },
  { id: "month", label: "30-day", test: (days: number) => days > 14 && days <= 30 },
  { id: "later", label: "After 30 days", test: (days: number) => days > 30 },
];

function DeadlineCard({ scholarship }: { scholarship: Scholarship }) {
  const days = daysUntil(scholarship.deadline);
  return (
    <article className="g-card">
      <h3>{scholarship.title}</h3>
      <p className="g-meta">
        {formatDate(scholarship.deadline, true)} · {days} days · {scholarship.amountFormatted}
      </p>
      <div className="g-row">
        <a href={generateGoogleCalendarUrl(scholarship)} target="_blank" rel="noopener noreferrer">
          Google Calendar
        </a>
        <button type="button" onClick={() => downloadIcsFile(scholarship)}>
          Download .ics
        </button>
      </div>
    </article>
  );
}

export function DeadlineHorizon() {
  return (
    <section className="g-section" id="deadlines" aria-labelledby="deadline-title">
      <p className="g-kicker">Deadline horizon</p>
      <h2 id="deadline-title">Seven, fourteen, and thirty days</h2>
      <p className="g-note">Dates are counted from November 7, 2026. Calendar links carry the real deadline.</p>
      <div className="g-horizon">
        {TIERS.map((tier) => {
          const items = SCHOLARSHIPS.filter((scholarship) => tier.test(daysUntil(scholarship.deadline)));
          return (
            <div key={tier.id}>
              <h3>
                {tier.label} <span className="g-meta">({items.length})</span>
              </h3>
              {items.length === 0 ? (
                <p className="g-note">No catalog deadline sits in this window.</p>
              ) : (
                <div className="g-lane">
                  <ul>
                    {items.map((scholarship) => (
                      <li key={scholarship.id}>
                        <DeadlineCard scholarship={scholarship} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
