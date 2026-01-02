import React from 'react';
import { Bot } from 'lucide-react';
import { useRAGChat } from '@/hooks/useRAGChat';
import { useLanguage } from '@/contexts/LanguageContext';

export function FloatingChatButton() {
  const { open, isOpen } = useRAGChat();
  const { language } = useLanguage();

  if (isOpen) return null;

  return (
    <button
      onClick={open}
      className="fixed bottom-6 right-20 bg-inox-teal text-white p-4 rounded-full shadow-lg hover:bg-inox-teal/90 hover:scale-110 hover:shadow-xl transition-all duration-300 z-40 group animate-in fade-in slide-in-from-bottom-10 delay-1000"
      aria-label={language === 'es' ? 'Abrir asistente IA' : 'Open AI Assistant'}
    >
      <Bot className="w-7 h-7" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-slate-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {language === 'es' ? 'Asistente IA' : 'AI Assistant'}
      </span>
      {/* Pulse indicator */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-inox-orange rounded-full animate-pulse" />
    </button>
  );
}
