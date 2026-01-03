import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import {
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  Home,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  UploadCloud,
  Bot,
  Settings,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRAG } from '@/contexts/RAGContext';
import { toast } from 'sonner';

interface AISettings {
  temperature: number;
  maxTokens: number;
  contextChunks: number;
  model: string;
}

const DEFAULT_AI_SETTINGS: AISettings = {
  temperature: 0.7,
  maxTokens: 1500,
  contextChunks: 8,
  model: 'gpt-4o-mini',
};

const SUPPLIERS = ['REYHER', 'KLIMAS', 'WÜRTH', 'Other'];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Indexed
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="default" className="bg-inox-orange">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Admin() {
  const {
    documents,
    stats,
    isLoadingDocuments,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    reindexDocument,
  } = useRAG();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  // AI Settings state
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch AI Settings
  const fetchAISettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const response = await fetch('/api/admin/ai-settings');
      if (response.ok) {
        const settings = await response.json();
        setAiSettings(settings);
      }
    } catch (error) {
      console.error('Failed to fetch AI settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  // Save AI Settings
  const saveAISettings = useCallback(async () => {
    setIsSavingSettings(true);
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });
      if (response.ok) {
        toast.success('AI settings saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save AI settings');
    } finally {
      setIsSavingSettings(false);
    }
  }, [aiSettings]);

  useEffect(() => {
    fetchDocuments();
    fetchAISettings();
    // Refresh every 10 seconds to check processing status
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, [fetchDocuments, fetchAISettings]);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        await uploadDocument(file, selectedSupplier || undefined);
        setUploadProgress(100);
        toast.success('Document uploaded successfully! Processing started.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedSupplier('');
      }
    },
    [uploadDocument, selectedSupplier]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDelete = useCallback(
    async (id: string, filename: string) => {
      try {
        await deleteDocument(id);
        toast.success(`Deleted ${filename}`);
      } catch (error) {
        toast.error('Failed to delete document');
      }
    },
    [deleteDocument]
  );

  const handleReindex = useCallback(
    async (id: string, filename: string) => {
      try {
        await reindexDocument(id);
        toast.success(`Reindexing ${filename}...`);
      } catch (error) {
        toast.error('Failed to reindex document');
      }
    },
    [reindexDocument]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Document Management</h1>
              <p className="text-sm text-slate-500">Upload and manage PDF catalogs for RAG</p>
            </div>
          </div>
          <Button onClick={() => fetchDocuments()} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingDocuments ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.totalDocuments ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Indexed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.completedCount ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-inox-orange">
                {stats?.processingCount ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Vector Chunks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-inox-teal">
                {stats?.totalChunks ?? '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-inox-teal" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={aiSettings.model}
                    onValueChange={(value) => setAiSettings({ ...aiSettings, model: value })}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast, Cost-effective)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Best quality)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Choose the AI model for responses</p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label>Temperature: {aiSettings.temperature.toFixed(1)}</Label>
                  <Slider
                    value={[aiSettings.temperature]}
                    onValueChange={([value]) => setAiSettings({ ...aiSettings, temperature: value })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Lower = more focused, Higher = more creative
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Response Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) || 1500 })}
                    min={100}
                    max={4000}
                  />
                  <p className="text-xs text-slate-500">Maximum length of AI responses (100-4000)</p>
                </div>

                {/* Context Chunks */}
                <div className="space-y-2">
                  <Label htmlFor="contextChunks">Context Chunks</Label>
                  <Input
                    id="contextChunks"
                    type="number"
                    value={aiSettings.contextChunks}
                    onChange={(e) => setAiSettings({ ...aiSettings, contextChunks: parseInt(e.target.value) || 8 })}
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-slate-500">
                    Number of catalog sections to include (1-20)
                  </p>
                </div>

                {/* Save Button */}
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={saveAISettings} disabled={isSavingSettings}>
                    {isSavingSettings ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIERS.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-inox-teal bg-inox-teal/5'
                  : 'border-slate-300 hover:border-inox-teal'
              } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 font-medium mb-1">
                Drop PDF files here or click to upload
              </p>
              <p className="text-slate-400 text-sm">Maximum file size: 50MB</p>
            </div>

            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-slate-500 mt-2 text-center">Uploading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Indexed Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments && documents.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-inox-teal" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No documents uploaded yet</p>
                <p className="text-slate-400 text-sm">
                  Upload PDF catalogs to start building your knowledge base
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <span className="font-medium truncate max-w-xs">
                            {doc.original_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.supplier ? (
                          <Badge variant="outline">{doc.supplier}</Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell>{doc.page_count ?? '-'}</TableCell>
                      <TableCell>{formatFileSize(doc.file_size_bytes)}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReindex(doc.id, doc.original_name)}
                            disabled={doc.status === 'processing'}
                            title="Reindex"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                disabled={doc.status === 'processing'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.original_name}"? This will
                                  remove all indexed data and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(doc.id, doc.original_name)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
