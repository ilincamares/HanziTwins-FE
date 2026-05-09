import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuizSetup from "./QuizSetup";
import apiClient from "../api/client";

vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("QuizSetup Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all configuration options", () => {
    render(<QuizSetup onQuizReady={() => {}} />);

    expect(screen.getByText(/Configure Your Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/HSK Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Questions/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Quiz/i })).toBeInTheDocument();
  });

  it("calls the API and passes full quiz data to onQuizReady", async () => {
    const mockQuizData = {
      metadata: {
        hsk_level: "all",
        difficulty: "medium",
        questions_count: 5,
      },
      questions: [
        {
          target: "王",
          target_pinyin: "wáng",
          options: [],
        },
      ],
    };

    apiClient.get.mockResolvedValueOnce({
      data: mockQuizData,
    });

    const onQuizReadyMock = vi.fn();

    render(<QuizSetup onQuizReady={onQuizReadyMock} />);

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

    expect(screen.getByRole("button")).toHaveTextContent(/Generating AI Lookalikes/i);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/quiz/generate", {
        params: {
          hsk_level: "all",
          difficulty: "medium",
          count: 5,
        },
      });

      expect(onQuizReadyMock).toHaveBeenCalledWith(mockQuizData);
    });
  });

  it("uses selected form values when generating a quiz", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        metadata: {
          hsk_level: "3",
          difficulty: "hard",
          questions_count: 10,
        },
        questions: [],
      },
    });

    render(<QuizSetup onQuizReady={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/HSK Level/i), {
      target: { value: "3" },
    });

    fireEvent.change(screen.getByLabelText(/Difficulty/i), {
      target: { value: "hard" },
    });

    fireEvent.change(screen.getByLabelText(/Number of Questions/i), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/quiz/generate", {
        params: {
          hsk_level: "3",
          difficulty: "hard",
          count: "10",
        },
      });
    });
  });

  it("shows an alert if quiz generation fails", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

    apiClient.get.mockRejectedValueOnce(new Error("Backend down"));

    render(<QuizSetup onQuizReady={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Failed to load quiz. Is the backend running?"
      );
    });

    alertMock.mockRestore();
    consoleMock.mockRestore();
  });
});