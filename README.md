# EduTech AI Platform

A full-stack EdTech platform with AI-powered course generation, built with Next.js, MongoDB, and Google Gemini.

## Features

- **Student Portal**: Browse courses, enroll, track progress, and chat with educators.
- **Educator Portal**: Create courses with AI assistance (syllabus & content), manage students.
- **AI Integration**: Uses Google Gemini to generate course syllabi and lesson content.
- **Authentication**: Secure role-based auth (Student/Educator/Admin) using JWT and HTTP-only cookies.
- **Chat**: Real-time-like chat for course Q&A.

## Prerequisites

- Node.js 18+
- MongoDB (Local or Atlas)
- Google Gemini API Key

## Setup

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Variables**

    Copy `env.example` to `.env` and fill in your details:

    ```bash
    cp env.example .env
    ```

    Update `.env`:
    - `MONGODB_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A long random string.
    - `GEMINI_API_KEY`: Your Google Gemini API key.

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/lib`: Utilities (DB connection, Auth, AI).
- `src/models`: Mongoose models (User, Course, etc.).
- `src/middleware.ts`: Route protection middleware.

## Usage

1.  **Sign Up**: Create an account. Choose "Educator" to create courses.
2.  **Create Course**: Go to Educator Dashboard -> Create New Course. Fill details -> Generate Syllabus -> Generate Content -> Publish.
3.  **Enroll**: Log out or use incognito, sign up as "Student". Browse courses and enroll.
4.  **Learn**: Access the learning dashboard, view content, and use the chat.

## Deployment

- **Vercel**: Recommended for Next.js. Add environment variables in Vercel project settings.
- **MongoDB Atlas**: Use for production database.
