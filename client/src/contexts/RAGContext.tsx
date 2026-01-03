import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export interface SearchResult {
  id: string;
  content: string;
  snippet: string;
  score: number;
  pageNumber: number | null;
  document: {
    id: string;
    filename: string;
    supplier: string | null;
  };
  // Enhanced product metadata from vector DB
  productType?: string;
  material?: string;
  threadType?: string;
  headType?: string;
  standard?: string;
  productName?: string;
  dimensions?: string;
  finish?: string;
  priceInfo?: string;
  packagingUnit?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    chunkId: string;
    documentName: string;
    pageNumber: number;
    excerpt: string;
  }>;
  isStreaming?: boolean;
}

export interface Document {
  id: string;
  filename: string;
  original_name: string;
  supplier: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  page_count: number | null;
  file_size_bytes: number | null;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
}

export interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  processingCount: number;
  completedCount: number;
}

interface RAGContextType {
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Chat state
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  isChatLoading: boolean;
  chatSessionId: string | null;
  setChatOpen: (open: boolean) => void;
  sendMessage: (message: string, language?: 'en' | 'es') => Promise<void>;
  clearChat: () => void;

  // Admin state
  documents: Document[];
  stats: RAGStats | null;
  isLoadingDocuments: boolean;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, supplier?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  reindexDocument: (id: string) => Promise<void>;
}

const RAGContext = createContext<RAGContextType | undefined>(undefined);

export function RAGProvider({ children }: { children: ReactNode }) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Admin state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Search functions
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, []);

  // Chat functions
  const sendMessage = useCallback(async (message: string, language: 'en' | 'es' = 'en') => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setChatMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: chatSessionId,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat failed');
      }

      // Get session ID from header
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId) {
        setChatSessionId(newSessionId);
      }

      // Get sources from header (base64 encoded to avoid header character issues)
      const sourcesHeader = response.headers.get('X-Sources');
      let sources: Array<{ chunkId: string; documentName: string; pageNumber: number; excerpt: string }> = [];
      if (sourcesHeader) {
        try {
          // Decode base64 and parse JSON
          const decoded = atob(sourcesHeader);
          sources = JSON.parse(decoded);
        } catch (e) {
          // Fallback: try parsing as plain JSON (backwards compatibility)
          try {
            sources = JSON.parse(sourcesHeader);
          } catch {
            console.error('Failed to parse sources header');
          }
        }
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        }

        // Finalize the message
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent, isStreaming: false, sources }
              : msg
          )
        );
      }
    } catch (error) {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsChatLoading(false);
    }
  }, [chatSessionId]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    setChatSessionId(null);
  }, []);

  // Admin functions
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocuments(true);

    try {
      const response = await fetch('/api/admin/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, supplier?: string) => {
    // Use client-side upload to bypass Vercel's 4.5MB serverless function limit
    const { upload } = await import('@vercel/blob/client');

    // Upload directly to Vercel Blob from the browser
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload-token',
    });

    // Now process the document with just the blob URL
    const response = await fetch('/api/admin/process-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blobUrl: blob.url,
        filename: file.name,
        fileSize: file.size,
        supplier: supplier || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Processing failed');
    }

    // Refresh document list
    await fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/document?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    // Refresh document list
    await fetchDocuments();
  }, [fetchDocuments]);

  const reindexDocument = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/document?id=${id}&action=reindex`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Reindex failed');
    }

    // Refresh document list
    await fetchDocuments();
  }, [fetchDocuments]);

  return (
    <RAGContext.Provider
      value={{
        // Search
        searchQuery,
        searchResults,
        isSearching,
        searchError,
        setSearchQuery,
        performSearch,
        clearSearch,
        // Chat
        chatMessages,
        isChatOpen,
        isChatLoading,
        chatSessionId,
        setChatOpen,
        sendMessage,
        clearChat,
        // Admin
        documents,
        stats,
        isLoadingDocuments,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        reindexDocument,
      }}
    >
      {children}
    </RAGContext.Provider>
  );
}

export function useRAG() {
  const context = useContext(RAGContext);
  if (context === undefined) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
}
