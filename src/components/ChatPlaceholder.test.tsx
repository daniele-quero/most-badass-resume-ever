import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPlaceholder } from "./ChatPlaceholder";

describe("ChatPlaceholder", () => {
  it("renders initial assistant placeholder message", () => {
    render(<ChatPlaceholder />);

    expect(
      screen.getByText("Interfaccia chat pronta. In attesa di provider AI esterno.")
    ).toBeInTheDocument();
  });

  it("sends a message and prints fallback answer", async () => {
    render(<ChatPlaceholder />);

    const messageInput = screen.getByLabelText("Messaggio");
    const sendButton = screen.getByRole("button", { name: "Invia" });

    await userEvent.type(messageInput, "Quale stack consigli?");
    await userEvent.click(sendButton);

    expect(screen.getByText("Quale stack consigli?")).toBeInTheDocument();
    expect(
      screen.getByText("Modulo AI non collegato. Connetti endpoint LLM per risposte reali.")
    ).toBeInTheDocument();
    expect(messageInput).toHaveValue("");
  });
});
