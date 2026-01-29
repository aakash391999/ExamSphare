<div align="center">
<img width="1200" height="475" alt="ExamSphere Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ExamSphere
### AI-Powered Adaptive Learning Platform

</div>

**ExamSphere** is a modern, AI-enhanced study companion designed to help students master their exams through adaptive learning, personalized analytics, and intelligent content generation. Built with React, TypeScript, and Firebase, it leverages Google's Gemini AI to provide dynamic explanations, generate questions, and create interactive mind maps.

---

## 🚀 Key Features

### 🎓 Student Features
- **Smart Dashboard**: specific daily tasks, progress tracking, and study streaks.
- **Adaptive Practice**: Take quizzes with questions tailored to your performance.
- **AI Tutor & Chat**: Real-time AI explanations for any topic, integrated directly into the study flow.
- **Dynamic Mind Maps**: Visual learning with AI-generated mind maps for complex topics.
- **Mistake Book**: Automatically tracks incorrect answers so you can review and master weak areas.
- **Analytics Engine**: Visual insights into your strengths, weaknesses, and study patterns using interactive charts.
- **Smart Planner**: Organized study schedules to keep you on track.
- **Flashcards**: Active recall tools for key concepts.
- **Theming**: Personalize your learning environment with multiple themes (Default, Midnight, Aurora, Rose).

### 🛡️ Admin Features
- **Content Management**: Create and manage exams, subjects, and topics.
- **Question Bank**: Upload and organize questions for the platform.
- **User Management**: Overview of platform users and roles.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (with Lucide React icons)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **AI Integration**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `@google/genai`)
- **Visualization**: [Mermaid.js](https://mermaid.js.org/) (Diagrams), [Recharts](https://recharts.org/) (Analytics)
- **Routing**: [React Router DOM](https://reactrouter.com/)

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: (v16 or higher recommended)
- **Firebase Project**: A Firebase project with Authentication (Email/Password) and Firestore enabled.
- **Gemini API Key**: An API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/examsphere.git
   cd examsphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Configure Firebase**
   Update `src/services/firebase.ts` with your Firebase project configuration credentials.
   *(Note: For production, ensure these are loaded safe via environment variables as well)*

### Running the App

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

---

## 📂 Project Structure

```
examsphere/
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, Layouts)
│   ├── pages/           # Main application screens
│   │   ├── Auth.tsx        # Login/Signup
│   │   ├── Dashboard.tsx   # Student Home
│   │   ├── Practice.tsx    # Quiz Interface
│   │   ├── TopicDetail.tsx # Content & AI Chat
│   │   ├── Admin.tsx       # Admin Panel
│   │   └── ...
│   ├── services/        # Firebase and external API services
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main entry point & Routing
│   └── types.ts         # TypeScript interfaces
├── public/              # Static assets
└── package.json         # Project dependencies
```

---

## 👥 Usage Guide

1. **Sign Up**: Create an account to start tracking your progress.
2. **Setup**: Select your exam goal and customize your weak subjects and daily study hours.
3. **Study**: Navigate to **Syllabus** to browse topics or **Practice** to take quizzes.
4. **Review**: Check the **Mistake Book** to revisit errors.
5. **Analyze**: Use the **Analytics** tab to see your performance trends.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
