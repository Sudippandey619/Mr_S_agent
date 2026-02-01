import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div 
      className="flex gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Enhanced Avatar */}
      <motion.div 
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Bot className="h-5 w-5" />
      </motion.div>

      {/* Enhanced Typing Animation */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 px-5 py-4 shadow-lg backdrop-blur-sm dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <motion.span 
              className="text-sm text-muted-foreground font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Mr S Agent is thinking
            </motion.span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
