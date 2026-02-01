import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from '@/app/components/ChatBubble';
import { TypingIndicator } from '@/app/components/TypingIndicator';
import { useChat } from '@/app/context/ChatContext';

const suggestionCards = [
  {
    emoji: '💻',
    title: 'Programming Help',
    description: 'Get code examples, debug issues, learn new technologies',
    prompt: 'I need help with programming. Can you show me a simple example of how to create a React component with state management?',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    emoji: '📚',
    title: 'Learning & Explanations',
    description: 'Understand complex topics with clear, detailed explanations',
    prompt: 'Can you explain how machine learning works in simple terms with examples?',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    emoji: '✍️',
    title: 'Writing & Creative',
    description: 'Help with writing, brainstorming, and creative projects',
    prompt: 'Help me brainstorm creative ideas for a blog post about sustainable living.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    emoji: '🔍',
    title: 'Analysis & Research',
    description: 'Analyze data, research topics, solve problems',
    prompt: 'Can you help me analyze the pros and cons of different web development frameworks?',
    gradient: 'from-orange-500 to-red-500'
  }
];

export function ChatArea() {
  const { messages, isTyping, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {messages.length === 0 ? (
          <motion.div 
            className="flex h-full items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center max-w-3xl">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "backOut" }}
              >
                <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  How can I help you today? 😊
                </h2>
                <p className="mb-12 text-xl text-muted-foreground leading-relaxed">
                  I'm <span className="font-semibold text-primary">Mr S Agent</span>, your AI assistant ready to help with 
                  <span className="text-blue-600"> coding</span>, 
                  <span className="text-purple-600"> learning</span>, 
                  <span className="text-emerald-600"> writing</span>, and 
                  <span className="text-orange-600"> research</span>! ✨
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {suggestionCards.map((card, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(card.prompt)}
                    className="group relative p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-xl text-left overflow-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.span 
                          className="text-3xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          {card.emoji}
                        </motion.span>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out" />
                  </motion.button>
                ))}
              </div>
              
              <motion.p 
                className="mt-12 text-muted-foreground flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span>Click on a card above or start typing below</span>
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  👇
                </motion.span>
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ChatBubble message={message} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
