import type { Scholarship, StudentProfile } from "@/data/scholarships";

export interface MatchResult {
  scholarship: Scholarship;
  score: number; // 0 - 100
  qualified: boolean;
  reasons: string[];
  blockers: string[];
}

function isDomestic(country: string) {
  return /united states|\busa\b|u\.s\./i.test(country);
}

export function evaluateScholarshipMatch(
  scholarship: Scholarship,
  profile: StudentProfile
): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 8;

  if (profile.gpa >= scholarship.minGpa) {
    const diff = profile.gpa - scholarship.minGpa;
    score += diff >= 0.4 ? 28 : diff >= 0.15 ? 22 : 16;
    reasons.push(`GPA ${profile.gpa} clears the ${scholarship.minGpa} cutoff`);
  } else {
    blockers.push(`Requires GPA ${scholarship.minGpa} (profile is ${profile.gpa})`);
    score -= 18;
  }

  if (scholarship.educationLevels.includes(profile.educationLevel)) {
    score += 22;
    reasons.push(`Open to ${profile.educationLevel.replace("-", " ")} students`);
  } else {
    blockers.push(`Restricted to ${scholarship.educationLevels.join(", ")}`);
    score -= 22;
  }

  const major = profile.major.toLowerCase();
  const majorFit =
    scholarship.majors.includes("Any Major") ||
    scholarship.majors.some((item) => item.toLowerCase().includes(major) || major.includes(item.toLowerCase()));
  if (majorFit) {
    score += 24;
    reasons.push(`Major lines up with ${profile.major}`);
  } else {
    score += 8;
    reasons.push("Major is adjacent, not named on the award");
  }

  if (scholarship.needBased) {
    if (profile.annualFamilyIncome <= 65000) {
      score += 14;
      reasons.push("Need is part of the decision, and income is in range");
    } else {
      score += 6;
      reasons.push("Need-based award asks for income verification");
    }
  } else {
    score += 8;
    reasons.push("Merit award with no income cap");
  }

  const labels = scholarship.citizenship.join(" ").toLowerCase();
  const openAll = labels.includes("all nationalities");
  const international = labels.includes("international");
  const domesticOnly = !openAll && !international && (labels.includes("domestic") || labels.includes("permanent"));
  if (domesticOnly && !isDomestic(profile.country)) {
    blockers.push("Limited to domestic students and permanent residents");
    score -= 28;
  } else if (international && !isDomestic(profile.country)) {
    score += 14;
    reasons.push("Written for students studying across a border");
  } else {
    score += 6;
    reasons.push("Citizenship window includes this profile");
  }

  if (profile.firstGeneration && scholarship.needBased) {
    score += 10;
    reasons.push("Need-based award fits a first-generation path");
  }

  return {
    scholarship,
    score: Math.max(12, Math.min(99, Math.round(score))),
    qualified: blockers.length === 0,
    reasons,
    blockers,
  };
}

export function rankScholarshipsForProfile(
  scholarships: Scholarship[],
  profile: StudentProfile
): MatchResult[] {
  return scholarships
    .map((item) => evaluateScholarshipMatch(item, profile))
    .sort((a, b) => Number(b.qualified) - Number(a.qualified) || b.score - a.score);
}
