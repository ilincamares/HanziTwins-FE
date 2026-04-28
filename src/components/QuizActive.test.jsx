import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizActive from './QuizActive';

const mockQuestions = [
  {
    target: "王",
    target_pinyin: "wáng",
    options: [
      { character: "王", pinyin: "wáng", similarity: 100.0, is_correct: true },
      { character: "玉", pinyin: "yù", similarity: 92.4, is_correct: false },
    ]
  }
];

describe('QuizActive Component', () => {
  it('displays the pedagogical feedback box when a wrong answer is clicked', () => {
    render(<QuizActive questions={mockQuestions} onRestart={() => {}} />);

    // Verify the target character is rendered
    expect(screen.getByText('王')).toBeInTheDocument();

    // The user clicks the wrong option (yù)
    const wrongButton = screen.getByText('yù');
    fireEvent.click(wrongButton);

    // Verify the button turned red
    expect(wrongButton).toHaveClass('incorrect');

    // Verify Feedback Box appeared!
    expect(screen.getByText(/Oops! You fell for a visual trap./i)).toBeInTheDocument();

    // Verify the similarity from the AI is displayed
    expect(screen.getByText(/92.4%/i)).toBeInTheDocument();
    expect(screen.getByText(/Got it, Next Question/i)).toBeInTheDocument();
  });

  it('increases score and auto-advances when the correct answer is clicked', async () => {
    vi.useFakeTimers();

    const twoQuestions = [
      ...mockQuestions,
      { target: "日", target_pinyin: "rì", options: [{ character: "日", pinyin: "rì", similarity: 100, is_correct: true }] }
    ];

    render(<QuizActive questions={twoQuestions} onRestart={() => {}} />);

    expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();

    const correctButton = screen.getAllByText('wáng')[0];
    fireEvent.click(correctButton);

    expect(correctButton).toHaveClass('correct');
    expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();

    // 2. Wrap the timer jump in act() so React can safely update the DOM
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Now it will successfully find the "日" character!
    expect(screen.getByText('日')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows the results screen and handles restart when quiz is finished', () => {
    const onRestartMock = vi.fn();
    // Pass an empty array to simulate being out of questions (index >= length)
    render(<QuizActive questions={[]} onRestart={onRestartMock} />);

    // Verify the Game Over screen renders
    expect(screen.getByText(/Quiz Complete!/i)).toBeInTheDocument();

    // Click Play Again
    fireEvent.click(screen.getByRole('button', { name: /Play Again/i }));

    // Verify the parent function was called
    expect(onRestartMock).toHaveBeenCalledOnce();
  });
});