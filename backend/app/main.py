from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from google import genai
from google.genai import types

from PIL import Image
import pytesseract

from pypdf import PdfReader
from docx import Document

import os
import json
import time


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise Exception("GEMINI_API_KEY not found in .env file")


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(api_key=api_key)


# ============================================================
# OCR CONFIGURATION
# ============================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="FlashGenius API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://flash-genius-two.vercel.app",
        "https://flash-genius-fb7u.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST MODELS
# ============================================================

class Notes(BaseModel):
    notes: str


class QuizRequest(BaseModel):
    notes: str
    difficulty: str


class SummaryRequest(BaseModel):
    notes: str


class AskAIRequest(BaseModel):
    notes: str
    question: str


# ============================================================
# RESPONSE SCHEMAS
# ============================================================

FLASHCARD_SCHEMA = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "question": {
                "type": "STRING"
            },
            "answer": {
                "type": "STRING"
            }
        },
        "required": [
            "question",
            "answer"
        ]
    }
}


QUIZ_SCHEMA = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "question": {
                "type": "STRING"
            },
            "options": {
                "type": "ARRAY",
                "items": {
                    "type": "STRING"
                }
            },
            "answer": {
                "type": "STRING"
            }
        },
        "required": [
            "question",
            "options",
            "answer"
        ]
    }
}


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "FlashGenius Backend Running Successfully",
        "status": "online"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# EXTRACT TEXT FROM PDF
# ============================================================

def extract_pdf_text(file_bytes):

    from io import BytesIO

    reader = PdfReader(BytesIO(file_bytes))

    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text.append(text)

    return "\n".join(extracted_text)


# ============================================================
# EXTRACT TEXT FROM DOCX
# ============================================================

def extract_docx_text(file_bytes):

    from io import BytesIO

    document = Document(BytesIO(file_bytes))

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)


# ============================================================
# EXTRACT TEXT FROM IMAGE
# ============================================================

def extract_image_text(file_bytes):

    from io import BytesIO

    image = Image.open(BytesIO(file_bytes))

    text = pytesseract.image_to_string(image)

    return text


# ============================================================
# UPLOAD FILE AND EXTRACT NOTES
# ============================================================

@app.post("/extract-file")
async def extract_file(file: UploadFile = File(...)):

    try:

        filename = file.filename or ""
        extension = os.path.splitext(filename)[1].lower()

        file_bytes = await file.read()

        if not file_bytes:
            return {
                "text": "",
                "error": "Uploaded file is empty."
            }


        # ----------------------------------------------------
        # PDF
        # ----------------------------------------------------

        if extension == ".pdf":

            text = extract_pdf_text(file_bytes)


        # ----------------------------------------------------
        # DOCX
        # ----------------------------------------------------

        elif extension == ".docx":

            text = extract_docx_text(file_bytes)


        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        elif extension in [
            ".png",
            ".jpg",
            ".jpeg",
            ".webp"
        ]:

            text = extract_image_text(file_bytes)


        # ----------------------------------------------------
        # UNSUPPORTED FILE
        # ----------------------------------------------------

        else:

            return {
                "text": "",
                "error": (
                    "Unsupported file type. "
                    "Please upload PDF, DOCX, PNG, JPG or JPEG."
                )
            }


        text = text.strip()


        if not text:

            return {
                "text": "",
                "error": (
                    "No readable text was found in the file."
                )
            }


        # Keep the application within the existing
        # 3000-character notes limit.
        text = text[:3000]


        print("\n========== FILE EXTRACTION ==========")
        print("Filename:", filename)
        print("Characters:", len(text))
        print("=====================================\n")


        return {
            "text": text,
            "filename": filename,
            "characters": len(text)
        }


    except Exception as e:

        print("\n========== FILE EXTRACTION ERROR ==========")
        print(repr(e))
        print("===========================================\n")

        return {
            "text": "",
            "error": str(e)
        }


# ============================================================
# OCR ENDPOINT
# ============================================================

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):

    try:

        file_bytes = await file.read()

        text = extract_image_text(file_bytes)

        return {
            "text": text.strip()
        }


    except Exception as e:

        print("\n========== OCR ERROR ==========")
        print(repr(e))
        print("===============================\n")

        return {
            "text": "",
            "error": str(e)
        }


# ============================================================
# GENERATE FLASHCARDS
# ============================================================

@app.post("/generate")
def generate(data: Notes):

    if not data.notes.strip():

        return {
            "flashcards": [],
            "error": "Notes cannot be empty."
        }


    prompt = f"""
You are an expert AI study assistant.

Create exactly 10 useful flashcards from the study notes below.

Requirements:

- Create exactly 10 flashcards.
- Each flashcard must have a clear question.
- Each answer must be concise but accurate.
- Focus on important concepts, definitions, facts, and understanding.
- Do not invent information that is not supported by the notes.

Study Notes:

{data.notes}
"""


    for attempt in range(3):

        try:

            response = client.models.generate_content(

                model="gemini-3.5-flash",

                contents=prompt,

                config=types.GenerateContentConfig(

                    response_mime_type="application/json",

                    response_schema=FLASHCARD_SCHEMA,

                    temperature=0.3,

                    max_output_tokens=4000
                )
            )


            print("\n========== GEMINI FLASHCARD RESPONSE ==========")
            print(response.text)
            print("===============================================\n")


            flashcards = json.loads(response.text)


            if not isinstance(flashcards, list):

                raise ValueError(
                    "Gemini returned an invalid flashcard format."
                )


            if len(flashcards) == 0:

                raise ValueError(
                    "Gemini returned zero flashcards."
                )


            # Make sure every card has the required fields.

            valid_flashcards = []

            for card in flashcards:

                if (
                    isinstance(card, dict)
                    and "question" in card
                    and "answer" in card
                ):

                    valid_flashcards.append({
                        "question": str(card["question"]),
                        "answer": str(card["answer"])
                    })


            if len(valid_flashcards) == 0:

                raise ValueError(
                    "No valid flashcards were returned."
                )


            print(
                "\n========== FLASHCARDS SUCCESS =========="
            )

            print(
                "Generated:",
                len(valid_flashcards)
            )

            print(
                "========================================\n"
            )


            return {
                "flashcards": valid_flashcards
            }


        except Exception as e:

            print(
                f"\n========== FLASHCARD ERROR "
                f"(Attempt {attempt + 1}) =========="
            )

            print(repr(e))

            print(
                "========================================\n"
            )


            if attempt < 2:

                time.sleep(3)

            else:

                return {
                    "flashcards": [],
                    "error": str(e)
                }


# ============================================================
# GENERATE QUIZ
# ============================================================

@app.post("/generate-quiz")
def generate_quiz(data: QuizRequest):

    if not data.notes.strip():

        return {
            "quiz": [],
            "error": "Notes cannot be empty."
        }


    difficulty = data.difficulty.lower().strip()


    if difficulty not in [
        "easy",
        "medium",
        "hard"
    ]:

        difficulty = "easy"


    prompt = f"""
You are an expert AI quiz generator.

Create exactly 10 multiple-choice questions from the study notes.

Difficulty level:
{difficulty}

Requirements:

- Exactly 10 questions.
- Exactly 4 options for every question.
- Only one option must be correct.
- The answer field must contain the exact text of the correct option.
- Questions must be based only on the provided study notes.
- Match the requested difficulty level.

Study Notes:

{data.notes}
"""


    try:

        response = client.models.generate_content(

            model="gemini-3.5-flash",

            contents=prompt,

            config=types.GenerateContentConfig(

                response_mime_type="application/json",

                response_schema=QUIZ_SCHEMA,

                temperature=0.3,

                max_output_tokens=6000
            )
        )


        print("\n========== GEMINI QUIZ RESPONSE ==========")
        print(response.text)
        print("===========================================\n")


        quiz = json.loads(response.text)


        if not isinstance(quiz, list):

            raise ValueError(
                "Gemini returned an invalid quiz format."
            )


        valid_quiz = []


        for item in quiz:

            if not isinstance(item, dict):
                continue


            question = item.get("question")
            options = item.get("options")
            answer = item.get("answer")


            if not question:
                continue


            if not isinstance(options, list):
                continue


            if len(options) < 2:
                continue


            if not answer:
                continue


            valid_quiz.append({

                "question": str(question),

                "options": [
                    str(option)
                    for option in options
                ],

                "answer": str(answer)
            })


        if not valid_quiz:

            raise ValueError(
                "No valid quiz questions were returned."
            )


        print(
            "\n========== QUIZ SUCCESS =========="
        )

        print(
            "Generated:",
            len(valid_quiz)
        )

        print(
            "==================================\n"
        )


        return {
            "quiz": valid_quiz
        }


    except Exception as e:

        print("\n========== QUIZ ERROR ==========")
        print(repr(e))
        print("===============================\n")


        return {
            "quiz": [],
            "error": str(e)
        }


# ============================================================
# GENERATE AI STUDY SUMMARY
# ============================================================

@app.post("/generate-summary")
def generate_summary(request: SummaryRequest):

    if not request.notes.strip():

        return {
            "summary": "",
            "error": "Notes cannot be empty."
        }


    prompt = f"""
You are an expert teacher and study assistant.

Create a concise study summary from the notes below.

Requirements:

- Use simple English.
- Focus on the most important concepts.
- Use headings when useful.
- Use bullet points for important information.
- Do not add information that is not supported by the notes.
- Keep the summary suitable for exam preparation.

Study Notes:

{request.notes}
"""


    try:

        response = client.models.generate_content(

            model="gemini-3.5-flash",

            contents=prompt,

            config=types.GenerateContentConfig(

                temperature=0.3,

                max_output_tokens=3000
            )
        )


        summary = response.text.strip()


        print("\n========== SUMMARY ==========")
        print(summary)
        print("=============================\n")


        if not summary:

            raise ValueError(
                "Gemini returned an empty summary."
            )


        return {
            "summary": summary
        }


    except Exception as e:

        print("\n========== SUMMARY ERROR ==========")
        print(repr(e))
        print("==================================\n")


        return {
            "summary": "",
            "error": str(e)
        }


# ============================================================
# ASK AI
# ============================================================

@app.post("/ask-ai")
def ask_ai(request: AskAIRequest):

    if not request.notes.strip():

        return {
            "answer": "",
            "error": "Notes cannot be empty."
        }


    if not request.question.strip():

        return {
            "answer": "",
            "error": "Question cannot be empty."
        }


    prompt = f"""
You are an AI study assistant.

Answer the student's question using the provided study notes.

Rules:

- Use the study notes as the main source.
- Give a clear and simple explanation.
- If the notes do not contain enough information, say so.
- Do not invent facts.

Study Notes:

{request.notes}

Student Question:

{request.question}
"""


    try:

        response = client.models.generate_content(

            model="gemini-3.5-flash",

            contents=prompt,

            config=types.GenerateContentConfig(

                temperature=0.3,

                max_output_tokens=2000
            )
        )


        answer = response.text.strip()


        return {
            "answer": answer
        }


    except Exception as e:

        print("\n========== ASK AI ERROR ==========")
        print(repr(e))
        print("==================================\n")


        return {
            "answer": "",
            "error": str(e)
        }
