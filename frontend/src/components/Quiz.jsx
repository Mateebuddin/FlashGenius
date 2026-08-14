import { useState } from "react";

function Quiz({ quiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);

  // Don't render if no quiz is available
  if (!quiz || quiz.length === 0) {
    return null;
  }

  // Handle answer selection
  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  // Calculate quiz score
  const calculateScore = () => {
    let score = 0;

    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        score++;
      }
    });

    return score;
  };

  // Reset quiz
  const handleTryAgain = () => {
    setSelectedAnswers({});
    setShowScore(false);
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">
        AI Quiz (10 Questions)
      </h2>

      <div className="space-y-8">
        {quiz.map((q, index) => (
          <div
            key={index}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-4">
              Q{index + 1}. {q.question}
            </h3>

            <div className="space-y-3">
              {q.options.map((option, i) => (
                <label
                  key={i}
                  className="block cursor-pointer hover:text-blue-300 transition"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={selectedAnswers[index] === option}
                    onChange={() => handleOptionChange(index, option)}
                    disabled={showScore}
                    className="mr-3"
                  />

                  {option}
                </label>
              ))}
            </div>

            {showScore && (
              <div className="mt-4">
                {selectedAnswers[index] === q.answer ? (
                  <p className="text-green-400 font-semibold">
                    ✅ Correct!
                  </p>
                ) : (
                  <>
                    <p className="text-red-400 font-semibold">
                      ❌ Wrong Answer
                    </p>

                    <p className="text-green-400 mt-1">
                      Correct Answer: <strong>{q.answer}</strong>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showScore ? (
        <div className="text-center mt-10">
          <button
            onClick={() => setShowScore(true)}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold transition"
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold text-green-400">
            🎉 Your Score: {calculateScore()} / {quiz.length}
          </h2>

          <button
            onClick={handleTryAgain}
            className="mt-6 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;