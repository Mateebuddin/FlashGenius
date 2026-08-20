\# ⚡ FlashGenius



\### AI-Powered Flashcard, Quiz \& Study Summary Generator



FlashGenius is a full-stack AI-powered study assistant that transforms study notes and uploaded documents into \*\*flashcards, quizzes, and concise study summaries\*\*.



Students can paste their notes or upload a PDF/DOCX document, and FlashGenius uses the \*\*Google Gemini API\*\* to automatically generate useful study material.



🌐 \*\*Live Demo:\*\*  

https://flash-genius-two.vercel.app



\---



\## 📌 Project Overview



Students often spend a significant amount of time manually creating flashcards, quizzes, and revision notes.



FlashGenius automates this process using Generative AI.



Users can provide study material by:



\- Pasting notes directly

\- Uploading a PDF file

\- Uploading a DOCX file



The application extracts the study content and allows the user to generate AI-powered learning resources.



\---



\## ✨ Features



\### 🧠 AI Flashcard Generator



Automatically generates \*\*10 question-and-answer flashcards\*\* from the provided study material.



Features include:



\- AI-generated questions and answers

\- Interactive card flipping

\- Previous/next card navigation

\- Flashcard search

\- Flashcard progress tracking



\---



\### 📝 AI Quiz Generator



Generates an interactive multiple-choice quiz based on the user's notes.



Features include:



\- AI-generated MCQ questions

\- Multiple difficulty levels

&#x20; - Easy

&#x20; - Medium

&#x20; - Hard

\- Answer selection

\- Automatic score calculation

\- Quiz result feedback



\---



\### 📚 AI Study Summary



Creates a concise study summary from long notes.



This helps students quickly review important concepts before examinations or revision sessions.



\---



\### 📄 PDF \& DOCX Upload



Users can upload study documents directly.



Supported formats:



\- PDF

\- DOCX



The backend extracts text from the uploaded document and uses it as input for AI generation.



\---



\### 📥 Download Study Material



Generated study content can be downloaded for offline revision.



This allows students to save their generated learning material and access it later.



\---



\### 🌗 Light / Dark Mode



FlashGenius includes a theme switcher that allows users to switch between light and dark interfaces.



\---



\## 🛠️ Tech Stack



\### Frontend



\- React

\- Vite

\- JavaScript

\- CSS

\- Axios

\- Lucide React



\### Backend



\- Python

\- FastAPI

\- Uvicorn

\- Pydantic



\### Artificial Intelligence



\- Google Gemini API

\- Gemini 2.5 Flash



\### Document Processing



\- PyPDF

\- python-docx



\### Deployment



\- \*\*Frontend:\*\* Vercel

\- \*\*Backend:\*\* Render

\- \*\*Version Control:\*\* Git \& GitHub



\---



\## 🏗️ System Architecture



```text

&#x20;                   ┌──────────────────────┐

&#x20;                   │        User          │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌──────────────────────┐

&#x20;                   │   React + Vite UI    │

&#x20;                   │      (Vercel)        │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                         HTTPS / Axios

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌──────────────────────┐

&#x20;                   │   FastAPI Backend    │

&#x20;                   │       (Render)       │

&#x20;                   └──────┬────────┬──────┘

&#x20;                          │        │

&#x20;                          │        └──────────────┐

&#x20;                          ▼                       ▼

&#x20;               ┌──────────────────┐     ┌─────────────────┐

&#x20;               │ Google Gemini AI │     │ PDF/DOCX Parser │

&#x20;               └──────────────────┘     └─────────────────┘

```



\---



\## 🔄 Application Workflow



```text

User enters notes / uploads document

&#x20;               ↓

Backend extracts and processes text

&#x20;               ↓

User selects a learning tool

&#x20;               ↓

&#x20;    ┌──────────┼──────────┐

&#x20;    ↓          ↓          ↓

&#x20;Flashcards    Quiz      Summary

&#x20;    │          │          │

&#x20;    └──────────┼──────────┘

&#x20;               ↓

&#x20;      Google Gemini API

&#x20;               ↓

&#x20;     AI-generated content

&#x20;               ↓

&#x20;      Displayed in React UI

&#x20;               ↓

&#x20;      Download / Study

```



\---



\## 📂 Project Structure



```text

FlashGenius/

│

├── frontend/

│   ├── src/

│   │   ├── services/

│   │   │   └── api.js

│   │   ├── App.jsx

│   │   └── main.jsx

│   │

│   ├── package.json

│   └── vite.config.js

│

├── backend/

│   ├── app/

│   │   └── main.py

│   │

│   └── requirements.txt

│

├── .gitignore

└── README.md

```



\---



\## 🔌 API Endpoints



The FastAPI backend provides endpoints for the major application features.



| Method | Endpoint | Purpose |

|---|---|---|

| `GET` | `/` | Backend health/root endpoint |

| `POST` | `/generate` | Generate AI flashcards |

| `POST` | `/generate-quiz` | Generate an AI quiz |

| `POST` | `/generate-summary` | Generate a study summary |



Additional endpoints may be used for document processing and other application features.



\---



\## ⚙️ Local Installation



\### 1. Clone the Repository



```bash

git clone https://github.com/Mateebuddin/FlashGenius.git

cd FlashGenius

```



\---



\## 💻 Frontend Setup



Move into the frontend directory:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Create a `.env` file if you want to override the default backend URL:



```env

VITE\_API\_URL=http://127.0.0.1:8000

```



Start the development server:



```bash

npm run dev

```



The frontend will normally run at:



```text

http://localhost:5173

```



\---



\## 🐍 Backend Setup



Open another terminal and move into the backend directory:



```bash

cd backend

```



Create a Python virtual environment:



\### Windows



```bash

python -m venv venv

venv\\Scripts\\activate

```



\### macOS / Linux



```bash

python3 -m venv venv

source venv/bin/activate

```



Install backend dependencies:



```bash

pip install -r requirements.txt

```



\---



\## 🔑 Environment Variables



Create a `.env` file inside the backend directory.



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key\_here

```



Then start the FastAPI backend:



```bash

uvicorn app.main:app --reload

```



The backend should run at:



```text

http://127.0.0.1:8000

```



\---



\## 🔐 Security



The Gemini API key is stored on the \*\*backend\*\* and is not exposed directly to the frontend.



Sensitive configuration should be stored using environment variables.



Never commit files containing real API keys.



Example `.gitignore` entries:



```gitignore

.env

.env.\*

venv/

\_\_pycache\_\_/

node\_modules/

dist/

```



\---



\## 🌐 Deployment



\### Frontend



The React/Vite frontend is deployed using Vercel.



Production application:



https://flash-genius-two.vercel.app



\### Backend



The FastAPI backend is deployed using Render.



The frontend communicates with the backend through HTTPS API requests.



Production CORS configuration restricts/permits the required frontend origins so the deployed application can communicate securely with the backend.



\---



\## 📸 Screenshots



\### Home / Study Notes



\_Add screenshot here.\_



\### AI Flashcards



\_Add screenshot here.\_



\### AI Quiz



\_Add screenshot here.\_



\### AI Study Summary



\_Add screenshot here.\_



\### Document Upload



\_Add screenshot here.\_



> Screenshots will be added to the repository to demonstrate the live application interface and features.



\---



\## 🧪 Production Testing



The deployed application has been tested for the main user workflow:



\- Flashcard generation

\- Quiz generation

\- Study summary generation

\- PDF/DOCX upload

\- Download functionality

\- Frontend-to-backend API communication



\---



\## 🚀 Future Improvements



Potential improvements include:



\- User authentication

\- Student accounts

\- Save flashcard decks

\- Save quiz history

\- Database integration

\- Spaced-repetition learning

\- Study streak tracking

\- AI-generated explanations

\- More quiz formats

\- Improved analytics dashboard

\- Mobile-first experience

\- Shareable flashcard decks



\---



\## 🎯 Learning Outcomes



Building FlashGenius provided practical experience with:



\- Full-stack web development

\- React application development

\- REST API integration

\- FastAPI backend development

\- Generative AI integration

\- Prompt engineering

\- JSON response processing

\- File upload and document processing

\- Environment variable management

\- CORS configuration

\- Git and GitHub

\- Frontend deployment with Vercel

\- Backend deployment with Render

\- Debugging production API issues



\---



\## 👨‍💻 Developer



\*\*Mohammed Mateebuddin\*\*



Computer Science (Data Science) Student



\### GitHub



https://github.com/Mateebuddin



\---



\## ⭐ Support



If you find FlashGenius useful, consider giving the repository a ⭐ on GitHub.



\---



\## 📄 License



This project was developed for educational and portfolio purposes.

