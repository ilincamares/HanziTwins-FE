import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewQuizPage from "./ReviewQuizPage";
import { generateReviewQuiz } from "../api/progressApi";

vi.mock("../api/progressApi", () => ({
  generateReviewQuiz: vi.fn(),
  saveQuizAttempt: vi.fn(),
}));

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: 1,
      username: "andrei",
      isGuest: false,
    },
  }),
}));

describe("ReviewQuizPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders review setup form", () => {
    render(<ReviewQuizPage />);

    expect(screen.getByText(/Review Mistakes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Questions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Review Quiz/i })
    ).toBeInTheDocument();
  });

  it("generates a review quiz and shows QuizActive", async () => {
    generateReviewQuiz.mockResolvedValueOnce({
      metadata: {
        mode: "review",
        hsk_level: "personal",
        difficulty: "medium",
        questions_count: 1,
      },
      questions: [
        {
          target: "好",
          target_pinyin: "hǎo",
          options: [
            {
              character: "好",
              pinyin: "hǎo",
              similarity: 100.0,
              is_correct: true,
            },
          ],
        },
      ],
    });

    render(<ReviewQuizPage />);

    fireEvent.click(screen.getByRole("button", { name: /Start Review Quiz/i }));

    await waitFor(() => {
      expect(generateReviewQuiz).toHaveBeenCalledWith(1, 5, "medium");
      expect(screen.getByText("好")).toBeInTheDocument();
      expect(screen.getByText("hǎo")).toBeInTheDocument();
    });
  });

  it("uses selected count and difficulty", async () => {
    generateReviewQuiz.mockResolvedValueOnce({
      metadata: {
        mode: "review",
        hsk_level: "personal",
        difficulty: "hard",
        questions_count: 1,
      },
      questions: [
        {
          target: "王",
          target_pinyin: "wáng",
          options: [
            {
              character: "王",
              pinyin: "wáng",
              similarity: 100.0,
              is_correct: true,
            },
          ],
        },
      ],
    });

    render(<ReviewQuizPage />);

    fireEvent.change(screen.getByLabelText(/Number of Questions/i), {
      target: { value: "3" },
    });

    fireEvent.change(screen.getByLabelText(/Difficulty/i), {
      target: { value: "hard" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Start Review Quiz/i }));

    await waitFor(() => {
      expect(generateReviewQuiz).toHaveBeenCalledWith(1, 3, "hard");
    });
  });

  it("shows backend error if review quiz cannot be generated", async () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

    generateReviewQuiz.mockRejectedValueOnce({
      response: {
        data: {
          detail: "No mistakes available for review.",
        },
      },
    });

    render(<ReviewQuizPage />);

    fireEvent.click(screen.getByRole("button", { name: /Start Review Quiz/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/No mistakes available for review/i)
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Complete a normal quiz and answer at least one question incorrectly/i)
      ).toBeInTheDocument();
    });

    consoleMock.mockRestore();
  });
});