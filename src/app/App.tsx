import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { ChatProvider } from '@/app/context/ChatContext';
import { Header } from '@/app/components/Header';
import { Sidebar } from '@/app/components/Sidebar';
import { ChatArea } from '@/app/components/ChatArea';
import { InputBar } from '@/app/components/InputBar';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ChatProvider>
        {/* Welcome Screen */}
        {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
        
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          {/* Sidebar */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <Header onMenuClick={toggleSidebar} />

            {/* Chat Area */}
            <ChatArea />

            {/* Input Bar */}
            <InputBar />
          </div>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
}