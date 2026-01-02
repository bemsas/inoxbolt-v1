import { useState, useCallback, useRef, useEffect } from 'react';
import { useRAG } from '@/contexts/RAGContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function useRAGChat() {
  const { language } = useLanguage();
  const {
    chatMessages,
    isChatOpen,
    isChatLoading,
    setChatOpen,
    sendMessage,
    clearChat,
  } = useRAG();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSend = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isChatLoading) return;

    setInputValue('');
    await sendMessage(trimmedValue, language as 'en' | 'es');
  }, [inputValue, isChatLoading, sendMessage, language]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleOpen = useCallback(() => {
    setChatOpen(true);
  }, [setChatOpen]);

  const handleClose = useCallback(() => {
    setChatOpen(false);
  }, [setChatOpen]);

  const handleClear = useCallback(() => {
    clearChat();
  }, [clearChat]);

  return {
    messages: chatMessages,
    isOpen: isChatOpen,
    isLoading: isChatLoading,
    inputValue,
    setInputValue,
    messagesEndRef,
    send: handleSend,
    onKeyDown: handleKeyDown,
    open: handleOpen,
    close: handleClose,
    clear: handleClear,
  };
}
