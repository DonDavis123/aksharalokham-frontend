# Aksharalokam AI - Backend Engine 🧠

Aksharalokam is an enterprise-grade **Retrieval-Augmented Generation (RAG)** platform built for the Malayalam educational sector. This asynchronous FastAPI backend acts as the core AI engine, orchestrating document intelligence, high-speed semantic search, and multimodal LLM reasoning.

## 🌟 Live Application & Frontend
* **Live Demo:** [https://akshara-803d3.web.app](https://akshara-803d3.web.app)
* **Frontend Repository:** [https://github.com/DonDavis123/aksharalokham-frontend](https://github.com/DonDavis123/aksharalokham-frontend)

## 📺 System Walkthrough
[![Aksharalokam Demo](https://img.youtube.com/vi/R07azGXrhow/0.jpg)](https://www.youtube.com/watch?v=R07azGXrhow)

## 🚀 Advanced Technical Features

### 1. Multimodal RAG Pipeline (Text + Image)
Unlike standard RAG systems, this engine "sees" the textbook. Using `PyMuPDF` (fitz), it extracts the top $K$ relevant text chunks alongside the **original page images**. Both are fed asynchronously to **Gemini 2.5 Flash**, allowing the AI to perfectly explain diagrams, maps, and tables with 100% visual context.

### 2. High-Speed Optimization & Caching
* **LRU Semantic Caching:** Implements `@lru_cache` on the `SentenceTransformer` embedding generation. Repeated or identical student queries hit RAM instantly, bypassing the PyTorch neural network and reducing latency dramatically.
* **In-Memory FAISS Caching:** The `DOCUMENT_CACHE` dictionary pre-loads FAISS flat L2 indices and text chunks into RAM upon document upload or first query, avoiding slow hard-drive read bottlenecks.
* **Asynchronous I/O:** Built with `asyncio.to_thread` to offload heavy blocking tasks (like Document AI OCR processing, FAISS indexing, and PDF image extraction) so the FastAPI event loop is never blocked.

### 3. "Zero-Hallucination" Guardrails
* **Verbatim Prompt Engineering:** Strict system instructions force the LLM to extract "steps," "stages," and "procedures" **word-for-word** from the provided context blocks.
* **Inline Citation Engine:** Automatically maps the FAISS retrieval metadata to the LLM generation, ensuring every fact is backed by a verifiable `[Page X]` clickable citation link.
* **Malayalam-First Intelligence:** The `paraphrase-multilingual-mpnet-base-v2` model ensures highly accurate semantic clustering for Malayalam, while the prompt strictly guards the response language.

### 4. Robust Security & Persistence
* **Authentication:** Middleware utilizes the **Firebase Admin SDK** to verify JWT tokens (`auth.verify_id_token`), ensuring only authenticated students and teachers can access endpoints or the SQLite DB.
* **Path Traversal Protection:** Implements strict UUID-v4 Regex validation (`DOC_ID_PATTERN`) on all file-serving endpoints to prevent directory traversal attacks.

## 🏗️ System Architecture & Data Flow

1. **Ingestion (`/api/upload`):** * PDF uploaded -> Sent to **Google Document AI** for robust OCR.
   * Text is chunked (800 chars / 150 overlap) -> Vectorized via PyTorch -> Indexed in **FAISS**.
2. **Querying (`/api/ask`):**
   * History loaded from **SQLite** for conversational memory.
   * Semantic search retrieves top chunks -> Context sent to **Gemini 2.5 Flash**.
3. **Data Management:** SQLite handles complex relations including Chat Histories, Pinned Chats, and Class/Subject-wise Material catalogs.

## 🛠️ Tech Stack
* **Framework:** Python 3.10+, FastAPI, Uvicorn
* **AI & LLMs:** Google Gemini 2.5 Flash, Google Document AI
* **Machine Learning:** PyTorch, Sentence-Transformers, FAISS-CPU
* **Data Processing:** PyMuPDF (fitz), Pillow, NumPy
* **Database & Auth:** SQLite3, Firebase Admin SDK

## 💻 Local Developer Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/DonDavis123/aksharalokham-backend.git](https://github.com/DonDavis123/aksharalokham-backend.git)
   cd aksharalokham-backend

   Install dependencies:

Bash
pip install -r requirements.txt
Configure Environment: Create a .env file in the root directory:

Code snippet
GCP_PROJECT_ID=your_project_id
GCP_LOCATION=us
GCP_PROCESSOR_ID=your_processor_id
DOC_AI_CREDENTIAL_PATH=credentials/your-doc-ai-key.json
FIREBASE_CREDENTIAL_PATH=credentials/firebase_admin.json
GEMINI_API_KEY=your_gemini_key
DOC_FOLDER=documents
DB_PATH=aksharalokam_database.db
Start the Engine:

Bash
uvicorn backend_server:app --host 127.0.0.1 --port 8000 --reload
Developed with ❤️ by the Aksharalokam Team.
