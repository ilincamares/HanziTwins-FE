import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import QuizActive from "./QuizActive";
import { saveQuizAttempt } from "../api/progressApi";


async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

vi.mock("../api/progressApi", () => ({
  saveQuizAttempt: vi.fn(),
}));

let mockUser = {
  id: 1,
  username: "andrei",
  isGuest: false,
};

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

const metadata = {
  hsk_level: "1",
  difficulty: "hard",
  questions_count: 2,
};

const mockQuestions = [
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
      {
        character: "玉",
        pinyin: "yù",
        similarity: 92.4,
        is_correct: false,
      },
    ],
  },
  {
    target: "日",
    target_pinyin: "rì",
    options: [
      {
        character: "日",
        pinyin: "rì",
        similarity: 100.0,
        is_correct: true,
      },
      {
        character: "目",
        pinyin: "mù",
        similarity: 91.0,
        is_correct: false,
      },
    ],
  },
];

describe("QuizActive Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      id: 1,
      username: "andrei",
      isGuest: false,
    };

    saveQuizAttempt.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays feedback when a wrong answer is clicked", () => {
    render(
      <QuizActive
        questions={mockQuestions}
        metadata={metadata}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText("王")).toBeInTheDocument();

    const wrongButton = screen.getByText("yù");
    fireEvent.click(wrongButton);

    expect(wrongButton).toHaveClass("incorrect");

    expect(
      screen.getByText(/Oops! You fell for a visual trap/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/92.4%/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Got it, Next Question/i })
    ).toBeInTheDocument();
  });

  it("increases score and auto-advances when the correct answer is clicked", async () => {
    vi.useFakeTimers();

    render(
      <QuizActive
        questions={mockQuestions}
        metadata={metadata}
        onRestart={() => {}}
      />
    );

    expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();

    const correctButton = screen.getByText("wáng");
    fireEvent.click(correctButton);

    expect(correctButton).toHaveClass("correct");
    expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("日")).toBeInTheDocument();
  });

  it("shows the results screen after the final question", async () => {
    vi.useFakeTimers();

    render(
      <QuizActive
        questions={[mockQuestions[0]]}
        metadata={metadata}
        onRestart={() => {}}
      />
    );

    fireEvent.click(screen.getByText("wáng"));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/Quiz Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/You scored 1 out of 1/i)).toBeInTheDocument();
  });

  it("saves quiz attempt when a non-guest user finishes a quiz", async () => {
      vi.useFakeTimers();

      render(
        <QuizActive
          questions={[mockQuestions[0]]}
          metadata={metadata}
          onRestart={() => {}}
        />
      );

      fireEvent.click(screen.getByText("wáng"));

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await flushPromises();

      expect(saveQuizAttempt).toHaveBeenCalledTimes(1);

      expect(saveQuizAttempt).toHaveBeenCalledWith({
        user_id: 1,
        hsk_level: "1",
        difficulty: "hard",
        score: 1,
        total_questions: 1,
        answers: [
          {
            target_character: "王",
            target_pinyin: "wáng",
            selected_character: "王",
            selected_pinyin: "wáng",
            is_correct: true,
            similarity: 100.0,
          },
        ],
      });
    });

  it("does not save quiz attempt in guest mode", async () => {
      vi.useFakeTimers();

      mockUser = {
        id: null,
        username: "Guest",
        isGuest: true,
      };

      render(
        <QuizActive
          questions={[mockQuestions[0]]}
          metadata={metadata}
          onRestart={() => {}}
        />
      );

      fireEvent.click(screen.getByText("wáng"));

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await flushPromises();

      expect(screen.getByText(/Guest mode is active/i)).toBeInTheDocument();
      expect(saveQuizAttempt).not.toHaveBeenCalled();
    });

  it("handles restart from results screen", async () => {
    vi.useFakeTimers();

    const onRestartMock = vi.fn();

    render(
      <QuizActive
        questions={[mockQuestions[0]]}
        metadata={metadata}
        onRestart={onRestartMock}
      />
    );

    fireEvent.click(screen.getByText("wáng"));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    fireEvent.click(screen.getByRole("button", { name: /Play Again/i }));

    expect(onRestartMock).toHaveBeenCalledOnce();
  });
});