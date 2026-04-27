import { useState } from 'react';

export default function QuizActive({ questions, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const handleAnswer = (optionObj) => {
    if (showFeedback) return;

    setSelectedOption(optionObj);
    setShowFeedback(true);

    if (optionObj.is_correct) {
      setScore(score + 1);
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isFinished) {
    return (
      <div className="results-container">
        <h2>Quiz Complete!</h2>
        <p>You scored {score} out of {questions.length}</p>
        <button onClick={onRestart}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="quiz-active-container">
      <div className="progress-bar">
        Question {currentIndex + 1} of {questions.length} | Score: {score}
      </div>

      <h1 style={{ fontSize: '6rem', margin: '20px 0', lineHeight: '1.2' }}>
        {currentQuestion.target}
      </h1>
      <p>Select the correct pinyin:</p>

      <div className="options-grid">
        {currentQuestion.options.map((opt, idx) => {
          let buttonClass = "option-btn ";
          if (showFeedback) {
            if (opt.is_correct) buttonClass += "correct";
            else if (selectedOption && opt.pinyin === selectedOption.pinyin) buttonClass += "incorrect";
          }

          return (
            <button
              key={idx}
              className={buttonClass}
              onClick={() => handleAnswer(opt)}
            >
              {opt.pinyin}
            </button>
          );
        })}
      </div>

      {showFeedback && selectedOption && !selectedOption.is_correct && (
        <div className="feedback-box">
          <h3>Oops! You fell for a visual trap.</h3>
          <p>
            You selected <strong>{selectedOption.character}</strong> ({selectedOption.pinyin}). <br/>
            You got this answer wrong because the AI calculated that these two characters are <strong>{selectedOption.similarity}%</strong> structurally similar.
          </p>
          <button className="next-btn" onClick={handleNextQuestion}>
            Got it, Next Question ➔
          </button>
        </div>
      )}
    </div>
  );
}