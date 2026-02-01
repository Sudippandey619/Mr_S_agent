import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Play, Pause, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoice: (audioBlob: Blob, transcript?: string) => void;
}

export function VoiceRecorder({ isOpen, onClose, onSendVoice }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition
      if (recognitionRef.current) {
        setIsTranscribing(true);
        recognitionRef.current.start();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsTranscribing(false);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setTranscript('');
    setIsPlaying(false);
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, transcript);
      deleteRecording();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 text-center border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Voice Message 🎤
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Record your voice message for Mr S Agent
            </p>
          </div>

          {/* Recording Area */}
          <div className="p-6">
            {/* Microphone Visualization */}
            <div className="flex justify-center mb-6">
              <motion.div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}
                animate={isRecording ? { 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.7)',
                    '0 0 0 20px rgba(239, 68, 68, 0)',
                    '0 0 0 0 rgba(239, 68, 68, 0)'
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
              >
                {isRecording ? (
                  <MicOff className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </motion.div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatTime(recordingTime)}
              </div>
              {isTranscribing && (
                <div className="text-sm text-blue-500 mt-1">
                  🎯 Transcribing...
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Transcript:
                </div>
                <div className="text-slate-800 dark:text-slate-200">
                  {transcript}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isRecording && !audioBlob && (
                <motion.button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="h-5 w-5" />
                  Start Recording
                </motion.button>
              )}

              {isRecording && (
                <motion.button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="h-5 w-5" />
                  Stop Recording
                </motion.button>
              )}

              {audioBlob && (
                <div className="flex gap-3">
                  <motion.button
                    onClick={playAudio}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </motion.button>

                  <motion.button
                    onClick={deleteRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </motion.button>

                  <motion.button
                    onClick={sendVoiceMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </motion.button>
                </div>
              )}
            </div>

            {/* Hidden audio element for playback */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}