import { useState } from "react";
import { generateReviewQuiz } from "../api/progressApi";
import { useUser } from "../context/UserContext";
import QuizActive from "../components/QuizActive";

export default function ReviewQuizPage() {
  const { user } = useUser();

  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartReview = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const data = await generateReviewQuiz(user.id, count, difficulty);
      setQuizData(data);
    } catch (error) {
      console.error(error);

      const backendMessage = error.response?.data?.detail;

      if (backendMessage) {
        setErrorMessage(backendMessage);
      } else {
        setErrorMessage("Could not generate review quiz.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (quizData) {
    return (
      <QuizActive
        questions={quizData.questions}
        metadata={quizData.metadata}
        onRestart={() => setQuizData(null)}
      />
    );
  }

  return (
    <div className="setup-container">
      <h1>Review Mistakes</h1>

      <p className="review-description">
        Generate a personalized quiz from the Hanzi you previously answered
        incorrectly.
      </p>

      <form onSubmit={handleStartReview}>
        <label htmlFor="review-count">Number of Questions:</label>
        <input
          id="review-count"
          type="number"
          min="1"
          max="20"
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />

        <label htmlFor="review-difficulty">Difficulty:</label>
        <select
          id="review-difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Start Review Quiz"}
        </button>
      </form>

      {errorMessage && (
        <div className="review-error-box">
          <p>{errorMessage}</p>
          <p>
            Complete a normal quiz and answer at least one question incorrectly
            to unlock mistake review.
          </p>
        </div>
      )}
    </div>
  );
}