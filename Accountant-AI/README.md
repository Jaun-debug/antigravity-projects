# Accountant.AI - Portable Intelligent Ledger

A standalone, portable, and responsive accounting application built with Next.js (App Router), TypeScript, and Tailwind CSS. This app uses GPT-4o to analyze financial statements and organize them into client-specific ledgers.

## 🚀 Features

- **Intelligent Extraction**: Upload PDFs or Images of bank statements and let AI map transactions to Date, Description, and Amount.
- **Client Repository**: Automatically partition transactions into Credits (Income) and Debits (Expenses) folders for each client.
- **Statement Archive**: Upload and manage consolidated financial records.
- **Deep Preview**: View extracted CSV data in high-density tables directly in the browser.
- **PWA Support**: Installable on Mobile and Desktop for offline access and native-like experience.
- **Portable Architecture**: Zero dependency on Anti-Gravity. Runs on any Node.js environment.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: Zustand
- **Backend**: Next.js API Routes (Edge-ready)
- **AI**: OpenAI GPT-4o with Vision
- **OCR**: pdf-parse & OpenAI Vision

## 📦 Setup & Installation

1. **Clone the repository** (if applicable) or copy the files.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - Rename `.env.example` to `.env.local`.
   - Add your `OPENAI_API_KEY`.
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal).

## 🏗 Directory Structure

```text
/src
  /app          - Main Page Router & API Routes
  /components   - Reusable UI Components
  /lib          - Shared utilities and API client
  /store        - Zustand state management
/storage        - Local filesystem storage (Portable)
/public         - Static assets and PWA manifest
```

## 📱 Mobile Installation (PWA)

- **iOS**: Open in Safari, tap "Share" > "Add to Home Screen".
- **Android**: Open in Chrome, tap "..." > "Install App".
- **Desktop**: Click the install icon in the address bar.

## 📄 License
Standalone Portable Edition - 2026.
