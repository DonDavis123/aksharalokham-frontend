# Aksharalokam AI - Frontend Interface 📱

Aksharalokam is a comprehensive, AI-driven educational ecosystem built to bridge the gap between static textbooks and interactive learning. This React-based interface provides a seamless, dynamic experience specifically tailored for both students and educators.

## 🌟 Live Application & Backend
* **Live Demo:** [https://akshara-803d3.web.app](https://akshara-803d3.web.app)
* **Backend AI Engine:** [https://github.com/DonDavis123/aksharalokham-backend](https://github.com/DonDavis123/aksharalokham-backend)

## 📺 System Walkthrough
[![Aksharalokam Demo](https://img.youtube.com/vi/R07azGXrhow/0.jpg)](https://www.youtube.com/watch?v=R07azGXrhow)

## 🚀 Core Platform Features

### 1. 🔐 Role-Based Access Control (RBAC)
* **Educator Portal:** Teachers have elevated privileges with a dedicated dashboard to upload, manage, and delete PDF study materials within the system.
* **Student Portal:** Students receive a streamlined, read-only library view to securely browse materials and interact with the AI without administrative clutter.
* **Secure Auth:** Powered by **Firebase Authentication** to ensure strict separation of user roles and data privacy.

### 2. 💬 Advanced AI Chatbot (Dual-Mode)
* **Document Mode (RAG):** A highly specialized mode that forces the AI to answer strictly based on the uploaded study materials. 
* **Visual Source Verification:** In Document Mode, the UI dynamically renders the **exact original page image** alongside the AI's text answer, guaranteeing zero hallucinations and total transparency.
* **General Mode:** A standard conversational AI assistant for broader educational queries, brainstorming, and creative tasks outside the textbook scope.

### 3. 📚 Structured Material & History Management
* **Curriculum Organization:** Uploaded documents are systematically categorized by **Class** and **Subject**, creating an easily navigable, centralized library.
* **Session Persistence:** Every chat interaction is automatically saved to the user's secure profile.
* **Full CRUD History:** Users have complete control to view, revisit, and **permanently delete** previous chat histories to keep their workspace organized.

### 4. 🎨 User Experience & Accessibility
* **🌍 Multi-Language Support:** The UI and AI are fully equipped to handle document querying and conversational responses in multiple languages, making it universally accessible.
* **Malayalam-First Design:** Features specialized typography, UI components, and prompt handling optimized for Malayalam readability and cultural relevance.
* **Dynamic Theming:** A buttery-smooth light/dark mode transition system implemented globally using **Tailwind CSS** and **Framer Motion**.

## 🏗️ Technical Architecture & State Management
Built as a modern **Single Page Application (SPA)**, the frontend prioritizes speed and modularity:
* **State Management:** Utilizes React Hooks (`useState`, `useEffect`) alongside the **Context API** to avoid prop-drilling when managing global authentication, theme states, and chat history.
* **API Integration:** Asynchronous fetch calls seamlessly connect to the FastAPI backend for real-time streaming of AI responses and image retrieval.
* **Build Tooling:** Optimized with **Vite** for lightning-fast Hot Module Replacement (HMR) during development and highly compressed production bundles.

## 🛠️ Tech Stack
* **Core Framework:** React 18, Vite
* **Styling & Animation:** Tailwind CSS, Framer Motion
* **Backend-as-a-Service:** Firebase (Authentication & Web Hosting)
* **UI Components:** Lucide React (Icons)
* **Routing:** React Router DOM

## 💻 Local Developer Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/DonDavis123/aksharalokham-frontend.git](https://github.com/DonDavis123/aksharalokham-frontend.git)
   cd aksharalokham-frontend
   Install dependencies:

Bash
npm install

Configure Environment: Create a .env file in the root directory with your Firebase configuration:

Code snippet


VITE_FIREBASE_API_KEY=your_api_key

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain

VITE_FIREBASE_PROJECT_ID=your_project_id

VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

VITE_FIREBASE_APP_ID=your_app_id

VITE_BACKEND_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

Start the Development Server:

Bash
npm run dev

Developed with ❤️ by the Aksharalokam Team.
