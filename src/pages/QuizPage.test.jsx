import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuizPage from "./QuizPage";
import apiClient from "../api/client";

vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../api/progressApi", () => ({
  saveQuizAttempt: vi.fn(),
}));

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: 1,
      username: "test_user",
      isGuest: false,
    },
  }),
}));

describe("QuizPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("swaps from setup screen to active quiz when quiz data is loaded", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        metadata: {
          hsk_level: "all",
          difficulty: "medium",
          questions_count: 1,
        },
        questions: [
          {
            target: "天",
            target_pinyin: "tiān",
            options: [
              {
                character: "天",
                pinyin: "tiān",
                similarity: 100.0,
                is_correct: true,
              },
            ],
          },
        ],
      },
    });

    render(<QuizPage />);

    expect(screen.getByText(/Configure Your Quiz/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Configure Your Quiz/i)).not.toBeInTheDocument();
      expect(screen.getByText("天")).toBeInTheDocument();
      expect(screen.getByText("tiān")).toBeInTheDocument();
    });
  });

  it("returns to setup screen after clicking Play Again", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        metadata: {
          hsk_level: "all",
          difficulty: "medium",
          questions_count: 0,
        },
        questions: [],
      },
    });

    render(<QuizPage />);

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/Quiz Complete/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Play Again/i }));

    expect(screen.getByText(/Configure Your Quiz/i)).toBeInTheDocument();
  });
});