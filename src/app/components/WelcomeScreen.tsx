import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const welcomeSteps = [
    {
      icon: <Sparkles className="h-16 w-16" />,
      title: "Welcome to Mr S Agent! ✨",
      subtitle: "Your intelligent AI assistant is starting up...",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Heart className="h-16 w-16" />,
      title: "Getting Ready! 💝",
      subtitle: "Preparing amazing features for you...",
      color: "from-pink-500 to-red-500"
    },
    {
      icon: <Star className="h-16 w-16" />,
      title: "Almost There! ⭐",
      subtitle: "Loading your personalized experience...",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Zap className="h-16 w-16" />,
      title: "Ready to Chat! ⚡",
      subtitle: "Let's create something amazing together!",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < welcomeSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setShowWelcome(false);
            setTimeout(onComplete, 500);
          }, 1500);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="flex flex-col items-center"
            >
              {/* Icon */}
              <motion.div
                className={`mb-8 p-6 rounded-full bg-gradient-to-br ${welcomeSteps[currentStep].color} text-white shadow-2xl`}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {welcomeSteps[currentStep].icon}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {welcomeSteps[currentStep].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl text-slate-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {welcomeSteps[currentStep].subtitle}
              </motion.p>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${welcomeSteps[currentStep].color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / welcomeSteps.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Step indicator */}
              <motion.p
                className="text-slate-400 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Step {currentStep + 1} of {welcomeSteps.length}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-20 text-6xl"
          animate={{ 
            rotate: 360,
            y: [0, -20, 0]
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          🚀
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-20 text-5xl"
          animate={{ 
            rotate: -360,
            x: [0, 20, 0]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          ✨
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-10 text-4xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          💫
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}