import { User, Bot, Copy, Check, Sparkles, Play, Pause, Download, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasCode?: boolean;
  imageUrl?: string;
  isStreaming?: boolean;
  type?: 'text' | 'sticker' | 'voice' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  audioBlob?: Blob;
  transcript?: string;
}

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // GSAP animation for the bubble entrance
    if (bubbleRef.current) {
      gsap.fromTo(bubbleRef.current, 
        { 
          opacity: 0, 
          y: 30,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );
    }

    // Animate content typing effect for assistant messages
    if (!isUser && contentRef.current && !message.isStreaming) {
      const content = contentRef.current;
      const text = content.textContent || '';
      content.textContent = '';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          content.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 20);
        }
      };
      
      setTimeout(typeWriter, 300);
    }
  }, []);

  const handlePlayAudio = () => {
    if (message.audioBlob && audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    
    // GSAP animation for copy feedback
    gsap.to(`#copy-btn-${id}`, {
      scale: 1.2,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
    
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Enhanced markdown parsing with better formatting
  const renderContent = () => {
    // Handle different message types
    if (message.type === 'sticker') {
      return (
        <div className="text-6xl text-center py-4">
          {message.content}
        </div>
      );
    }

    if (message.type === 'voice') {
      return (
        <div className="space-y-3">
          {/* Voice message controls */}
          <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <motion.button
              onClick={handlePlayAudio}
              className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlayingAudio ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </motion.button>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                🎤 Voice Message
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Click to play
              </div>
            </div>
          </div>
          
          {/* Transcript if available */}
          {message.transcript && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transcript:</div>
              <div className="text-sm text-slate-800 dark:text-slate-200">{message.transcript}</div>
            </div>
          )}
          
          {/* Hidden audio element */}
          {message.audioBlob && (
            <audio
              ref={audioRef}
              src={URL.createObjectURL(message.audioBlob)}
              onEnded={() => setIsPlayingAudio(false)}
              style={{ display: 'none' }}
            />
          )}
        </div>
      );
    }

    if (message.type === 'file') {
      return (
        <div className="space-y-3">
          {/* File preview */}
          {message.fileUrl && message.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
            <div className="relative">
              <img
                src={message.fileUrl}
                alt={message.fileName}
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '300px' }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  📎 {message.fileName}
                </div>
                {message.fileSize && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {formatFileSize(message.fileSize)}
                  </div>
                )}
              </div>
              {message.fileUrl && (
                <motion.a
                  href={message.fileUrl}
                  download={message.fileName}
                  className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="h-4 w-4" />
                </motion.a>
              )}
            </div>
          )}
        </div>
      );
    }

    if (!message.hasCode && !message.imageUrl) {
      return (
        <div className="whitespace-pre-wrap break-words" ref={contentRef}>
          {formatText(message.content)}
          {message.isStreaming && (
            <motion.span 
              className="inline-block w-2 h-5 bg-current ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▋
            </motion.span>
          )}
        </div>
      );
    }

    // Enhanced code block parsing
    const parts = message.content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```$/);
        if (codeMatch) {
          const language = codeMatch[1] || 'text';
          const code = codeMatch[2] || '';
          const codeId = `${message.id}-${index}`;

          return (
            <motion.div 
              key={index} 
              className="my-4 overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between bg-slate-800 px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                    {language}
                  </span>
                </div>
                <motion.button
                  id={`copy-btn-${codeId}`}
                  onClick={() => handleCopyCode(code, codeId)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy code</span>
                    </>
                  )}
                </motion.button>
              </div>
              <pre className="overflow-x-auto p-4 text-sm">
                <code className="text-slate-100 font-mono leading-relaxed">{code}</code>
              </pre>
            </motion.div>
          );
        }
      }

      return (
        <div key={index} className="whitespace-pre-wrap break-words">
          {formatText(part)}
          {index === parts.length - 1 && message.isStreaming && (
            <motion.span 
              className="inline-block w-2 h-5 bg-current ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▋
            </motion.span>
          )}
        </div>
      );
    });
  };

  // Enhanced text formatting with better markdown support
  const formatText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle headers with enhanced styling
      if (line.startsWith('# ')) {
        return (
          <motion.h1 
            key={lineIndex} 
            className="text-2xl font-bold mt-6 mb-3 text-primary flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.05 }}
          >
            <Sparkles className="h-5 w-5" />
            {line.slice(2)}
          </motion.h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <motion.h2 
            key={lineIndex} 
            className="text-xl font-bold mt-5 mb-2 text-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.05 }}
          >
            {line.slice(3)}
          </motion.h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <motion.h3 
            key={lineIndex} 
            className="text-lg font-semibold mt-4 mb-2 text-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.05 }}
          >
            {line.slice(4)}
          </motion.h3>
        );
      }
      
      // Handle bullet points with enhanced styling
      if (line.match(/^[\s]*[-*+]\s/)) {
        const content = line.replace(/^[\s]*[-*+]\s/, '');
        return (
          <motion.li 
            key={lineIndex} 
            className="ml-6 mb-2 list-none relative before:content-['✨'] before:absolute before:-left-6 before:text-primary"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.05 }}
          >
            {formatInlineText(content)}
          </motion.li>
        );
      }
      
      // Handle numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        const content = line.replace(/^[\s]*\d+\.\s/, '');
        const number = line.match(/^[\s]*(\d+)\./)?.[1];
        return (
          <motion.li 
            key={lineIndex} 
            className="ml-8 mb-2 list-none relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: lineIndex * 0.05 }}
          >
            <span className="absolute -left-8 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
              {number}
            </span>
            {formatInlineText(content)}
          </motion.li>
        );
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }
      
      // Regular paragraphs with enhanced styling
      return (
        <motion.p 
          key={lineIndex} 
          className="mb-3 last:mb-0 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: lineIndex * 0.05 }}
        >
          {formatInlineText(line)}
        </motion.p>
      );
    });
  };

  // Enhanced inline text formatting
  const formatInlineText = (text: string) => {
    // Handle inline code with better styling
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono border border-primary/20">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Handle bold text
      let formattedPart = part.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');
      
      // Handle italic text
      formattedPart = formattedPart.replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>');
      
      if (formattedPart !== part) {
        return <span key={index} dangerouslySetInnerHTML={{ __html: formattedPart }} />;
      }
      
      return part;
    });
  };

  return (
    <motion.div
      ref={bubbleRef}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Enhanced Avatar */}
      <motion.div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        }`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot className="h-5 w-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Message Content */}
      <div className={`flex-1 ${isUser ? 'max-w-[80%]' : 'max-w-full'}`}>
        <motion.div
          className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-4'
              : 'bg-gradient-to-br from-slate-50 to-white text-slate-800 border border-slate-200 mr-4 dark:from-slate-800 dark:to-slate-900 dark:text-slate-100 dark:border-slate-700'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderContent()}
          </div>

          {/* Image if present */}
          {message.imageUrl && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ImageWithFallback
                src={message.imageUrl}
                alt="Message attachment"
                className="rounded-xl shadow-md"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Timestamp */}
        <motion.div
          className={`mt-2 text-xs text-muted-foreground flex items-center gap-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && (
            <motion.span
              className="text-emerald-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
