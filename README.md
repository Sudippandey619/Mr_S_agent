# Mr S Agent

A modern AI chat application built with React, TypeScript, and Tailwind CSS, powered by Groq's AI models.

## Features

- 🤖 Real-time AI chat with Groq API
- 💬 Streaming responses for better UX
- 🎨 Modern, responsive UI with dark/light theme
- 📱 Mobile-friendly design
- � Secure environment-based API key configuration
- 📋 Code syntax highlighting and copy functionality

## Quick Start

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local` and add your Groq API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace `your_groq_api_key_here` with your actual API key from [Groq Console](https://console.groq.com/keys).

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Start Chatting!

- Open the app in your browser
- Type your message in the input field
- Press Enter and watch the AI respond in real-time

## Usage

1. **Start Chatting**: Type your message in the input field and press Enter
2. **View Responses**: AI responses will stream in real-time
3. **Copy Code**: Click the copy button on code blocks to copy to clipboard
4. **Theme Toggle**: Use the theme button in the header to switch between light/dark modes

## Available Models

The application uses Groq's `llama-3.1-70b-versatile` model, which provides:
- Fast response times
- High-quality text generation
- Code understanding and generation
- Multi-language support

## What You Can Ask

- Programming questions and code examples
- Technical explanations and tutorials
- Debugging help and problem-solving
- General knowledge questions
- Creative writing assistance
- And much more!

## Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── ChatArea.tsx    # Main chat display
│   │   ├── ChatBubble.tsx  # Individual message component
│   │   ├── InputBar.tsx    # Message input component
│   │   ├── Header.tsx      # Application header
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── context/            # React context providers
│   │   └── ChatContext.tsx # Chat state management
│   └── App.tsx            # Main application component
├── services/
│   └── groq.ts            # Groq API integration
├── styles/                # CSS and styling
└── main.tsx              # Application entry point
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **Groq SDK** - AI model integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.