import { type ChatTurn, type ProviderId } from "../lib/chatClient";

export type ChatStatus = "idle" | "sending" | "error";

export type ChatViewState = {
  messages: ChatTurn[];
  draft: string;
  status: ChatStatus;
  lastError: string | null;
  provider: ProviderId;
};

function createInitialChatState(greeting: ChatTurn): ChatViewState {
  return {
    messages: [greeting],
    draft: "",
    status: "idle",
    lastError: null,
    provider: "groq"
  };
}

let persistedChatState: ChatViewState | null = null;

export function getPersistedChatState(greeting: ChatTurn): ChatViewState {
  if (persistedChatState === null) {
    persistedChatState = createInitialChatState(greeting);
  }

  return persistedChatState;
}

export function setPersistedChatState(nextState: ChatViewState) {
  persistedChatState = nextState;
}

export function resetPersistedChatState() {
  persistedChatState = null;
}