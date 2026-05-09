import { useState } from 'react';
import apiClient from '../api/client';

export default function QuizSetup({ onQuizReady }) {
  const [hskLevel, setHskLevel] = useState('all');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.get('/quiz/generate', {
        params: { hsk_level: hskLevel, difficulty, count }
      });

      onQuizReady(response.data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("Failed to load quiz. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <h2>Configure Your Quiz</h2>
      <form onSubmit={handleStartQuiz}>

        <label htmlFor="hsk-select">HSK Level:</label>
        <select id="hsk-select" value={hskLevel} onChange={(e) => setHskLevel(e.target.value)}>
          <option value="all">All Characters</option>
          <option value="1">HSK 1</option>
          <option value="2">HSK 2</option>
          <option value="3">HSK 3</option>
          <option value="4">HSK 4</option>
          <option value="5">HSK 5</option>
          <option value="6">HSK 6</option>
        </select>

        <label htmlFor="diff-select">Difficulty (Distractor Proximity):</label>
        <select id="diff-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy (Distant Topology)</option>
          <option value="medium">Medium (Similar Topology)</option>
          <option value="hard">Hard (Near-Identical Topology)</option>
        </select>

        <label htmlFor="count-input">Number of Questions:</label>
        <input
          id="count-input"
          type="number"
          min="1" max="20"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Generating AI Lookalikes..." : "Start Quiz"}
        </button>
      </form>
    </div>
  );
}