import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useChat } from '@/app/context/ChatContext';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { clearMessages, chatTitle, messages } = useChat();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowConfirm(true);
    } else {
      clearMessages();
    }
  };

  const confirmNewChat = () => {
    clearMessages();
    setShowConfirm(false);
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:h-16">
        {/* Left: Menu Icon */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Center: Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold truncate max-w-xs">
          {chatTitle === 'New Chat' ? 'Mr S Agent' : chatTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* New Chat Button (Mobile) */}
          <button
            onClick={handleNewChat}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* New Chat Button (Desktop) */}
          <button
            onClick={handleNewChat}
            className="hidden h-10 items-center gap-2 rounded-lg px-3 text-foreground transition-colors hover:bg-accent md:flex"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">New chat</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Start New Chat? 🆕</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This will clear your current conversation. This action cannot be undone. 🗑️
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewChat}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start New Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}