import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProgressPage from "./ProgressPage";
import { getProgressSummary, getUserAttempts } from "../api/progressApi";

vi.mock("../api/progressApi", () => ({
  getProgressSummary: vi.fn(),
  getUserAttempts: vi.fn(),
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

describe("ProgressPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders progress summary and recent attempts", async () => {
    getProgressSummary.mockResolvedValueOnce({
      user_id: 1,
      total_quizzes: 2,
      total_questions: 10,
      correct_answers: 7,
      accuracy: 70.0,
      most_missed_characters: [
        {
          character: "好",
          target_pinyin: "hǎo",
          mistakes: 2,
        },
      ],
    });

    getUserAttempts.mockResolvedValueOnce({
      user_id: 1,
      attempts: [
        {
          id: 1,
          hsk_level: "1",
          difficulty: "hard",
          score: 3,
          total_questions: 5,
          created_at: "2025-05-09T12:00:00",
        },
      ],
    });

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading your progress/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Progress Dashboard/i)).toBeInTheDocument();
    });

    const statsGrid = document.querySelector(".stats-grid");

    const quizzesCard = within(statsGrid)
      .getByText(/Quizzes Completed/i)
      .closest(".stat-card");

    const questionsCard = within(statsGrid)
      .getByText(/Questions Answered/i)
      .closest(".stat-card");

    const correctCard = within(statsGrid)
      .getByText(/Correct Answers/i)
      .closest(".stat-card");

    const accuracyCard = within(statsGrid)
      .getByText(/^Accuracy$/i)
      .closest(".stat-card");

    expect(within(quizzesCard).getByText("2")).toBeInTheDocument();
    expect(within(questionsCard).getByText("10")).toBeInTheDocument();
    expect(within(correctCard).getByText("7")).toBeInTheDocument();
    expect(accuracyCard).toHaveTextContent("70%");
    expect(screen.getByText("好")).toBeInTheDocument();
    expect(screen.getByText(/hǎo/i)).toBeInTheDocument();
    expect(screen.getByText(/hard/i)).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("shows empty states when the user has no progress", async () => {
    getProgressSummary.mockResolvedValueOnce({
      user_id: 1,
      total_quizzes: 0,
      total_questions: 0,
      correct_answers: 0,
      accuracy: 0.0,
      most_missed_characters: [],
    });

    getUserAttempts.mockResolvedValueOnce({
      user_id: 1,
      attempts: [],
    });

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No mistakes recorded yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No quiz attempts recorded yet/i)).toBeInTheDocument();
    });
  });

  it("shows an error message when progress loading fails", async () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

    getProgressSummary.mockRejectedValueOnce(new Error("Failed"));
    getUserAttempts.mockResolvedValueOnce({
      user_id: 1,
      attempts: [],
    });

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not load progress data/i)).toBeInTheDocument();
    });

    consoleMock.mockRestore();
  });
});