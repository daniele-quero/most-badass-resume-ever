import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CvPdfBuilderPage } from "./CvPdfBuilderPage";

const generateCvPdf = vi.fn().mockResolvedValue(undefined);

vi.mock("../pdf/generateCvPdf", () => ({
  generateCvPdf
}));

describe("CvPdfBuilderPage", () => {
  beforeEach(() => {
    generateCvPdf.mockClear();
    window.location.hash = "";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("always includes personal information as a locked, checked item", () => {
    render(<CvPdfBuilderPage />);

    const mandatoryCheckbox = screen.getByRole("checkbox", { name: /Personal Information & Contacts/ });
    expect(mandatoryCheckbox).toBeChecked();
    expect(mandatoryCheckbox).toBeDisabled();
  });

  it("defaults Research & Publications and Game Development Projects to unselected", () => {
    render(<CvPdfBuilderPage />);

    expect(screen.getByRole("checkbox", { name: "Research & Publications" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Game Development Projects" })).not.toBeChecked();
  });

  it("defaults the core sections to selected", () => {
    render(<CvPdfBuilderPage />);

    for (const label of [
      "Professional Experience",
      "Education",
      "Skills",
      "Training & Certifications",
      "Open-Source Projects"
    ]) {
      expect(screen.getByRole("checkbox", { name: label })).toBeChecked();
    }
  });

  it("lets the user toggle an optional section", async () => {
    const user = userEvent.setup();
    render(<CvPdfBuilderPage />);

    const research = screen.getByRole("checkbox", { name: "Research & Publications" });
    expect(research).not.toBeChecked();

    await user.click(research);
    expect(research).toBeChecked();
  });

  it("generates the PDF with the selected sections and chosen theme", async () => {
    const user = userEvent.setup();
    render(<CvPdfBuilderPage />);

    await user.click(screen.getByRole("radio", { name: "Print-friendly (light)" }));
    await user.click(screen.getByRole("button", { name: "Download PDF Resume" }));

    await waitFor(() => expect(generateCvPdf).toHaveBeenCalledTimes(1));

    const [selectedIds, theme] = generateCvPdf.mock.calls[0]!;
    expect(theme).toBe("light");
    expect(selectedIds.has("experience")).toBe(true);
    expect(selectedIds.has("research")).toBe(false);
  });

  it("shows an error message when generation fails", async () => {
    generateCvPdf.mockRejectedValueOnce(new Error("boom"));
    const user = userEvent.setup();
    render(<CvPdfBuilderPage />);

    await user.click(screen.getByRole("button", { name: "Download PDF Resume" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not generate the PDF");
  });
});
