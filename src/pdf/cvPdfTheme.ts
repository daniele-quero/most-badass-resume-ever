import { StyleSheet } from "@react-pdf/renderer";

export type CvPdfThemeMode = "dark" | "light";

type Palette = {
  bg: string;
  frame: string;
  name: string;
  role: string;
  contact: string;
  link: string;
  sectionTitle: string;
  entryTitle: string;
  dot: string;
  body: string;
  footer: string;
};

const PALETTES: Record<CvPdfThemeMode, Palette> = {
  dark: {
    bg: "#0a1310",
    frame: "#3f8f63",
    name: "#eaffef",
    role: "#e8b158",
    contact: "#a9d9b8",
    link: "#e8b158",
    sectionTitle: "#e8b158",
    entryTitle: "#eaffef",
    dot: "#3f8f63",
    body: "#c3e8cd",
    footer: "#5f9c78"
  },
  light: {
    bg: "#f6f4ec",
    frame: "#2f6b46",
    name: "#122318",
    role: "#8a4f0d",
    contact: "#3c5347",
    link: "#8a4f0d",
    sectionTitle: "#8a4f0d",
    entryTitle: "#122318",
    dot: "#2f6b46",
    body: "#2c3b31",
    footer: "#6b7d72"
  }
};

export function createCvPdfStyles(mode: CvPdfThemeMode) {
  const palette = PALETTES[mode];

  return StyleSheet.create({
    page: {
      paddingTop: 34,
      paddingBottom: 34,
      paddingHorizontal: 34,
      fontFamily: "Courier",
      fontSize: 14,
      color: palette.body,
      backgroundColor: palette.bg
    },
    frame: {
      position: "absolute",
      top: 14,
      left: 14,
      right: 14,
      bottom: 14,
      borderWidth: 1,
      borderColor: palette.frame
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottomWidth: 1,
      borderBottomColor: palette.frame,
      paddingBottom: 10,
      marginBottom: 14
    },
    name: { fontSize: 26, fontFamily: "Courier-Bold", color: palette.name, letterSpacing: 1 },
    role: { fontSize: 16, color: palette.role, marginTop: 3 },
    contactCol: { alignItems: "flex-end" },
    contactItem: { fontSize: 13, color: palette.contact, marginBottom: 2 },
    link: { fontSize: 13, color: palette.link, textDecoration: "none", marginBottom: 2 },
    section: { marginBottom: 12 },
    sectionTitle: {
      fontSize: 15.5,
      fontFamily: "Courier-Bold",
      color: palette.sectionTitle,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 6
    },
    entry: { marginBottom: 7 },
    entryTitle: { fontSize: 14.5, fontFamily: "Courier-Bold", color: palette.entryTitle },
    bullet: { flexDirection: "row", marginTop: 1.5 },
    bulletDot: { width: 14, fontSize: 14, color: palette.dot },
    bulletText: { fontSize: 14, flex: 1, lineHeight: 1.3, color: palette.body },
    skillsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
    skillsGridItem: { width: "33.33%", flexDirection: "row", marginBottom: 3, paddingRight: 6 },
    trainingGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
    trainingGridItem: { width: "50%", marginBottom: 8, paddingRight: 10 },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 34,
      right: 34,
      fontSize: 12,
      color: palette.footer,
      textAlign: "center"
    }
  });
}
