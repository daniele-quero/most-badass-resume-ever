import { type TabItem } from "../Tabs";
import { AcademySection } from "./sections/AcademySection";
import { CoursesSection } from "./sections/CoursesSection";
import { GamesSection } from "./sections/GamesSection";
import { RepositoriesSection } from "./sections/RepositoriesSection";
import { SkillsSection } from "./sections/SkillsSection";
import { WorkSection } from "./sections/WorkSection";

export const WELCOME_TAB_ID = "welcome";

const welcomeContent = (
  <article>
    <h3>Mission</h3>
    <p>
      I solve problems with code. Better if game- or AI-related or at least challenging.
      <br />Father.
      <br />Gamer.
      <br />Fallout Enthusiast.
    </p>
  </article>
);

export const resumeTabs: TabItem[] = [
  {
    id: WELCOME_TAB_ID,
    label: "Welcome",
    content: welcomeContent
  },
  {
    id: "education",
    label: "Education",
    content: (
      <article>
        <AcademySection />
      </article>
    )
  },
  {
    id: "courses",
    label: "Courses",
    content: (
      <article>
        <h2>Training Log</h2>
        <CoursesSection />
      </article>
    )
  },
  {
    id: "experience",
    label: "Experience",
    content: (
      <article>
        <h2>Quest Log</h2>
        <WorkSection />
      </article>
    )
  },
  {
    id: "skills",
    label: "Skills",
    content: (
      <article>
        <h2>Perks</h2>
        <SkillsSection />
      </article>
    )
  },
  {
    id: "games",
    label: "Games",
    content: (
      <article>
        <h2>Vault Inventory</h2>
        <GamesSection />
      </article>
    )
  },
  {
    id: "repositories",
    label: "Repositories",
    content: (
      <article>
        <h2>Tech Stash</h2>
        <RepositoriesSection />
      </article>
    )
  }
];
