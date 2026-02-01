import { Search, Plus, MessageSquare, X, User, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChat } from '@/app/context/ChatContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple user management
const getUser = () => {
  const user = localStorage.getItem('mr_s_agent_user');
  return user ? JSON.parse(user) : null;
};

const setUser = (userData: any) => {
  localStorage.setItem('mr_s_agent_user', JSON.stringify(userData));
};

const removeUser = () => {
  localStorage.removeItem('mr_s_agent_user');
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { clearMessages, messages, chatHistory, loadChat, deleteChat } = useChat();
  const [user, setUserState] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowConfirm(true);
    } else {
      clearMessages();
      onClose(); // Close sidebar on mobile after creating new chat
    }
  };

  const confirmNewChat = () => {
    clearMessages();
    setShowConfirm(false);
    onClose(); // Close sidebar on mobile after creating new chat
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name.trim() && loginForm.email.trim()) {
      const userData = {
        name: loginForm.name.trim(),
        email: loginForm.email.trim(),
        loginDate: new Date().toISOString()
      };
      setUser(userData);
      setUserState(userData);
      setShowLogin(false);
      setLoginForm({ name: '', email: '' });
    }
  };

  const handleLogout = () => {
    removeUser();
    setUserState(null);
    clearMessages(); // Clear chat history on logout
  };

  const handleLoadChat = (chatId: string) => {
    loadChat(chatId);
    onClose(); // Close sidebar on mobile after loading chat
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Delete this chat? This action cannot be undone.')) {
      deleteChat(chatId);
    }
  };

  // Group chats by date
  const groupChatsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filtered = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      today: filtered.filter(chat => chat.updatedAt >= today),
      yesterday: filtered.filter(chat => chat.updatedAt >= yesterday && chat.updatedAt < today),
      lastWeek: filtered.filter(chat => chat.updatedAt >= lastWeek && chat.updatedAt < yesterday),
      older: filtered.filter(chat => chat.updatedAt < lastWeek)
    };
  };

  const groupedChats = groupChatsByDate();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform border-r border-border bg-background transition-transform duration-300 md:static md:w-64 md:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'md:w-0 md:border-none' : ''}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border px-3 md:h-16">
            <button
              onClick={handleNewChat}
              className="flex h-10 flex-1 items-center gap-2 rounded-lg bg-primary px-3 text-primary-foreground transition-colors hover:bg-primary/90"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">New chat</span>
            </button>
            <button
              onClick={onClose}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Section */}
          <div className="border-b border-border p-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Login Form */}
          {showLogin && (
            <div className="border-b border-border p-3">
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {user ? (
                // Show actual chat history when logged in
                <>
                  {Object.entries(groupedChats).map(([period, chats]) => {
                    if (chats.length === 0) return null;
                    
                    const periodLabels = {
                      today: 'Today',
                      yesterday: 'Yesterday', 
                      lastWeek: 'Last 7 days',
                      older: 'Older'
                    };

                    return (
                      <div key={period} className="mb-4">
                        <h3 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">
                          {periodLabels[period as keyof typeof periodLabels]}
                        </h3>
                        <div className="space-y-1">
                          {chats.map((chat) => (
                            <div
                              key={chat.id}
                              className="group flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                            >
                              <button
                                onClick={() => handleLoadChat(chat.id)}
                                className="flex flex-1 items-center gap-3 min-w-0"
                              >
                                <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="flex-1 truncate">{chat.title}</span>
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-all hover:bg-destructive hover:text-destructive-foreground"
                                aria-label="Delete chat"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {chatHistory.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No chat history yet. Start a conversation! 💬
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Show message when not logged in
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in to save and access your chat history 📚
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Start New Chat? 🆕</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This will clear your current conversation. This action cannot be undone.
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