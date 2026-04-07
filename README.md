# Aksharalokam AI - Frontend Interface 📱

Aksharalokam is a modern, AI-driven educational platform built to help students interact with their textbooks in Malayalam. This repository contains the React-based user interface, designed for high performance and accessibility.

## 🌟 Live Demo
**View the project live here:** [https://akshara-803d3.web.app](https://akshara-803d3.web.app)

## 📺 Project Walkthrough
[Drag and drop your demo video file here while editing this file on GitHub]

## 🚀 Key Features
* **Interactive Chat Interface:** A seamless, real-time chat experience for querying uploaded documents.
* **Document Management:** Teachers and students can upload PDFs, which are then processed by the AI backend for context-aware Q&A.
* **Multimodal Context:** The UI displays both text-based AI answers and original page images from the textbook for visual verification.
* **Malayalam-First Design:** Full support for Malayalam script and specialized prompt engineering for accurate local language responses.
* **Dynamic Theming:** A buttery-smooth light/dark mode transition system implemented with Tailwind CSS.

## 🏗️ Technical Architecture


The frontend is built as a **Single Page Application (SPA)** that communicates with a FastAPI RAG engine:
* **State Management:** React Hooks (`useState`, `useEffect`) manage user authentication and chat history.
* **Authentication:** Integrated with **Firebase Auth** for secure student and teacher logins.
* **Theming:** Custom `ThemeContext` providing global dark/light mode states.
* **Performance:** Optimized for speed using **Vite** and **Tailwind CSS** for minimal bundle sizes.

## 🔗 Connected Repositories
* **Backend AI Engine:** [https://github.com/DonDavis123/aksharalokham-backend]

## 🛠️ Tech Stack
* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS
* **Backend-as-a-Service:** Firebase (Auth & Hosting)
* **Icons & UI:** Lucide React & Framer Motion

## 💻 Local Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your Firebase and API keys.
4. Run locally: `npm run dev`.

---
Developed by the Aksharalokam Team.
