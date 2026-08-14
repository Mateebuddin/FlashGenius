function FileUpload({
  darkMode,
  uploadLoading,
  uploadedFile,
  handleFileUpload,
  removeUploadedFile,
}) {
  return (
    <div
      className={`mb-6 p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all duration-300 ${
        darkMode
          ? "border-purple-500/60 bg-slate-800/70 hover:border-purple-400 hover:bg-slate-800"
          : "border-purple-300 bg-purple-50 hover:border-purple-400 hover:bg-purple-100"
      }`}
    >
      {/* Upload Icon */}
      <div
        className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${
          darkMode
            ? "bg-purple-500/10"
            : "bg-purple-100"
        }`}
      >
        📚
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold mb-2">
        Upload Your Study Notes
      </h3>

      {/* Description */}
      <p
        className={`text-sm sm:text-base max-w-lg mx-auto mb-6 ${
          darkMode
            ? "text-gray-400"
            : "text-gray-600"
        }`}
      >
        Upload a PDF or DOCX file and{" "}
        <span className="font-semibold text-purple-400">
          FlashGenius
        </span>{" "}
        will automatically extract the text and turn it into
        smart study material.
      </p>

      {/* Supported Formats */}
      <div
        className={`flex flex-wrap justify-center gap-2 mb-6 text-xs ${
          darkMode
            ? "text-gray-400"
            : "text-gray-600"
        }`}
      >
        <span
          className={`px-3 py-1 rounded-full ${
            darkMode
              ? "bg-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          📄 PDF
        </span>

        <span
          className={`px-3 py-1 rounded-full ${
            darkMode
              ? "bg-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          📝 DOCX
        </span>

        <span
          className={`px-3 py-1 rounded-full ${
            darkMode
              ? "bg-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          🔒 Secure Processing
        </span>
      </div>

      {/* Upload Button */}
      <label
        className={`inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold transition-all duration-200 ${
          uploadLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 hover:scale-105 cursor-pointer shadow-lg shadow-purple-500/20"
        }`}
      >
        {uploadLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Reading File...
          </>
        ) : (
          <>
            📂
            Choose PDF / DOCX
          </>
        )}

        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileUpload}
          disabled={uploadLoading}
          className="hidden"
        />
      </label>

      {/* Loading Message */}
      {uploadLoading && (
        <p
          className={`mt-4 text-sm ${
            darkMode
              ? "text-purple-300"
              : "text-purple-600"
          }`}
        >
          Extracting text from your file...
        </p>
      )}

      {/* Uploaded File */}
      {uploadedFile && !uploadLoading && (
        <div
          className={`mt-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left ${
            darkMode
              ? "bg-slate-700/80 border border-slate-600"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* File Information */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl">
              📄
            </div>

            <div className="min-w-0">
              <p
                className={`text-xs mb-1 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Uploaded File
              </p>

              <p className="font-semibold truncate max-w-[220px] sm:max-w-[350px]">
                {uploadedFile.name}
              </p>

              <p
                className={`text-xs mt-1 ${
                  darkMode
                    ? "text-green-400"
                    : "text-green-600"
                }`}
              >
                ✓ Text extracted successfully
              </p>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={removeUploadedFile}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 hover:scale-105 text-white text-sm font-semibold transition-all duration-200"
          >
            🗑️ Remove
          </button>
        </div>
      )}

      {/* Bottom Hint */}
      {!uploadedFile && !uploadLoading && (
        <p
          className={`mt-5 text-xs ${
            darkMode
              ? "text-gray-500"
              : "text-gray-500"
          }`}
        >
          Maximum text extraction: 3000 characters
        </p>
      )}
    </div>
  );
}

export default FileUpload;