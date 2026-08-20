import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://flashgenius-2t0k.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateFlashcards = (notes) => {
  return api.post("/generate", {
    notes,
  });
};

export const generateQuiz = (notes, difficulty) => {
  return api.post("/generate-quiz", {
    notes,
    difficulty,
  });
};

export const generateSummary = (notes) => {
  return api.post("/generate-summary", {
    notes,
  });
};

export default api;
