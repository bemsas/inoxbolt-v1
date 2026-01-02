import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, Loader2, UploadCloud } from 'lucide-react';

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    
    // Reset after delay
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        setCompany('');
      }, 300);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-inox-teal to-inox-blue h-2" />
        
        <div className="p-8">
          {success ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                {t('modal.success')}
              </h3>
              <p className="text-slate-500">
                Our sales team will contact you shortly with a quote.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader className="mb-6 text-left">
                <DialogTitle className="text-2xl font-display font-bold text-slate-900">
                  {t('modal.title')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-base mt-2">
                  {t('modal.desc')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder={t('modal.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder={t('modal.company_placeholder')}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20 outline-none transition-all"
                  />
                </div>

                {/* File Upload Area */}
                <div className="relative group">
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.xls,.xlsx,.csv"
                  />
                  <div className="w-full px-4 py-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 group-hover:border-inox-teal group-hover:bg-inox-teal/5 transition-all flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-inox-teal mb-2 transition-colors" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-inox-teal transition-colors">
                      {t('modal.upload_label')}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {t('modal.upload_help')}
                    </span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-inox-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('modal.submitting')}
                    </>
                  ) : (
                    t('modal.submit')
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
