import type { Scholarship, StudentProfile } from "@/data/scholarships";

export interface MatchResult {
  scholarship: Scholarship;
  score: number; // 0 - 100
  qualified: boolean;
  reasons: string[];
  blockers: string[];
}

export function evaluateScholarshipMatch(
  scholarship: Scholarship,
  profile: StudentProfile
): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 50; // base score for discovery

  // 1. GPA Evaluation (Weight: 25)
  if (profile.gpa >= scholarship.minGpa) {
    const diff = profile.gpa - scholarship.minGpa;
    if (diff >= 0.3) {
      score += 25;
      reasons.push(`GPA exceeds cutoff (${profile.gpa} vs ${scholarship.minGpa} req)`);
    } else {
      score += 18;
      reasons.push(`Meets GPA requirement (${scholarship.minGpa})`);
    }
  } else {
    blockers.push(`Requires minimum GPA of ${scholarship.minGpa} (yours is ${profile.gpa})`);
    score -= 20;
  }

  // 2. Education Level Evaluation (Weight: 20)
  if (scholarship.educationLevels.includes(profile.educationLevel)) {
    score += 20;
    reasons.push(`Open to ${profile.educationLevel.replace("-", " ")} students`);
  } else {
    blockers.push(`Restricted to ${scholarship.educationLevels.join(", ")}`);
    score -= 25;
  }

  // 3. Major / Field of Study (Weight: 20)
  if (
    scholarship.majors.includes("Any Major") ||
    scholarship.majors.some(
      (m) =>
        m.toLowerCase().includes(profile.major.toLowerCase()) ||
        profile.major.toLowerCase().includes(m.toLowerCase())
    )
  ) {
    score += 20;
    reasons.push(`Direct alignment with your major in ${profile.major}`);
  } else {
    score += 5; // not a hard disqualifier unless stated
    reasons.push(`Related technical fields considered`);
  }

  // 4. Financial Need Check (Weight: 15)
  if (scholarship.needBased) {
    if (profile.annualFamilyIncome <= 65000) {
      score += 15;
      reasons.push("Strong candidate under low-to-middle income guidelines");
    } else {
      score += 5;
      reasons.push("Income verification required");
    }
  } else {
    score += 10;
    reasons.push("Pure merit/achievement criteria — no income caps");
  }

  // Bound score between 15% and 99%
  const finalScore = Math.max(15, Math.min(99, Math.round(score)));
  const qualified = blockers.length === 0;

  return {
    scholarship,
    score: finalScore,
    qualified,
    reasons,
    blockers,
  };
}

export function rankScholarshipsForProfile(
  scholarships: Scholarship[],
  profile: StudentProfile
): MatchResult[] {
  return scholarships
    .map((s) => evaluateScholarshipMatch(s, profile))
    .sort((a, b) => b.score - a.score);
}
