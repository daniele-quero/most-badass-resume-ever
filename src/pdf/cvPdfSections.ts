import workRaw from "../../data/work.data.md?raw";
import academyRaw from "../../data/academy.data.md?raw";
import skillsRaw from "../../data/skills.data.md?raw";
import coursesRaw from "../../data/courses.data.md?raw";
import researchRaw from "../../data/research.data.md?raw";
import repofolioRaw from "../../data/repofolio.data.md?raw";
import gamefolioRaw from "../../data/gamefolio.data.md?raw";

export type CvSectionId =
  | "experience"
  | "education"
  | "skills"
  | "training"
  | "research"
  | "repositories"
  | "games";

export type CvSectionConfig = {
  id: CvSectionId;
  label: string;
  defaultSelected: boolean;
  raw: string;
};

// Order here is the order sections are printed in the generated PDF.
export const CV_SECTIONS: CvSectionConfig[] = [
  { id: "experience", label: "Professional Experience", defaultSelected: true, raw: workRaw },
  { id: "education", label: "Education", defaultSelected: true, raw: academyRaw },
  { id: "skills", label: "Skills", defaultSelected: true, raw: skillsRaw },
  { id: "training", label: "Training & Certifications", defaultSelected: true, raw: coursesRaw },
  { id: "repositories", label: "Open-Source Projects", defaultSelected: true, raw: repofolioRaw },
  { id: "research", label: "Research & Publications", defaultSelected: false, raw: researchRaw },
  { id: "games", label: "Game Development Projects", defaultSelected: false, raw: gamefolioRaw }
];

const C1_CERTIFICATE_PATH = "/Daniele_QUERO_Certificate_of_Language_Proficiency_full_version.pdf";

export const CV_CONTACT = {
  name: "Daniele Quero",
  role: "Senior Java/AI Engineer",
  location: "Naples, Italy",
  englishLabel: "English proficiency: C1 certificate",
  focus: "Focus: AI-augmented inventions and creations",
  email: "Email available on request via LinkedIn",
  links: [
    { label: "GitHub", url: "https://github.com/daniele-quero" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/daniele-quero-b1a708102/" },
    { label: "Game portfolio (itch.io)", url: "https://itch.io/dashboard" }
  ]
};

export function resolveCertificateUrl(): string {
  if (typeof window === "undefined") {
    return C1_CERTIFICATE_PATH;
  }

  return new URL(C1_CERTIFICATE_PATH, window.location.origin).toString();
}
