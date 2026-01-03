import React from 'react';
import { Send, Trash2, Bot, User, FileText, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRAGChat } from '@/hooks/useRAGChat';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ChatMessage } from '@/contexts/RAGContext';

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const { language } = useLanguage();
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-inox-blue' : 'bg-inox-teal'
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-inox-blue text-white rounded-br-md'
              : 'bg-slate-100 text-slate-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Streaming indicator */}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-1" />
          )}

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                {language === 'es' ? 'Fuentes:' : 'Sources:'}
              </p>
              <div className="space-y-1">
                {message.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded px-2 py-1"
                  >
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{source.documentName}</span>
                    {source.pageNumber > 0 && (
                      <span className="text-slate-400">
                        {language === 'es' ? 'pág.' : 'p.'} {source.pageNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { language } = useLanguage();
  const {
    messages,
    isOpen,
    isLoading,
    inputValue,
    setInputValue,
    messagesEndRef,
    send,
    onKeyDown,
    close,
    clear,
  } = useRAGChat();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-inox-teal rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-base font-semibold">
                {language === 'es' ? 'Asistente de Productos' : 'Product Assistant'}
              </SheetTitle>
              <p className="text-xs text-slate-500">
                {language === 'es'
                  ? 'Pregunte sobre tornillos, tuercas y fijaciones'
                  : 'Ask about bolts, nuts, and fixings'}
              </p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                className="h-8 w-8"
                title={language === 'es' ? 'Limpiar chat' : 'Clear chat'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-inox-teal/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-inox-teal" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {language === 'es' ? '¡Hola! Soy tu asistente.' : "Hi! I'm your assistant."}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {language === 'es'
                  ? 'Puedo ayudarte a encontrar productos en nuestros catálogos, responder preguntas técnicas y más.'
                  : 'I can help you find products in our catalogs, answer technical questions, and more.'}
              </p>
              <div className="space-y-2 w-full max-w-xs">
                <p className="text-xs font-medium text-slate-400 uppercase">
                  {language === 'es' ? 'Ejemplos de preguntas' : 'Example questions'}
                </p>
                {[
                  language === 'es'
                    ? '¿Qué tornillos M10 tienen en acero inoxidable?'
                    : 'What M10 bolts do you have in stainless steel?',
                  language === 'es'
                    ? '¿Cuál es la mejor opción para ambientes costeros?'
                    : 'What is the best option for coastal environments?',
                  language === 'es'
                    ? 'Necesito especificaciones DIN para pernos hexagonales'
                    : 'I need DIN specifications for hex bolts',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(example);
                    }}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                language === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'
              }
              className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-inox-teal focus:border-transparent min-h-[48px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={send}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-inox-teal hover:bg-inox-teal/90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {language === 'es'
              ? 'Respuestas generadas por IA basadas en catálogos de productos'
              : 'AI-generated responses based on product catalogs'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
