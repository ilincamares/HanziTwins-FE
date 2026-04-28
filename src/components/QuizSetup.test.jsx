import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizSetup from './QuizSetup';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('QuizSetup Component', () => {
    beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all configuration options', () => {
    render(<QuizSetup onQuizReady={() => {}} />);

    expect(screen.getByText(/HSK Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Quiz/i })).toBeInTheDocument();
  });

  it('calls the API and triggers onQuizReady when submitted', async () => {
    const mockData = { data: { questions: [{ target: '王', options: [] }] } };
    apiClient.get.mockResolvedValueOnce(mockData);

    const onQuizReadyMock = vi.fn();
    render(<QuizSetup onQuizReady={onQuizReadyMock} />);

    const startButton = screen.getByRole('button', { name: /Start Quiz/i });
    fireEvent.click(startButton);

    expect(startButton).toHaveTextContent(/Generating AI Lookalikes/i);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/quiz/generate', {
        params: { hsk_level: 'all', difficulty: 'medium', count: 5 }
      });
      expect(onQuizReadyMock).toHaveBeenCalledWith(mockData.data.questions);
    });
  });

  it('updates state when user changes form inputs', async () => {
    const mockData = { data: { questions: [] } };
    apiClient.get.mockResolvedValueOnce(mockData);

    render(<QuizSetup onQuizReady={vi.fn()} />);

    const hskSelect = screen.getByLabelText(/HSK Level/i);
    fireEvent.change(hskSelect, { target: { value: '3' } });
    expect(hskSelect.value).toBe('3');

    const difficultySelect = screen.getByLabelText(/Difficulty/i);
    fireEvent.change(difficultySelect, { target: { value: 'hard' } });
    expect(difficultySelect.value).toBe('hard');

    const countInput = screen.getByLabelText(/Number of Questions/i);
    fireEvent.change(countInput, { target: { value: '10' } });
    expect(countInput.value).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/quiz/generate', {
        params: { hsk_level: '3', difficulty: 'hard', count: '10' }
      });
    });
  });
});