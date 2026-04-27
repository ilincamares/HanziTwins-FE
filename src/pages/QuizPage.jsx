import { useState } from 'react';
import QuizSetup from '../components/QuizSetup';
import QuizActive from '../components/QuizActive';

export default function QuizPage() {
  const [quizData, setQuizData] = useState(null);

  return (
    <div className="page-wrapper">
      {!quizData ? (
        <QuizSetup onQuizReady={(data) => setQuizData(data)} />
      ) : (
        <QuizActive
          questions={quizData}
          onRestart={() => setQuizData(null)}
        />
      )}
    </div>
  );
}