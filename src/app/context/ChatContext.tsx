import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { groqService, ChatMessage } from '@/services/groq';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
  isStreaming?: boolean;
  type?: 'text' | 'sticker' | 'voice' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  audioBlob?: Blob;
  transcript?: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendSticker: (sticker: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob, transcript?: string) => Promise<void>;
  sendFileMessage: (file: File, preview?: string) => Promise<void>;
  clearMessages: () => void;
  chatTitle: string;
  chatHistory: ChatHistory[];
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Generate chat title from first message
  const generateChatTitle = (firstMessage: string) => {
    const words = firstMessage.trim().split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('mr_s_agent_chat_history');
      if (saved) {
        const history = JSON.parse(saved);
        setChatHistory(history.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = (history: ChatHistory[]) => {
    try {
      localStorage.setItem('mr_s_agent_chat_history', JSON.stringify(history));
      setChatHistory(history);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Save current chat to history
  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const chatData: ChatHistory = {
      id: currentChatId || Date.now().toString(),
      title: chatTitle,
      messages: messages,
      createdAt: currentChatId ? chatHistory.find(c => c.id === currentChatId)?.createdAt || new Date() : new Date(),
      updatedAt: new Date()
    };

    const updatedHistory = currentChatId 
      ? chatHistory.map(chat => chat.id === currentChatId ? chatData : chat)
      : [chatData, ...chatHistory.slice(0, 49)]; // Keep only 50 most recent chats

    saveChatHistory(updatedHistory);
    
    if (!currentChatId) {
      setCurrentChatId(chatData.id);
    }
  };

  // Load chat from history
  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setChatTitle(chat.title);
      setCurrentChatId(chatId);
    }
  };

  // Delete chat from history
  const deleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    saveChatHistory(updatedHistory);
    
    if (currentChatId === chatId) {
      clearMessages();
    }
  };

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 1000); // Debounce saving

      return () => clearTimeout(timeoutId);
    }
  }, [messages, chatTitle]);

  const sendSticker = async (sticker: string) => {
    const stickerMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sticker,
      timestamp: new Date(),
      type: 'sticker',
    };

    setMessages(prev => {
      const newMessages = [...prev, stickerMessage];
      
      // Set chat title from first user message
      if (prev.length === 0) {
        const title = `Sticker conversation ${sticker}`;
        setChatTitle(title);
      }
      
      return newMessages;
    });

    // Send a fun response to stickers
    const responses = [
      `Nice sticker! ${sticker} I love the energy! 😊 What can I help you with today?`,
      `${sticker} That's a great way to start our conversation! How can I assist you? ✨`,
      `I see you're feeling ${sticker}! What would you like to explore together? 🚀`,
      `${sticker} Love it! Ready to dive into some interesting topics? 💡`,
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const sendVoiceMessage = async (audioBlob: Blob, transcript?: string) => {
    const voiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript || '🎤 Voice message',
      timestamp: new Date(),
      type: 'voice',
      audioBlob: audioBlob,
      transcript: transcript,
    };

    setMessages(prev => {
      const newMessages = [...prev, voiceMessage];
      
      // Set chat title from first user message
      if (prev.length === 0) {
        const title = transcript ? generateChatTitle(transcript) : 'Voice conversation';
        setChatTitle(title);
      }
      
      return newMessages;
    });

    // If we have a transcript, send it to the AI
    if (transcript && transcript.trim()) {
      await sendMessage(transcript);
    } else {
      // Send a response acknowledging the voice message
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🎤 I received your voice message! While I can't process audio directly yet, if you could type your question, I'd be happy to help! 😊`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  const sendFileMessage = async (file: File, preview?: string) => {
    const fileUrl = preview || URL.createObjectURL(file);
    
    const fileMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Shared a file: ${file.name}`,
      timestamp: new Date(),
      type: 'file',
      fileUrl: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    };

    setMessages(prev => {
      const newMessages = [...prev, fileMessage];
      
      // Set chat title from first user message
      if (prev.length === 0) {
        const title = `File: ${file.name}`;
        setChatTitle(title);
      }
      
      return newMessages;
    });

    // Send a response about the file
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📎 I can see you've shared "${file.name}"! While I can't directly process files yet, I can help you with questions about the content if you describe what you need assistance with! 🤔✨`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      
      // Set chat title from first user message
      if (prev.length === 0) {
        const title = generateChatTitle(content);
        setChatTitle(title);
      }
      
      return newMessages;
    });
    
    setIsTyping(true);

    try {
      // Prepare messages for API with improved system prompt that includes emojis
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are Mr S Agent, a highly knowledgeable

🎯 **Response Style:**
- Be comprehensive yet clear - provide detailed explanations with practical examples
- Use emojis naturally to enhance communication (like ✅ for solutions, 🔧 for fixes, 💡 for tips)
- Structure responses with clear headings, bullet points, and step-by-step instructions
- Always provide actionable information and next steps

💻 **For Programming Questions:**
- Give complete, working code examples with proper syntax highlighting
- Explain the "why" behind solutions, not just the "how"
- Include multiple approaches when relevant (e.g., "Here are 3 ways to solve this...")
- Add helpful comments in code and explain what each part does
- Suggest best practices and potential improvements

📚 **For Learning & Explanations:**
- Break complex topics into digestible sections with clear headings
- Use analogies and real-world examples to illustrate concepts
- Provide both beginner-friendl
- Include relevant resources or next learning steps

✍️ **For Creative & Writing Tasks:**
- Offer multiple creative approaches or ideas
- Provide structured frameworks and templates
- Give specific, actionable suggestions with examples
- Be encouraging and constructive in feedback

🔍 **For Analysis & Research:**
- Present information in organized, easy-to-scan formats
- Use comparison tables, pros/cons lists, and bullet points
- Provide evidence-based insights with clear reasoning
- Suggest follow-up questions or areas to explore

**Formatting Guidelines:**
- Use markdown headers (##, ###) to organize content
- Create bullet points with emojis for visual appeal
- Include code blocks with proper language specification
- Add emphasis with **bold** for important points
- Use > blockquotes for key insights or tips

Always aim to be thorough, practical, and genuinely helpful - like having a knowledgeable colleague who takes time to explain things properly! 😊`
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content
        }
      ];

      // Create assistant message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Stream the response
      await groqService.streamMessage(apiMessages, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: msg.content + chunk,
                hasCode: msg.content.includes('```') || chunk.includes('```')
              }
            : msg
        ));
      });

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);
      
      // Add more specific error message with emoji
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `😔 I apologize, but Mr S Agent encountered an error while processing your request: ${error.message || 'Unknown error occurred'}. Please try again! 🔄`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setChatTitle('New Chat');
    setCurrentChatId(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isTyping,
      sendMessage,
      sendSticker,
      sendVoiceMessage,
      sendFileMessage,
      clearMessages,
      chatTitle,
      chatHistory,
      loadChat,
      deleteChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}