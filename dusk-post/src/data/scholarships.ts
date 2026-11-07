export type EducationLevel = "high-school" | "undergraduate" | "graduate" | "bootcamp";
export type ScholarshipCategory =
  | "STEM & Tech"
  | "Women in Leadership"
  | "Underrepresented Groups"
  | "Merit & Academic"
  | "Financial Need"
  | "Creative Arts & Design"
  | "Global & International";

export type ApplicationStage =
  | "saved"
  | "drafting"
  | "documents-ready"
  | "submitted"
  | "awarded";

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: number;
  amountFormatted: string;
  renewable: boolean;
  category: ScholarshipCategory;
  deadline: string; // ISO date YYYY-MM-DD
  daysRemaining: number;
  urgency: "urgent" | "soon" | "open";
  minGpa: number;
  educationLevels: EducationLevel[];
  majors: string[];
  citizenship: string[];
  needBased: boolean;
  description: string;
  requirements: {
    essay: boolean;
    essayPrompt?: string;
    wordCount?: number;
    transcripts: boolean;
    recommendationLetters: number;
    portfolio: boolean;
    financialProof: boolean;
  };
  selectionRatio: string;
  applyUrl: string;
  featured?: boolean;
}

export interface StudentProfile {
  name: string;
  educationLevel: EducationLevel;
  gpa: number;
  major: string;
  country: string;
  annualFamilyIncome: number;
  targetTuition: number;
  currentSavings: number;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: "Arjun Sharma",
  educationLevel: "undergraduate",
  gpa: 3.75,
  major: "Computer Science",
  country: "United States",
  annualFamilyIncome: 48000,
  targetTuition: 32000,
  currentSavings: 8000,
};

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "ada-lovelace-stem-2026",
    title: "Ada Lovelace Computing & STEM Fellowship",
    provider: "Global Future Foundation",
    amount: 15000,
    amountFormatted: "$15,000 / year",
    renewable: true,
    category: "STEM & Tech",
    deadline: "2026-11-28",
    daysRemaining: 21,
    urgency: "urgent",
    minGpa: 3.5,
    educationLevels: ["undergraduate", "graduate"],
    majors: ["Computer Science", "Software Engineering", "Data Science", "Electrical Engineering"],
    citizenship: ["All Nationalities", "International Students Welcome"],
    needBased: false,
    description:
      "Prestigious grant for aspiring technologists demonstrating creative open-source work or technical community leadership.",
    requirements: {
      essay: true,
      essayPrompt: "Describe an innovative project you engineered and how it solves a genuine human problem.",
      wordCount: 650,
      transcripts: true,
      recommendationLetters: 2,
      portfolio: true,
      financialProof: false,
    },
    selectionRatio: "1 in 18 applicants",
    applyUrl: "https://grantly.org/apply/ada-lovelace-stem",
    featured: true,
  },
  {
    id: "first-gen-trailblazer",
    title: "First-Generation College Trailblazers Award",
    provider: "Opportunity Education Fund",
    amount: 10000,
    amountFormatted: "$10,000",
    renewable: false,
    category: "Financial Need",
    deadline: "2026-12-05",
    daysRemaining: 28,
    urgency: "soon",
    minGpa: 3.0,
    educationLevels: ["high-school", "undergraduate"],
    majors: ["Any Major"],
    citizenship: ["Domestic", "Permanent Residents"],
    needBased: true,
    description:
      "Dedicated assistance for students who are the first in their family to pursue higher education, easing tuition and equipment hurdles.",
    requirements: {
      essay: true,
      essayPrompt: "How has your family background shaped your drive to pursue your university degree?",
      wordCount: 500,
      transcripts: true,
      recommendationLetters: 1,
      portfolio: false,
      financialProof: true,
    },
    selectionRatio: "1 in 9 applicants",
    applyUrl: "https://grantly.org/apply/first-gen",
    featured: true,
  },
  {
    id: "women-in-tech-pioneers",
    title: "Women in Engineering & Product Pioneers",
    provider: "Hypatia Tech Collaborative",
    amount: 12500,
    amountFormatted: "$12,500",
    renewable: true,
    category: "Women in Leadership",
    deadline: "2026-11-20",
    daysRemaining: 13,
    urgency: "urgent",
    minGpa: 3.2,
    educationLevels: ["undergraduate", "bootcamp"],
    majors: ["Computer Science", "Information Systems", "UI/UX Design", "Robotics"],
    citizenship: ["All Nationalities"],
    needBased: false,
    description:
      "Empowering women breaking barriers in computing, robotics, and digital product design with funding plus direct mentorship.",
    requirements: {
      essay: true,
      essayPrompt: "How do you intend to mentor other women entering the engineering workforce?",
      wordCount: 500,
      transcripts: true,
      recommendationLetters: 1,
      portfolio: true,
      financialProof: false,
    },
    selectionRatio: "1 in 12 applicants",
    applyUrl: "https://grantly.org/apply/women-pioneers",
    featured: true,
  },
  {
    id: "civic-impact-scholars",
    title: "National Civic Innovation & Public Service Grant",
    provider: "Public Interest Tech Alliance",
    amount: 8000,
    amountFormatted: "$8,000",
    renewable: false,
    category: "Merit & Academic",
    deadline: "2026-12-20",
    daysRemaining: 43,
    urgency: "open",
    minGpa: 3.4,
    educationLevels: ["undergraduate", "graduate"],
    majors: ["Public Policy", "Computer Science", "Economics", "Environmental Studies"],
    citizenship: ["Domestic", "International Students Welcome"],
    needBased: false,
    description:
      "Awarded to students leveraging technology or social science to revitalize local communities or civic infrastructure.",
    requirements: {
      essay: true,
      essayPrompt: "Detail a civic challenge in your neighborhood and outline your proposed intervention.",
      wordCount: 750,
      transcripts: true,
      recommendationLetters: 2,
      portfolio: false,
      financialProof: false,
    },
    selectionRatio: "1 in 15 applicants",
    applyUrl: "https://grantly.org/apply/civic-impact",
  },
  {
    id: "design-creative-visionaries",
    title: "Digital Design & Human Experience Fellowship",
    provider: "Atelier Creative Trust",
    amount: 9500,
    amountFormatted: "$9,500",
    renewable: false,
    category: "Creative Arts & Design",
    deadline: "2026-12-12",
    daysRemaining: 35,
    urgency: "soon",
    minGpa: 2.8,
    educationLevels: ["undergraduate", "graduate", "bootcamp"],
    majors: ["UI/UX Design", "Graphic Design", "Digital Media", "Architecture"],
    citizenship: ["All Nationalities"],
    needBased: false,
    description:
      "Funding exceptional visual thinkers, interaction designers, and creative coders pushing digital storytelling forward.",
    requirements: {
      essay: false,
      transcripts: false,
      recommendationLetters: 1,
      portfolio: true,
      financialProof: false,
    },
    selectionRatio: "1 in 14 applicants",
    applyUrl: "https://grantly.org/apply/design-fellowship",
  },
  {
    id: "global-pathways-international",
    title: "Global Pathways Cross-Border Study Grant",
    provider: "International Scholars Exchange",
    amount: 20000,
    amountFormatted: "$20,000 / year",
    renewable: true,
    category: "Global & International",
    deadline: "2026-11-25",
    daysRemaining: 18,
    urgency: "urgent",
    minGpa: 3.6,
    educationLevels: ["undergraduate", "graduate"],
    majors: ["Any Major"],
    citizenship: ["International Students Welcome"],
    needBased: true,
    description:
      "Substantial financial assistance for high-achieving international scholars studying away from their home country.",
    requirements: {
      essay: true,
      essayPrompt: "How will your cross-cultural education impact your community of origin?",
      wordCount: 600,
      transcripts: true,
      recommendationLetters: 2,
      portfolio: false,
      financialProof: true,
    },
    selectionRatio: "1 in 22 applicants",
    applyUrl: "https://grantly.org/apply/global-pathways",
    featured: true,
  },
  {
    id: "community-college-bridge",
    title: "Community College Transfer Acceleration Fund",
    provider: "Ascend Higher Ed Trust",
    amount: 7500,
    amountFormatted: "$7,500",
    renewable: true,
    category: "Financial Need",
    deadline: "2027-01-15",
    daysRemaining: 69,
    urgency: "open",
    minGpa: 3.0,
    educationLevels: ["undergraduate"],
    majors: ["Any Major"],
    citizenship: ["Domestic"],
    needBased: true,
    description:
      "Designed specifically for community college graduates transferring to 4-year university programs to complete their bachelor's.",
    requirements: {
      essay: true,
      essayPrompt: "Describe your transfer journey and your post-graduation career roadmap.",
      wordCount: 400,
      transcripts: true,
      recommendationLetters: 1,
      portfolio: false,
      financialProof: true,
    },
    selectionRatio: "1 in 8 applicants",
    applyUrl: "https://grantly.org/apply/cc-bridge",
  },
];
