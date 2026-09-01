import { pdf } from "@react-pdf/renderer";
import { CvDocument } from "./CvDocument";
import { CV_SECTIONS, type CvSectionId, resolveCertificateUrl } from "./cvPdfSections";
import type { CvPdfThemeMode } from "./cvPdfTheme";

export async function generateCvPdf(selectedSectionIds: Set<CvSectionId>, theme: CvPdfThemeMode) {
  const sections = CV_SECTIONS.filter((section) => selectedSectionIds.has(section.id));
  const certificateUrl = resolveCertificateUrl();

  const blob = await pdf(
    <CvDocument sections={sections} theme={theme} certificateUrl={certificateUrl} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Daniele_Quero_Resume.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
