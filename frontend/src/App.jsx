import { useState } from "react";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// PDF.js worker setup for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function App() {
  // ==========================================
  // NOTES
  // ==========================================

  const [notes, setNotes] = useState("");

  // ==========================================
  // FILE UPLOAD
  // ==========================================

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ==========================================
  // FLASHCARDS
  // ==========================================

  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const [knownCards, setKnownCards] = useState([]);
  const [practiceCards, setPracticeCards] = useState([]);


  // ==========================================
  // QUIZ
  // ==========================================

  const [quiz, setQuiz] = useState([]);
  const [difficulty, setDifficulty] = useState("easy");
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");

  // ==========================================
  // THEME
  // ==========================================

  const [darkMode, setDarkMode] = useState(true);

  // ==========================================
  // STATISTICS
  // ==========================================

  const [pdfDownloads, setPdfDownloads] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  // ==========================================
  // AI STUDY SUMMARY
  // ==========================================

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // ==========================================
  // FILTER FLASHCARDS
  // ==========================================

  const filteredFlashcards = flashcards.filter(
    (card) =>
      card.question.toLowerCase().includes(search.toLowerCase()) ||
      card.answer.toLowerCase().includes(search.toLowerCase())
  );

  // ==========================================
  // HANDLE PDF TEXT EXTRACTION
  // ==========================================

  const extractPDFText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let extractedText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      extractedText += pageText + "\n\n";
    }

    return extractedText.trim();
  };

  // ==========================================
  // HANDLE DOCX TEXT EXTRACTION
  // ==========================================

  const extractDOCXText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer: arrayBuffer,
    });

    return result.value.trim();
  };

  // ==========================================
  // HANDLE FILE UPLOAD
  // ==========================================

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();

    const isPDF =
      file.type === "application/pdf" ||
      fileName.endsWith(".pdf");

    const isDOCX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx");

    if (!isPDF && !isDOCX) {
      alert("Please upload only PDF or DOCX files.");
      event.target.value = "";
      return;
    }

    try {
      setUploadLoading(true);
      setUploadedFile(file);

      let extractedText = "";

      if (isPDF) {
        extractedText = await extractPDFText(file);
      } else if (isDOCX) {
        extractedText = await extractDOCXText(file);
      }

      if (!extractedText) {
        alert("No readable text was found in this file.");
        setUploadedFile(null);
        return;
      }

      // Keep the existing 3000-character limit
      const limitedText = extractedText.slice(0, 3000);

      setNotes(limitedText);

      // Reset generated content because the notes have changed
      setFlashcards([]);
      setCurrentCard(0);
      setFlipped(false);
      setSearch("");

      setQuiz([]);
      setSelectedAnswers({});
      setScore(0);
      setQuizFinished(false);

      setSummary("");

      if (extractedText.length > 3000) {
        alert(
          "The file contains more than 3000 characters. Only the first 3000 characters were loaded into the notes box."
        );
      } else {
        alert("File uploaded and text extracted successfully!");
      }
    } catch (error) {
      console.error("File extraction error:", error);

      alert(
        "Failed to read the file. Please make sure the PDF or DOCX contains readable text."
      );

      setUploadedFile(null);
    } finally {
      setUploadLoading(false);
      event.target.value = "";
    }
  };

  // ==========================================
  // REMOVE UPLOADED FILE
  // ==========================================

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setNotes("");

    setFlashcards([]);
    setCurrentCard(0);
    setFlipped(false);
    setSearch("");

    setQuiz([]);
    setSelectedAnswers({});
    setScore(0);
    setQuizFinished(false);

    setSummary("");
  };

  // ==========================================
  // GENERATE FLASHCARDS
  // ==========================================

  const handleGenerate = async () => {
    if (notes.trim() === "") {
      alert("Please enter notes or upload a file first.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/generate",
        {
          notes: notes,
        }
      );
      console.log("BACKEND RESPONSE:", response.data);

      if (
        response.data.flashcards &&
        response.data.flashcards.length > 0
      ) {
        setFlashcards(response.data.flashcards);
        setCurrentCard(0);
        setFlipped(false);
        setSearch("");

        setFlashcardCount(
          (prev) => prev + response.data.flashcards.length
        );
      } else {
        alert("No flashcards received.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate flashcards.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NEXT FLASHCARD
  // ==========================================

  const nextCard = () => {
    if (currentCard < filteredFlashcards.length - 1) {
      setCurrentCard((prev) => prev + 1);
      setFlipped(false);
    }
  };

  // ==========================================
  // PREVIOUS FLASHCARD
  // ==========================================

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
      setFlipped(false);
    }
  };

  // ==========================================
  // SHUFFLE FLASHCARDS
  // ==========================================

  const shuffleFlashcards = () => {
    const shuffled = [...flashcards].sort(
      () => Math.random() - 0.5
    );

    setFlashcards(shuffled);
    setCurrentCard(0);
    setFlipped(false);
    setSearch("");
  };

  // ==========================================
  // RESTART FLASHCARDS
  // ==========================================

  const restartFlashcards = () => {
    setCurrentCard(0);
    setFlipped(false);
    setSearch("");
  };

  const markAsKnown = () => {
    if (!currentFlashcard) return;

    const cardId = currentFlashcard.question;

    setKnownCards((prev) =>
      prev.includes(cardId)
        ? prev
        : [...prev, cardId]
    );

    setPracticeCards((prev) =>
      prev.filter((id) => id !== cardId)
    );

    if (currentCard < filteredFlashcards.length - 1) {
      setCurrentCard((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const markAsPractice = () => {
    if (!currentFlashcard) return;

    const cardId = currentFlashcard.question;

    setPracticeCards((prev) =>
      prev.includes(cardId)
        ? prev
        : [...prev, cardId]
    );

    setKnownCards((prev) =>
      prev.filter((id) => id !== cardId)
    );

    if (currentCard < filteredFlashcards.length - 1) {
      setCurrentCard((prev) => prev + 1);
      setFlipped(false);
    }
  };

  // ==========================================
  // DOWNLOAD FLASHCARDS PDF
  // ==========================================

  const downloadFlashcardsPDF = () => {
    if (flashcards.length === 0) {
      alert("Please generate flashcards first.");
      return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let y = 20;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");

    doc.text(
      "FlashGenius - Flashcards",
      margin,
      y
    );

    y += 12;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Total Flashcards: ${flashcards.length}`,
      margin,
      y
    );

    y += 15;

    flashcards.forEach((card, index) => {
      const question =
        `Q${index + 1}. ${card.question}`;

      const answer =
        `Answer: ${card.answer}`;

      const questionLines =
        doc.splitTextToSize(
          question,
          contentWidth
        );

      const answerLines =
        doc.splitTextToSize(
          answer,
          contentWidth
        );

      const requiredHeight =
        questionLines.length * 7 +
        answerLines.length * 7 +
        20;

      if (
        y + requiredHeight >
        pageHeight - 20
      ) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        questionLines,
        margin,
        y
      );

      y +=
        questionLines.length * 7 +
        5;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(
        answerLines,
        margin,
        y
      );

      y +=
        answerLines.length * 7 +
        12;

      doc.setDrawColor(180, 180, 180);

      doc.line(
        margin,
        y - 5,
        pageWidth - margin,
        y - 5
      );
    });

    doc.save(
      "FlashGenius-Flashcards.pdf"
    );

    setPdfDownloads(
      (prev) => prev + 1
    );
  };

  // ==========================================
  // GENERATE QUIZ
  // ==========================================

  const handleGenerateQuiz = async () => {
    if (notes.trim() === "") {
      alert("Please enter notes or upload a file first.");
      return;
    }

    try {
      setLoadingQuiz(true);

      setQuiz([]);
      setSelectedAnswers({});
      setScore(0);
      setQuizFinished(false);

      const response = await axios.post(
        "http://127.0.0.1:8000/generate-quiz",
        {
          notes: notes,
          difficulty: difficulty,
        }
      );

      if (
        response.data.quiz &&
        response.data.quiz.length > 0
      ) {
        setQuiz(response.data.quiz);

        setQuizCount(
          (prev) => prev + 1
        );
      } else {
        alert("No quiz received.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // ==========================================
  // HANDLE QUIZ ANSWER
  // ==========================================

  const handleAnswer = (
    questionIndex,
    selectedOption
  ) => {
    if (selectedAnswers[questionIndex]) {
      return;
    }

    const correctAnswer =
      quiz[questionIndex].answer;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));

    if (selectedOption === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (
      questionIndex ===
      quiz.length - 1
    ) {
      setTimeout(() => {
        setQuizFinished(true);
      }, 500);
    }
  };

  // ==========================================
  // RESTART QUIZ
  // ==========================================

  const restartQuiz = () => {
    setSelectedAnswers({});
    setScore(0);
    setQuizFinished(false);
  };

  // ==========================================
  // CHANGE DIFFICULTY
  // ==========================================

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);

    setQuiz([]);
    setSelectedAnswers({});
    setScore(0);
    setQuizFinished(false);
  };

  // ==========================================
  // DOWNLOAD QUIZ PDF
  // ==========================================

  const downloadQuizPDF = () => {
    if (quiz.length === 0) {
      alert("Please generate a quiz first.");
      return;
    }

    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 20;

    const contentWidth =
      pageWidth - margin * 2;

    let y = 20;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");

    doc.text(
      "FlashGenius - Quiz",
      margin,
      y
    );

    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Difficulty: ${difficulty.toUpperCase()}`,
      margin,
      y
    );

    y += 12;

    doc.text(
      `Total Questions: ${quiz.length}`,
      margin,
      y
    );

    y += 15;

    quiz.forEach((item, index) => {
      const questionText =
        `Q${index + 1}. ${item.question}`;

      const questionLines =
        doc.splitTextToSize(
          questionText,
          contentWidth
        );

      const requiredHeight =
        questionLines.length * 7 +
        item.options.length * 7 +
        20;

      if (
        y + requiredHeight >
        pageHeight - 20
      ) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

      doc.text(
        questionLines,
        margin,
        y
      );

      y +=
        questionLines.length * 7 +
        5;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      item.options.forEach(
        (option, optionIndex) => {
          const optionLabel =
            `${String.fromCharCode(
              65 + optionIndex
            )}. ${option}`;

          const optionLines =
            doc.splitTextToSize(
              optionLabel,
              contentWidth - 5
            );

          if (
            y +
            optionLines.length * 7 >
            pageHeight - 20
          ) {
            doc.addPage();
            y = 20;
          }

          doc.text(
            optionLines,
            margin + 5,
            y
          );

          y +=
            optionLines.length * 7;
        }
      );

      y += 8;
    });

    if (
      y + 30 >
      pageHeight - 20
    ) {
      doc.addPage();
      y = 20;
    }

    y += 5;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Answer Key",
      margin,
      y
    );

    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    quiz.forEach((item, index) => {
      const answerText =
        `Q${index + 1}: ${item.answer}`;

      const answerLines =
        doc.splitTextToSize(
          answerText,
          contentWidth
        );

      if (
        y +
        answerLines.length * 7 >
        pageHeight - 20
      ) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        answerLines,
        margin,
        y
      );

      y +=
        answerLines.length * 7 +
        3;
    });

    if (quizFinished) {
      y += 10;

      if (
        y >
        pageHeight - 30
      ) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");

      doc.text(
        `Your Score: ${score} / ${quiz.length}`,
        margin,
        y
      );

      y += 8;

      const percentage =
        Math.round(
          (score / quiz.length) * 100
        );

      doc.text(
        `Percentage: ${percentage}%`,
        margin,
        y
      );
    }

    doc.save(
      "FlashGenius-Quiz.pdf"
    );

    setPdfDownloads(
      (prev) => prev + 1
    );
  };

  // ==========================================
  // GENERATE SUMMARY
  // ==========================================

  const handleGenerateSummary = async () => {
    if (notes.trim() === "") {
      alert("Please enter notes or upload a file first.");
      return;
    }

    try {
      setLoadingSummary(true);
      setSummary("");

      const response = await axios.post(
        "http://127.0.0.1:8000/generate-summary",
        {
          notes: notes,
        }
      );

      if (response.data.summary) {
        setSummary(
          response.data.summary
        );
      } else {
        alert("No summary received.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ==========================================
  // DOWNLOAD SUMMARY PDF
  // ==========================================

  const downloadSummaryPDF = () => {
    if (!summary) {
      alert(
        "Please generate the study summary first."
      );
      return;
    }

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "FlashGenius - AI Study Summary",
      20,
      y
    );

    y += 15;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    const cleanSummary =
      summary
        .replace(/#{1,6}\s?/g, "")
        .replace(
          /\*\*(.*?)\*\*/g,
          "$1"
        )
        .replace(
          /\*(.*?)\*/g,
          "$1"
        )
        .replace(
          /`(.*?)`/g,
          "$1"
        )
        .replace(
          /^\s*[-*]\s+/gm,
          "• "
        )
        .replace(
          /^\s*\d+\.\s+/gm,
          ""
        );

    const lines =
      cleanSummary.split("\n");

    lines.forEach((line) => {
      const trimmedLine =
        line.trim();

      if (
        trimmedLine === ""
      ) {
        y += 5;
        return;
      }

      const textLines =
        doc.splitTextToSize(
          trimmedLine,
          170
        );

      if (
        y +
        textLines.length * 6 >
        270
      ) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        textLines,
        20,
        y
      );

      y +=
        textLines.length * 6 +
        3;
    });

    doc.save(
      "FlashGenius-Study-Summary.pdf"
    );

    setPdfDownloads(
      (prev) => prev + 1
    );
  };

  // ==========================================
  // CURRENT FLASHCARD
  // ==========================================

  const currentFlashcard =
    filteredFlashcards[currentCard];

  // ==========================================
  // APP UI
  // ==========================================

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode
        ? "bg-slate-950 text-white"
        : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* ==========================================
        HEADER
    ========================================== */}

      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* ==========================================
        MAIN
    ========================================== */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ==========================================
          NOTES SECTION
      ========================================== */}

        <section
          className={`p-8 rounded-2xl shadow-lg border ${darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-gray-200"
            }`}
        >
          <h2 className="text-2xl font-bold mb-3">
            📚 Enter Your Study Notes
          </h2>

          <p
            className={`mb-5 ${darkMode
              ? "text-gray-400"
              : "text-gray-600"
              }`}
          >
            Paste your notes or upload a PDF/DOCX
            file. FlashGenius will create
            flashcards, quizzes and a study
            summary.
          </p>

          <FileUpload
            darkMode={darkMode}
            uploadLoading={uploadLoading}
            uploadedFile={uploadedFile}
            handleFileUpload={handleFileUpload}
            removeUploadedFile={removeUploadedFile}
          />

          {/* ==========================================
            NOTES TEXTAREA
        ========================================== */}

          <textarea
            value={notes}
            onChange={(e) => {
              if (e.target.value.length <= 3000) {
                setNotes(e.target.value);

                setFlashcards([]);
                setCurrentCard(0);
                setFlipped(false);
                setSearch("");

                setQuiz([]);
                setSelectedAnswers({});
                setScore(0);
                setQuizFinished(false);

                setSummary("");
              }
            }}
            placeholder="Paste your study notes here..."
            rows={10}
            className={`w-full p-5 rounded-xl border outline-none resize-none ${darkMode
              ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500"
              : "bg-gray-50 border-gray-300 text-black placeholder-gray-400"
              }`}
          />

          <div
            className={`text-right text-sm mt-2 ${darkMode
              ? "text-gray-400"
              : "text-gray-600"
              }`}
          >
            {notes.length} / 3000 characters
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              {loading
                ? "Generating..."
                : "✨ Generate Flashcards"}
            </button>
          </div>
        </section>

        {/* ==========================================
          STATISTICS
      ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

          <div
            className={`p-6 rounded-xl text-center border ${darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-gray-200"
              }`}
          >
            <p className="text-3xl font-bold text-purple-400">
              {flashcardCount}
            </p>

            <p
              className={
                darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }
            >
              Flashcards Generated
            </p>
          </div>

          <div
            className={`p-6 rounded-xl text-center border ${darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-gray-200"
              }`}
          >
            <p className="text-3xl font-bold text-blue-400">
              {quizCount}
            </p>

            <p
              className={
                darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }
            >
              Quizzes Generated
            </p>
          </div>

          <div
            className={`p-6 rounded-xl text-center border ${darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-gray-200"
              }`}
          >
            <p className="text-3xl font-bold text-green-400">
              {pdfDownloads}
            </p>

            <p
              className={
                darkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }
            >
              PDF Downloads
            </p>
          </div>

        </div>

        {/* ==========================================
    FLASHCARD SECTION
========================================== */}

        {flashcards.length > 0 && (
          <section className="mt-12">

            {/* Section Header */}
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
                AI-Powered Learning
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold text-purple-400">
                🃏 AI Flashcards
              </h2>

              <p
                className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Flip the cards and test your understanding.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentCard(0);
                    setFlipped(false);
                  }}
                  placeholder="Search flashcards..."
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500 focus:border-purple-500"
                    : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-purple-500"
                    }`}
                />
              </div>
            </div>

            {currentFlashcard ? (
              <div className="max-w-3xl mx-auto">

                {/* Progress */}
                <div className="mb-5">

                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      Flashcard Progress
                    </span>

                    <span className="font-semibold text-purple-400">
                      {currentCard + 1} / {filteredFlashcards.length}
                    </span>
                  </div>

                  <div
                    className={`w-full h-2 rounded-full overflow-hidden ${darkMode
                      ? "bg-slate-800"
                      : "bg-gray-200"
                      }`}
                  >
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{
                        width: `${((currentCard + 1) /
                          filteredFlashcards.length) *
                          100
                          }%`,
                      }}
                    />
                  </div>

                </div>

                {/* Flashcard */}
                <div
                  onClick={() =>
                    setFlipped((prev) => !prev)
                  }
                  className={`group min-h-[320px] sm:min-h-[360px] cursor-pointer rounded-3xl shadow-2xl border-2 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 ${darkMode
                    ? "bg-slate-900 border-slate-700 hover:border-purple-500"
                    : "bg-white border-gray-200 hover:border-purple-400"
                    }`}
                >

                  {!flipped ? (
                    <>
                      {/* Question Badge */}
                      <div className="mb-6 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold">
                        ❓ QUESTION
                      </div>

                      {/* Question */}
                      <h3 className="text-2xl sm:text-3xl font-bold leading-relaxed">
                        {currentFlashcard.question}
                      </h3>

                      {/* Hint */}
                      <div
                        className={`mt-10 px-5 py-3 rounded-xl text-sm ${darkMode
                          ? "bg-slate-800 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        👆 Click the card to reveal the answer
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Answer Badge */}
                      <div className="mb-6 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-bold">
                        ✅ ANSWER
                      </div>

                      {/* Answer */}
                      <p className="text-xl sm:text-2xl leading-relaxed">
                        {currentFlashcard.answer}
                      </p>

                      {/* Hint */}
                      <div
                        className={`mt-10 px-5 py-3 rounded-xl text-sm ${darkMode
                          ? "bg-slate-800 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        👆 Click the card to see the question
                      </div>
                    </>
                  )}

                </div>

                {/* Card Number */}
                <p
                  className={`text-center mt-5 text-sm ${darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                    }`}
                >
                  Card{" "}
                  <span className="font-bold text-purple-400">
                    {currentCard + 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold">
                    {filteredFlashcards.length}
                  </span>
                </p>

                {/* MASTERY PROGRESS */}
                <div
                  className={`mt-6 p-5 rounded-2xl border ${darkMode
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-gray-200"
                    }`}
                >
                  <h3 className="text-lg font-bold text-center mb-4">
                    📊 Your Study Progress
                  </h3>

                  <div className="grid grid-cols-3 gap-3 text-center">

                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {knownCards.length}
                      </p>
                      <p className="text-sm text-gray-400">
                        ✅ Known
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-orange-400">
                        {practiceCards.length}
                      </p>
                      <p className="text-sm text-gray-400">
                        🔄 Practice
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-purple-400">
                        {Math.max(
                          flashcards.length -
                          knownCards.length -
                          practiceCards.length,
                          0
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        📚 Remaining
                      </p>
                    </div>

                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Mastery</span>

                      <span className="font-bold text-purple-400">
                        {flashcards.length > 0
                          ? Math.round(
                            (knownCards.length /
                              flashcards.length) *
                            100
                          )
                          : 0}
                        %
                      </span>
                    </div>

                    <div
                      className={`w-full h-3 rounded-full ${darkMode
                          ? "bg-slate-700"
                          : "bg-gray-200"
                        }`}
                    >
                      <div
                        className="h-3 rounded-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${flashcards.length > 0
                              ? Math.min(
                                (knownCards.length /
                                  flashcards.length) *
                                100,
                                100
                              )
                              : 0
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Previous / Next */}
                <div className="flex justify-center gap-3 sm:gap-4 mt-6">

                  <button
                    onClick={previousCard}
                    disabled={currentCard === 0}
                    className="px-5 sm:px-7 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
                  >
                    ← Previous
                  </button>

                  <button
                    onClick={nextCard}
                    disabled={
                      currentCard ===
                      filteredFlashcards.length - 1
                    }
                    className="px-5 sm:px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
                  >
                    Next →
                  </button>

                </div>

                {/* Secondary Actions */}
                <div className="flex flex-wrap justify-center gap-3 mt-5">

                  {flipped && (
                    <div className="flex flex-wrap justify-center gap-4 mt-6">

                      <button
                        onClick={markAsKnown}
                        className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:scale-105"
                      >
                        ✅ I Know It
                      </button>

                      <button
                        onClick={markAsPractice}
                        className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all hover:scale-105"
                      >
                        🔄 Need Practice
                      </button>

                    </div>
                  )}

                  <button
                    onClick={shuffleFlashcards}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all hover:scale-105"
                  >
                    🔀 Shuffle
                  </button>

                  <button
                    onClick={restartFlashcards}
                    className="px-5 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all hover:scale-105"
                  >
                    🔄 Restart
                  </button>

                  <button
                    onClick={downloadFlashcardsPDF}
                    className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:scale-105"
                  >
                    📄 Download PDF
                  </button>

                </div>

                {/* Study Tip */}
                <div
                  className={`mt-8 p-4 rounded-xl text-center text-sm ${darkMode
                    ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    : "bg-purple-50 text-purple-700 border border-purple-100"
                    }`}
                >
                  💡 <strong>Study Tip:</strong> Try answering the question
                  before flipping the card.
                </div>

              </div>
            ) : (
              <div
                className={`max-w-xl mx-auto p-8 rounded-2xl text-center ${darkMode
                  ? "bg-slate-900 text-gray-400"
                  : "bg-white text-gray-600"
                  }`}
              >
                <div className="text-4xl mb-3">
                  🔍
                </div>

                <p className="font-semibold">
                  No flashcards match your search.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCurrentCard(0);
                    setFlipped(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Clear Search
                </button>
              </div>
            )}

          </section>
        )}

        {/* ==========================================
          QUIZ SECTION
      ========================================== */}

        {notes.trim() !== "" && (
          <section className="mt-12">

            <h2 className="text-3xl font-bold text-center text-purple-400 mb-8">
              🧠 AI Quiz Generator
            </h2>

            <div className="flex justify-center mb-6">

              <select
                value={difficulty}
                onChange={handleDifficultyChange}
                className={`px-6 py-3 rounded-xl border outline-none ${darkMode
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-gray-300 text-black"
                  }`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

            </div>

            <div className="flex justify-center mb-8">

              <button
                onClick={handleGenerateQuiz}
                disabled={loadingQuiz}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                {loadingQuiz
                  ? "Generating Quiz..."
                  : "🧠 Generate Quiz"}
              </button>

            </div>

            {quiz.length > 0 && !quizFinished && (
              <div className="space-y-6">

                {quiz.map((item, index) => (

                  <div
                    key={index}
                    className={`p-6 rounded-xl shadow-lg border ${darkMode
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-gray-300"
                      }`}
                  >

                    <h3 className="text-xl font-bold mb-4">
                      Q{index + 1}. {item.question}
                    </h3>

                    <div className="space-y-3">

                      {item.options.map(
                        (option, optionIndex) => {

                          const selected =
                            selectedAnswers[index];

                          const isSelected =
                            selected === option;

                          const isCorrect =
                            option === item.answer;

                          return (
                            <button
                              key={optionIndex}
                              onClick={() =>
                                handleAnswer(
                                  index,
                                  option
                                )
                              }
                              disabled={!!selected}
                              className={`w-full text-left p-4 rounded-lg border transition ${selected
                                ? isCorrect
                                  ? "bg-green-600 border-green-400 text-white"
                                  : isSelected
                                    ? "bg-red-600 border-red-400 text-white"
                                    : darkMode
                                      ? "bg-slate-700 border-slate-600 text-white"
                                      : "bg-gray-100 border-gray-300 text-black"
                                : darkMode
                                  ? "bg-slate-700 border-slate-600 text-white hover:border-purple-500"
                                  : "bg-gray-100 border-gray-300 text-black hover:border-purple-500"
                                }`}
                            >
                              {option}

                              {isSelected &&
                                (isCorrect
                                  ? " ✅ Correct!"
                                  : " ❌ Wrong!")}

                              {selected &&
                                !isSelected &&
                                isCorrect &&
                                " ✅ Correct Answer"}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                ))}

              </div>
            )}

            {quizFinished && (
              <div
                className={`mt-8 p-8 rounded-xl text-center shadow-lg border ${darkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-gray-300"
                  }`}
              >

                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  🎉 Quiz Completed!
                </h2>

                <p className="text-2xl font-bold mb-2">
                  Your Score
                </p>

                <p className="text-5xl font-bold text-purple-400 mb-4">
                  {score} / {quiz.length}
                </p>

                <p className="text-xl mb-6">
                  {quiz.length > 0
                    ? Math.round(
                      (score / quiz.length) * 100
                    )
                    : 0}
                  %
                </p>

                <p className="text-lg mb-6">
                  {score === quiz.length
                    ? "🏆 Excellent! Perfect score!"
                    : score >= quiz.length * 0.7
                      ? "👏 Great job! Keep it up!"
                      : score >= quiz.length * 0.5
                        ? "👍 Good effort! Keep practicing!"
                        : "📚 Keep studying and try again!"}
                </p>

                <div className="flex flex-wrap justify-center gap-4">

                  <button
                    onClick={restartQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition"
                  >
                    🔄 Restart Quiz
                  </button>

                  <button
                    onClick={downloadQuizPDF}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
                  >
                    📄 Download Quiz PDF
                  </button>

                </div>

              </div>
            )}

            {quiz.length > 0 && !quizFinished && (
              <div className="flex justify-center mt-8">

                <button
                  onClick={downloadQuizPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  📄 Download Quiz PDF
                </button>

              </div>
            )}

          </section>
        )}

        {/* ==========================================
          AI STUDY SUMMARY
      ========================================== */}

        {notes.trim() !== "" && (
          <section className="mt-12">

            <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">
              📖 AI Study Summary
            </h2>

            <div className="flex justify-center mb-8">

              <button
                onClick={handleGenerateSummary}
                disabled={loadingSummary}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                {loadingSummary
                  ? "Generating Summary..."
                  : "📖 Generate Study Summary"}
              </button>

            </div>

            {summary && (
              <div
                className={`p-6 rounded-xl shadow-lg border ${darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-300"
                  }`}
              >

                <h3 className="text-2xl font-bold text-blue-400 mb-6">
                  Study Summary
                </h3>

                <div className="text-lg leading-8">

                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-blue-400 mb-4">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold text-blue-400 mb-4">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="text-xl font-bold text-blue-300 mb-3">
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="mb-4">
                          {children}
                        </p>
                      ),

                      ul: ({ children }) => (
                        <ul className="list-disc ml-6 mb-5 space-y-2">
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="list-decimal ml-6 mb-5 space-y-2">
                          {children}
                        </ol>
                      ),

                      li: ({ children }) => (
                        <li className="mb-2">
                          {children}
                        </li>
                      ),

                      strong: ({ children }) => (
                        <strong className="font-bold text-blue-300">
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {summary}
                  </ReactMarkdown>

                </div>

              </div>
            )}

            {summary && (
              <div className="flex justify-center mt-8">

                <button
                  onClick={downloadSummaryPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  📥 Download Summary PDF
                </button>

              </div>
            )}

          </section>
        )}

      </main>

      {/* ==========================================
        FOOTER
    ========================================== */}

      <footer
        className={`mt-16 py-8 text-center border-t ${darkMode
          ? "border-slate-800 text-gray-500"
          : "border-gray-200 text-gray-500"
          }`}
      >
        <p>
          © 2026 FlashGenius — AI Powered Study Assistant
        </p>
      </footer>

    </div>
  );
}

export default App;