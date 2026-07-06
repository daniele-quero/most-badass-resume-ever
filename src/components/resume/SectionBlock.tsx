import { type ReactNode } from "react";

type SectionBlockProps = {
  title: string;
  children: ReactNode;
};

export function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
