/**
 * Document Management Component - Therapist document verification system
 */
import { useState } from 'react';
import { FileText, Download, Check, X, Eye, Trash2, Clock, AlertTriangle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Document {
    id: string;
    therapist_id: string;
    document_type: 'license' | 'qualification' | 'id_proof';
    file_url: string;
    file_name: string;
    status: 'pending' | 'approved' | 'rejected';
    uploaded_at: string;
    verified_at?: string;
    notes?: string;
}

interface DocumentManagerProps {
    documents: Document[];
    therapistId: string;
    therapistName: string;
    onRefresh: () => void;
}

const typeLabels = { license: 'Professional License', qualification: 'Qualification Certificate', id_proof: 'ID Proof' };
const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

export function DocumentManager({ documents, therapistId, therapistName, onRefresh }: DocumentManagerProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleApprove = async (doc: Document) => {
        setLoading(doc.id);
        try {
            const autoDeleteDate = new Date();
            autoDeleteDate.setDate(autoDeleteDate.getDate() + 7);

            const { error } = await supabase.from('therapist_documents').update({
                status: 'approved',
                verified_at: new Date().toISOString(),
                auto_delete_at: autoDeleteDate.toISOString(),
            }).eq('id', doc.id);

            if (error) throw error;
            toast({ title: '✅ Document Approved', description: `${typeLabels[doc.document_type]} verified. Auto-deletes in 7 days.` });
            onRefresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (doc: Document, reason: string) => {
        setLoading(doc.id);
        try {
            const { error } = await supabase.from('therapist_documents').update({
                status: 'rejected',
                notes: reason,
                verified_at: new Date().toISOString(),
            }).eq('id', doc.id);

            if (error) throw error;
            toast({ title: '❌ Document Rejected', description: 'Therapist will be notified.' });
            onRefresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm('Delete this document permanently?')) return;
        setLoading(doc.id);
        try {
            const { error } = await supabase.from('therapist_documents').delete().eq('id', doc.id);
            if (error) throw error;
            toast({ title: 'Document Deleted' });
            onRefresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">Document Verification</h3>
                    <p className="text-sm text-gray-500">{therapistName}</p>
                </div>
                <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-sm rounded-full">{documents.length} documents</span>
            </div>

            <div className="divide-y">
                {documents.length === 0 ? (
                    <div className="p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No documents uploaded yet</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{typeLabels[doc.document_type]}</p>
                                        <p className="text-xs text-gray-500">{doc.file_name || 'document.pdf'}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[doc.status]}`}>
                                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url, '_blank')}>
                                        <Eye className="w-3 h-3 mr-1" /> View
                                    </Button>
                                    {doc.status === 'pending' && (
                                        <>
                                            <Button size="sm" onClick={() => handleApprove(doc)} disabled={loading === doc.id} className="bg-green-500 hover:bg-green-600 text-white">
                                                <Check className="w-3 h-3 mr-1" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleReject(doc, 'Invalid document')} disabled={loading === doc.id} className="text-red-600 border-red-200 hover:bg-red-50">
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    {doc.status === 'approved' && (
                                        <Button size="sm" variant="outline" onClick={() => handleDelete(doc)} disabled={loading === doc.id} className="text-gray-500">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreviewUrl(null)}>
                    <div className="bg-white rounded-xl p-4 max-w-4xl max-h-[90vh] overflow-auto">
                        <iframe src={previewUrl} className="w-full h-[80vh]" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentManager;
