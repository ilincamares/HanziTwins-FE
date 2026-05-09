import { useEffect, useState } from "react";
import { saveQuizAttempt } from "../api/progressApi";
import { useUser } from "../context/UserContext";

export default function QuizActive({ questions, metadata, onRestart }) {
  const { user } = useUser();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const score = selectedAnswers.filter(
    (answer) => answer.selectedOption?.is_correct
  ).length;

  useEffect(() => {
    if (!isFinished || saveStatus !== "idle") {
      return;
    }

    if (!user || user.isGuest) {
      setSaveStatus("guest");
      return;
    }

    const saveResults = async () => {
      try {
        setSaveStatus("saving");

        const payload = {
          user_id: user.id,
          hsk_level: metadata?.hsk_level || "all",
          difficulty: metadata?.difficulty || "medium",
          score,
          total_questions: questions.length,
          answers: selectedAnswers.map((answer) => ({
            target_character: answer.question.target,
            target_pinyin: answer.question.target_pinyin,
            selected_character: answer.selectedOption?.character || null,
            selected_pinyin: answer.selectedOption?.pinyin || null,
            is_correct: answer.selectedOption?.is_correct || false,
            similarity: answer.selectedOption?.similarity ?? null,
          })),
        };

        await saveQuizAttempt(payload);
        setSaveStatus("saved");
      } catch (error) {
        console.error("Failed to save quiz attempt:", error);
        setSaveStatus("error");
      }
    };

    saveResults();
  }, [
    isFinished,
    saveStatus,
    user,
    metadata,
    score,
    questions,
    selectedAnswers,
  ]);

  const handleAnswer = (optionObj) => {
    if (showFeedback) return;

    setSelectedOption(optionObj);
    setShowFeedback(true);

    setSelectedAnswers((previousAnswers) => [
      ...previousAnswers,
      {
        question: currentQuestion,
        selectedOption: optionObj,
      },
    ]);

    if (optionObj.is_correct) {
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

        {saveStatus === "guest" && <p>Guest mode is active. This result was not saved.</p>}
        {saveStatus === "saving" && <p>Saving your progress...</p>}
        {saveStatus === "saved" && <p>Your progress has been saved.</p>}
        {saveStatus === "error" && (
          <p>Could not save your progress. Please check the backend.</p>
        )}

        <button onClick={onRestart}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="quiz-active-container">
      <div className="progress-bar">
        Question {currentIndex + 1} of {questions.length} | Score: {score}
      </div>

      <h1 style={{ fontSize: "6rem", margin: "20px 0", lineHeight: "1.2" }}>
        {currentQuestion.target}
      </h1>

      <p>Select the correct pinyin:</p>

      <div className="options-grid">
        {currentQuestion.options.map((opt, idx) => {
          let buttonClass = "option-btn ";

          if (showFeedback) {
            if (opt.is_correct) {
              buttonClass += "correct";
            } else if (selectedOption && opt.pinyin === selectedOption.pinyin) {
              buttonClass += "incorrect";
            }
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
            You selected <strong>{selectedOption.character}</strong> (
            {selectedOption.pinyin}). <br />
            You got this answer wrong because the AI calculated that these two
            characters are <strong>{selectedOption.similarity}%</strong>{" "}
            structurally similar.
          </p>

          <button className="next-btn" onClick={handleNextQuestion}>
            Got it, Next Question ➔
          </button>
        </div>
      )}
    </div>
  );
}