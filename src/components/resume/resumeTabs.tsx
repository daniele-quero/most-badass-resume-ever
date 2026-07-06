import { type TabItem } from "../Tabs";
import { AcademySection } from "./sections/AcademySection";
import { CoursesSection } from "./sections/CoursesSection";
import { GamesSection } from "./sections/GamesSection";
import { RepositoriesSection } from "./sections/RepositoriesSection";
import { SkillsSection } from "./sections/SkillsSection";
import { WorkSection } from "./sections/WorkSection";

export const WELCOME_TAB_ID = "welcome";

const welcomeContent = (
  <article style={{ position: "relative", overflow: "hidden" }}>
    <img
      src="/image.png"
      alt=""
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "90%",
        opacity: 0.18,
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        mixBlendMode: "luminosity",
      }}
    />
    <div style={{ position: "relative", zIndex: 1 }}>
      <h3>Mission</h3>
      <p>
        I solve problems with code. Better if game- or AI-related or at least challenging.
        <br />Father.
        <br />Gamer.
        <br />Fallout Enthusiast.
      </p>
    </div>
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
      <article style={{ position: "relative" }}>
        <div style={{
          position: "sticky",
          top: 0,
          height: 0,
          overflow: "visible",
          display: "flex",
          justifyContent: "flex-end",
          zIndex: 0,
          pointerEvents: "none",
        }}>
          <img
            src="/image2.png"
            alt=""
            aria-hidden="true"
            style={{
              height: "200px",
              opacity: 0.18,
              pointerEvents: "none",
              userSelect: "none",
              mixBlendMode: "luminosity",
            }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <AcademySection />
        </div>
      </article>
    )
  },
  {
    id: "courses",
    label: "Courses",
    content: (
      <article style={{ position: "relative" }}>
        <div style={{
          position: "sticky",
          top: 0,
          height: 0,
          overflow: "visible",
          display: "flex",
          justifyContent: "flex-end",
          zIndex: 0,
          pointerEvents: "none",
        }}>
          <img
            src="/image3.png"
            alt=""
            aria-hidden="true"
            style={{
              height: "200px",
              opacity: 0.18,
              pointerEvents: "none",
              userSelect: "none",
              mixBlendMode: "luminosity",
            }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2>Training Log</h2>
          <CoursesSection />
        </div>
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
