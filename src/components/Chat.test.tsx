import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/chatClient", async () => {
  const actual = await vi.importActual<typeof import("../lib/chatClient")>(
    "../lib/chatClient"
  );
  return {
    ...actual,
    sendChat: vi.fn()
  };
});

import { ChatClientError, sendChat } from "../lib/chatClient";
import { Chat } from "./Chat";

const sendChatMock = sendChat as unknown as ReturnType<typeof vi.fn>;

const greetingSubstring = "digital twin";

describe("Chat", () => {
  beforeEach(() => {
    sendChatMock.mockReset();
  });

  it("shows the initial welcome message", () => {
    render(<Chat />);
    expect(
      screen.getByText((text) => text.includes(greetingSubstring))
    ).toBeInTheDocument();
  });

  it("empty submit does not call sendChat", async () => {
    render(<Chat />);
    const user = userEvent.setup();

    const sendButton = screen.getByRole("button", { name: "Send" });
    // The button is disabled when draft is empty. Also verify via keyboard.
    await user.click(sendButton);
    await user.click(screen.getByLabelText("Message"));
    await user.keyboard("{Enter}");

    expect(sendChatMock).not.toHaveBeenCalled();
  });

  it("first submit sends history with greeting + first user and renders reply", async () => {
    sendChatMock.mockResolvedValueOnce("I am Daniele.");

    render(<Chat />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Message");
    await user.type(input, "Who are you?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(sendChatMock).toHaveBeenCalledTimes(1));
    const firstCall = sendChatMock.mock.calls[0]!;
    const historyArg = firstCall[0] as import("../lib/chatClient").ChatTurn[];
    const providerArg = firstCall[1];
    const signalArg = firstCall[2];
    expect(Array.isArray(historyArg)).toBe(true);
    expect(historyArg).toHaveLength(2);
    expect(historyArg[0]!.role).toBe("assistant");
    expect(historyArg[0]!.content).toContain(greetingSubstring);
    expect(historyArg[1]).toEqual({ role: "user", content: "Who are you?" });
    expect(typeof providerArg).toBe("string");
    expect(signalArg).toBeInstanceOf(AbortSignal);

    expect(await screen.findByText("I am Daniele.")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("second submit sends complete history (greeting + user1 + assistant1 + user2)", async () => {
    sendChatMock
      .mockResolvedValueOnce("I am Daniele.")
      .mockResolvedValueOnce("I worked at Alten.");

    render(<Chat />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Message");
    await user.type(input, "Who are you?");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("I am Daniele.");

    await user.type(screen.getByLabelText("Message"), "Where do you work?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(sendChatMock).toHaveBeenCalledTimes(2));
    const [historyArg] = sendChatMock.mock.calls[1]!;
    expect(historyArg).toHaveLength(4);
    expect(historyArg[0].role).toBe("assistant");
    expect(historyArg[1]).toEqual({ role: "user", content: "Who are you?" });
    expect(historyArg[2]).toEqual({ role: "assistant", content: "I am Daniele." });
    expect(historyArg[3]).toEqual({ role: "user", content: "Where do you work?" });

    expect(await screen.findByText("I worked at Alten.")).toBeInTheDocument();
  });

  it("sending state shows loader and disables input", async () => {
    sendChatMock.mockImplementation(() => new Promise(() => {}));

    render(<Chat />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "Ping?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Waiting for reply...")
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(screen.getByPlaceholderText("Waiting for reply...")).toBeDisabled();

    const log = screen.getByRole("list", { name: "Chat history" });
    expect(within(log).getByText("…")).toBeInTheDocument();
  });

  it("error state shows alert, keeps user message, and offers Retry", async () => {
    sendChatMock.mockRejectedValueOnce(
      new ChatClientError("bad", "INVALID_REQUEST", 400)
    );

    render(<Chat />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "Question?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("bad");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByText("Question?")).toBeInTheDocument();
  });

  it("Retry calls sendChat with the same history without duplicating the user turn", async () => {
    sendChatMock
      .mockRejectedValueOnce(new ChatClientError("bad", "INVALID_REQUEST", 400))
      .mockResolvedValueOnce("Reply after retry.");

    render(<Chat />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "Question?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByRole("alert");

    const firstCallHistory = sendChatMock.mock.calls[0]![0];
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(sendChatMock).toHaveBeenCalledTimes(2));
    const retryHistory = sendChatMock.mock.calls[1]![0];
    expect(retryHistory).toEqual(firstCallHistory);
    expect(retryHistory[retryHistory.length - 1]).toEqual({
      role: "user",
      content: "Question?"
    });

    expect(await screen.findByText("Reply after retry.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
