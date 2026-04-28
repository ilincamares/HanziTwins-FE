import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizPage from './QuizPage';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: { get: vi.fn() },
}));

describe('QuizPage Integration', () => {
  it('swaps from Setup to Active Quiz when data is loaded', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { questions: [{ target: '天', target_pinyin: 'tiān', options: [] }] }
    });

    render(<QuizPage />);

    // Verify we start on the Setup screen
    expect(screen.getByText(/Configure Your Quiz/i)).toBeInTheDocument();

    // User clicks "Start Quiz"
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));

    // Wait for the API to resolve and verify the UI swapped!
    await waitFor(() => {
      expect(screen.queryByText(/Configure Your Quiz/i)).not.toBeInTheDocument();
      expect(screen.getByText('天')).toBeInTheDocument();
    });
  });
});