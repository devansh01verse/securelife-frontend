# Project Summary: Dheeraj Mittal Portfolio Website

## 🚀 Overview
A premium, full-stack portfolio and lead-generation website built for Dheeraj Mittal, a Strategic Wealth & Insurance Advisor. The application features a modern UI, dynamic client reviews, and seamless contact integration, deployed across separate cloud hosting platforms.

## 💻 Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons)
*   **Backend:** Java (Spring Boot)
*   **Database:** H2 Database (In-Memory for cloud deployment)
*   **Hosting:** Vercel (Frontend) & Render (Backend via Docker)

---

## 🏆 Milestones Achieved

### Phase 1: Local Development & UI Construction
*   Built a highly responsive, dark-mode-compatible UI using Tailwind CSS.
*   Designed the "SecureLife" brand aesthetic, later personalizing it to focus on Dheeraj Mittal's personal advisory brand.
*   Constructed a dynamic review section fetching data from a local Spring Boot REST API.
*   Resolved complex JSX `[PARSE_ERROR]` mismatched bracket issues during UI component assembly.

### Phase 2: Version Control & Security
*   Initialized standard Git version control.
*   Created two separate **Private GitHub Repositories** (`securelife-frontend` and `securelife-backend`) to protect hardcoded credentials and prevent unauthorized access.
*   Configured `.gitignore` to prevent physical `data/insurance_db.mv.db` files from causing Git lock errors ("Permission denied") and file bloat.

### Phase 3: Backend Deployment (Render)
*   Containerized the Spring Boot application by writing a custom `Dockerfile`.
*   Upgraded the Docker environment to **Java 21** to resolve the `UnsupportedClassVersionError` (Class file version 65.0 vs 61.0 mismatch).
*   Refactored `application.properties` to utilize `jdbc:h2:mem:insurance_db` (In-Memory RAM storage) to comply with Render's ephemeral free-tier file system.
*   Successfully deployed the backend to Render's Singapore region for optimal latency.

### Phase 4: Frontend Deployment & Connectivity (Vercel)
*   Replaced all hardcoded `localhost:8080` fetch requests with the live Render backend URL.
*   Conquered the **CORS (Cross-Origin Resource Sharing)** Preflight Error by implementing a global `CorsConfig.java` class in Spring Boot, explicitly allowing `OPTIONS` requests and traffic from the Vercel domain.
*   Successfully deployed the frontend to Vercel, resulting in a fully connected, live full-stack application.

### Phase 5: Asset & UI Refinement
*   Transitioned the brand copy from "SecureLife" to "Rahul Verma/Dheeraj Mittal".
*   Resolved standard React asset importing issues by replacing string-based `src` paths with direct `import` statements at the top of the Vite component for local images.

---

## 🚧 Current & Upcoming Tasks

### 1. Form Functionality (EmailJS)
*   **Goal:** Convert the static "Raise Query" HTML form into a working lead generator.
*   **Method:** Integrating `@emailjs/browser` to securely capture form data and send consultation requests directly to Dheeraj's Gmail account without requiring a dedicated email server.

### 2. AI Chatbot Integration (Gemini API)
*   **Goal:** Build a floating virtual assistant in the UI to answer basic insurance queries and push users to book consultations.
*   **Method:** Implement a custom React chat window connected to the Google Gemini API, utilizing a strict system prompt to keep the AI focused entirely on wealth advisory topics.
