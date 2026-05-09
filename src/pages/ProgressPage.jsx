import { useEffect, useState } from "react";
import { getProgressSummary, getUserAttempts } from "../api/progressApi";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function ProgressPage() {
  const { user } = useUser();

  const [summary, setSummary] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [summaryData, attemptsData] = await Promise.all([
          getProgressSummary(user.id),
          getUserAttempts(user.id),
        ]);

        setSummary(summaryData);
        setAttempts(attemptsData.attempts || []);
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load progress data.");
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user.id]);

  if (loading) {
    return (
      <div className="placeholder-page">
        <h1>Progress Dashboard</h1>
        <p>Loading your progress...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="placeholder-page">
        <h1>Progress Dashboard</h1>
        <p className="error-message">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <section className="progress-header">
        <h1>Progress Dashboard</h1>
        <p>Track your quiz history and most difficult Hanzi.</p>
        <Link to="/review" className="review-link-button">
            Review Mistakes
        </Link>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Quizzes Completed</span>
          <strong>{summary.total_quizzes}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Questions Answered</span>
          <strong>{summary.total_questions}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Correct Answers</span>
          <strong>{summary.correct_answers}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Accuracy</span>
          <strong>{summary.accuracy}%</strong>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Most Missed Characters</h2>

        {summary.most_missed_characters.length === 0 ? (
          <p className="empty-message">
            No mistakes recorded yet. Complete a quiz to see difficult
            characters here.
          </p>
        ) : (
          <div className="mistake-list">
            {summary.most_missed_characters.map((item) => (
              <div className="mistake-card" key={item.character}>
                <div className="mistake-character">{item.character}</div>

                <div>
                  <p>
                    <strong>Pinyin:</strong> {item.target_pinyin}
                  </p>
                  <p>
                    <strong>Mistakes:</strong> {item.mistakes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Recent Quiz Attempts</h2>

        {attempts.length === 0 ? (
          <p className="empty-message">
            No quiz attempts recorded yet.
          </p>
        ) : (
          <div className="attempt-table-wrapper">
            <table className="attempt-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>HSK</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                </tr>
              </thead>

              <tbody>
                {attempts.map((attempt) => {
                  const attemptAccuracy =
                    attempt.total_questions > 0
                      ? Math.round((attempt.score / attempt.total_questions) * 100)
                      : 0;

                  return (
                    <tr key={attempt.id}>
                      <td>{formatDate(attempt.created_at)}</td>
                      <td>{attempt.hsk_level}</td>
                      <td>{attempt.difficulty}</td>
                      <td>
                        {attempt.score}/{attempt.total_questions}
                      </td>
                      <td>{attemptAccuracy}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}