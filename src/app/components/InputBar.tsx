import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { useChat } from '@/app/context/ChatContext';
import { StickerPicker } from '@/app/components/StickerPicker';
import { VoiceRecorder } from '@/app/components/VoiceRecorder';
import { FileAttachment } from '@/app/components/FileAttachment';

export function InputBar() {
  const { sendMessage, sendSticker, sendVoiceMessage, sendFileMessage, isTyping } = useChat();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStickerSelect = async (sticker: string) => {
    try {
      await sendSticker(sticker);
      setShowStickerPicker(false);
    } catch (err) {
      setError('Failed to send sticker. Please try again.');
      console.error('Send sticker error:', err);
    }
  };

  const handleVoiceSend = async (audioBlob: Blob, transcript?: string) => {
    try {
      await sendVoiceMessage(audioBlob, transcript);
      setShowVoiceRecorder(false);
    } catch (err) {
      setError('Failed to send voice message. Please try again.');
      console.error('Send voice error:', err);
    }
  };

  const handleFileSelect = async (file: File, preview?: string) => {
    try {
      await sendFileMessage(file, preview);
      setShowFileAttachment(false);
    } catch (err) {
      setError('Failed to send file. Please try again.');
      console.error('Send file error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 4000) {
      setError('Message is too long (max 4000 characters)');
      return;
    }

    try {
      await sendMessage(message);
      setMessage('');
      setError('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const canSend = message.trim().length > 0 && message.length <= 4000 && !isTyping;

  return (
    <div className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Input Container */}
          <div
            className={`flex items-end gap-2 rounded-2xl border bg-background px-4 py-3 transition-all ${
              isFocused
                ? 'border-ring shadow-sm ring-2 ring-ring/20'
                : error
                ? 'border-destructive'
                : 'border-border'
            }`}
          >
            {/* Action Buttons - Left */}
            <div className="flex items-center gap-1 pb-1">
              <button
                type="button"
                onClick={() => setShowFileAttachment(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Message Mr S Agent..."
              rows={1}
              disabled={isTyping}
              className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{ lineHeight: '1.5' }}
            />

            {/* Action Buttons - Right */}
            <div className="flex items-center gap-1 pb-1">
              {!message.trim() && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowStickerPicker(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVoiceRecorder(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSend}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  canSend
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'cursor-not-allowed bg-muted text-muted-foreground'
                }`}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Character Count */}
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {message.length > 0 && `${message.length} / 4000`}
          </div>
        </form>

        {/* Interactive Components */}
        <StickerPicker
          isOpen={showStickerPicker}
          onClose={() => setShowStickerPicker(false)}
          onStickerSelect={handleStickerSelect}
        />
        
        <VoiceRecorder
          isOpen={showVoiceRecorder}
          onClose={() => setShowVoiceRecorder(false)}
          onSendVoice={handleVoiceSend}
        />
        
        <FileAttachment
          isOpen={showFileAttachment}
          onClose={() => setShowFileAttachment(false)}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
}