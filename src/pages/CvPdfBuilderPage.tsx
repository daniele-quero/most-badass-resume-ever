import { useMemo, useState } from "react";
import { CV_SECTIONS, type CvSectionId } from "../pdf/cvPdfSections";
import type { CvPdfThemeMode } from "../pdf/cvPdfTheme";
import { navigateToResume } from "../routes";

type GenerationState = "idle" | "generating" | "error";

function getDefaultSelection(): Set<CvSectionId> {
  return new Set(CV_SECTIONS.filter((section) => section.defaultSelected).map((section) => section.id));
}

export function CvPdfBuilderPage() {
  const [selectedIds, setSelectedIds] = useState<Set<CvSectionId>>(getDefaultSelection);
  const [theme, setTheme] = useState<CvPdfThemeMode>("dark");
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const toggleSection = (id: CvSectionId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    setGenerationState("generating");
    try {
      const { generateCvPdf } = await import("../pdf/generateCvPdf");
      await generateCvPdf(selectedIds, theme);
      setGenerationState("idle");
    } catch {
      setGenerationState("error");
    }
  };

  return (
    <div className="pdf-builder-page terminal-panel">
      <button type="button" className="pdf-back-link" onClick={navigateToResume}>
        ← Back to Resume
      </button>

      <h2 className="section-title">Build Your PDF Resume</h2>
      <p className="pdf-builder-intro">
        Choose which sections to include in your downloadable resume. Personal information and
        contact details are always included.
      </p>

      <fieldset className="pdf-checklist">
        <legend className="visually-hidden">Resume sections</legend>

        <label className="pdf-checklist-item is-mandatory">
          <input type="checkbox" checked disabled aria-readonly="true" />
          <span className="pdf-checklist-label">
            Personal Information &amp; Contacts
            <span className="pdf-checklist-hint">Always included</span>
          </span>
        </label>

        {CV_SECTIONS.map((section) => (
          <label className="pdf-checklist-item" key={section.id}>
            <input
              type="checkbox"
              checked={selectedIds.has(section.id)}
              onChange={() => toggleSection(section.id)}
            />
            <span className="pdf-checklist-label">{section.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="pdf-theme-options">
        <legend className="pdf-theme-legend">PDF appearance</legend>

        <label className="pdf-theme-option">
          <input
            type="radio"
            name="pdf-theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
          Terminal (dark)
        </label>

        <label className="pdf-theme-option">
          <input
            type="radio"
            name="pdf-theme"
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          Print-friendly (light)
        </label>
      </fieldset>

      <div className="pdf-actions">
        <button
          type="button"
          className="chat-submit pdf-generate-button"
          onClick={handleGenerate}
          disabled={generationState === "generating"}
        >
          {generationState === "generating" ? "Generating…" : "Download PDF Resume"}
        </button>
        <p className="pdf-selection-hint">{selectedCount} of {CV_SECTIONS.length} optional sections selected</p>
        {generationState === "error" && (
          <p className="chat-error" role="alert">
            Could not generate the PDF. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
