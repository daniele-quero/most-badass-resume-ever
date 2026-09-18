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
      paddingTop: 26,
      paddingBottom: 50,
      paddingHorizontal: 28,
      fontFamily: "Courier",
      fontSize: 14,
      color: palette.body,
      backgroundColor: palette.bg
    },
    frame: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
      borderWidth: 1,
      borderColor: palette.frame
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottomWidth: 1,
      borderBottomColor: palette.frame,
      paddingBottom: 6,
      marginBottom: 8
    },
    name: { fontSize: 24, fontFamily: "Courier-Bold", color: palette.name, letterSpacing: 1 },
    role: { fontSize: 14, color: palette.role, marginTop: 2 },
    contactCol: { alignItems: "flex-end" },
    contactItem: { fontSize: 8, color: palette.contact, marginBottom: 1 },
    link: { fontSize: 8, color: palette.link, textDecoration: "none", marginBottom: 1 },
    section: { marginBottom: 8 },
    sectionTitle: {
      fontSize: 14.5,
      fontFamily: "Courier-Bold",
      color: palette.sectionTitle,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 4
    },
    entry: { marginBottom: 5 },
    entryTitle: { fontSize: 13.5, fontFamily: "Courier-Bold", color: palette.entryTitle },
    bullet: { flexDirection: "row", marginTop: 1 },
    bulletDot: { width: 12, fontSize: 12.5, color: palette.dot },
    bulletText: { fontSize: 11, flex: 1, lineHeight: 1.2, color: palette.body },
    skillsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
    skillsGridItem: { width: "33.33%", flexDirection: "row", marginBottom: 3, paddingRight: 6 },
    aiHoursPerk: {
      marginTop: 5,
      borderWidth: 1,
      borderColor: palette.frame,
      padding: 7
    },
    aiHoursTitle: {
      fontSize: 13.5,
      fontFamily: "Courier-Bold",
      color: palette.role,
      marginBottom: 3
    },
    aiHoursText: { fontSize: 12.5, lineHeight: 1.25, color: palette.body },
    aiHoursValue: { fontFamily: "Courier-Bold", color: palette.role },
    aiHoursDetail: { fontSize: 11.5, lineHeight: 1.25, color: palette.contact, marginTop: 3 },
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
