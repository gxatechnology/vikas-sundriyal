'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, FileText, Download, CheckCircle, XCircle } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  shipment: {
    shipmentNumber: string;
  } | null;
  uploadedBy: {
    name: string;
  };
}

export default function DocumentsVaultPage() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, status: string) => {
    try {
      await api.put(`/documents/${id}/approve`, { status });
      alert(`Document set to: ${status}`);
      fetchDocuments();
    } catch (err) {
      alert('Failed to update document status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents Vault</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review commercial invoices, packing lists, air waybills, and bills of lading.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Document Name</th>
                  <th className="p-4 font-bold">Document Type</th>
                  <th className="p-4 font-bold">Shipment ID</th>
                  <th className="p-4 font-bold">Uploaded By</th>
                  <th className="p-4 font-bold">Upload Date</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {doc.name}
                    </td>
                    <td className="p-4 font-medium text-slate-500">{doc.type}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold">
                      {doc.shipment?.shipmentNumber || 'General'}
                    </td>
                    <td className="p-4">{doc.uploadedBy.name}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : doc.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 font-semibold"
                      >
                        <Download size={12} /> Download
                      </a>
                      {doc.status === 'Pending' &&
                        ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'DOCUMENTATION_EXECUTIVE'].includes(
                          user?.role || ''
                        ) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApprove(doc.id, 'Approved')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprove(doc.id, 'Rejected')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
