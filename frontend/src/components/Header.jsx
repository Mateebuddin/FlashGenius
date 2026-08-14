function Header({ darkMode, setDarkMode }) {
  return (
    <header
      className={`border-b ${
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">
            FlashGenius
          </h1>

          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            AI Flashcard & Quiz Generator
          </p>
        </div>

        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            darkMode
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
}

export default Header;