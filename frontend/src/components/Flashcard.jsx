import { useState } from "react";

function Flashcard({ question, answer, index }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const copyFlashcard = () => {
    const text = `Question: ${question}\n\nAnswer: ${answer}`;

    navigator.clipboard.writeText(text);

    alert("Flashcard copied successfully!");
  };

  return (
    <div
      onClick={() => setShowAnswer(!showAnswer)}
      className={`min-h-[300px] rounded-2xl p-8 cursor-pointer
        border transition-all duration-300 shadow-xl
        ${
          showAnswer
            ? "bg-slate-800 border-green-500"
            : "bg-slate-800 border-slate-700 hover:border-blue-500"
        }
      `}
    >
      {!showAnswer ? (
        <>
          {/* Question */}
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-bold text-lg">
              Q{index + 1}
            </span>

            <span className="text-gray-400 text-sm">
              🔄 Click to flip
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white mt-8">
            Question
          </h3>

          <p className="mt-5 text-lg text-gray-200 leading-8">
            {question}
          </p>

          <p className="mt-8 text-gray-400 text-sm">
            👆 Click anywhere on the card to see the answer
          </p>
        </>
      ) : (
        <>
          {/* Answer */}
          <div className="flex justify-between items-center">
            <span className="text-green-400 font-bold text-lg">
              Q{index + 1}
            </span>

            <span className="text-gray-400 text-sm">
              🔄 Click to flip
            </span>
          </div>

          <h3 className="text-2xl font-bold text-green-400 mt-8">
            Answer
          </h3>

          <p className="mt-5 text-lg text-gray-200 leading-8">
            {answer}
          </p>

          <p className="mt-8 text-gray-400 text-sm">
            👆 Click anywhere on the card to see the question
          </p>
        </>
      )}

      {/* Copy Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyFlashcard();
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}

export default Flashcard;