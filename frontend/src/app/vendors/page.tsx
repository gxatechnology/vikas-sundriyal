'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Building, Plus, X, Star, FileText } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  type: string;
  contactPerson: string | null;
  mobile: string | null;
  email: string | null;
  contractDetails: string | null;
  performanceScore: number;
}

export default function VendorsRegistryPage() {
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'Transport',
    contactPerson: '',
    mobile: '',
    email: '',
    contractDetails: '',
    performanceScore: '5.0',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      setVendors(res.data.vendors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vendors', {
        ...form,
        performanceScore: parseFloat(form.performanceScore),
      });
      setShowModal(false);
      setForm({
        name: '',
        type: 'Transport',
        contactPerson: '',
        mobile: '',
        email: '',
        contractDetails: '',
        performanceScore: '5.0',
      });
      fetchVendors();
    } catch (err) {
      alert('Failed to register vendor profile');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Maintain transport vendors, shipping lines, airlines, CHA brokers, and warehouse contracts.
          </p>
        </div>
        {['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} /> Register Vendor
          </button>
        )}
      </div>

      {/* Grid of vendors */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20">
          <Building className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-sm text-slate-500">No vendors registered yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded font-bold uppercase text-slate-500 tracking-wider">
                      {v.type}
                    </span>
                    <h3 className="font-bold text-sm mt-1 text-slate-900 dark:text-white">{v.name}</h3>
                  </div>

                  {/* Rating */}
                  <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg">
                    <Star size={12} fill="#f59e0b" /> {v.performanceScore.toFixed(1)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Contact: {v.contactPerson || '—'}</p>
                  <p>Email: {v.email || '—'}</p>
                  <p>Mobile: {v.mobile || '—'}</p>
                </div>
              </div>

              {v.contractDetails && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-start gap-1">
                  <FileText size={12} className="shrink-0 mt-0.5 text-slate-400" />
                  <p className="line-clamp-2">{v.contractDetails}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Register Vendor Partner</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Vendor Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHL Ocean Freight"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Vendor Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="Transport">Transport fleet</option>
                  <option value="Shipping Line">Shipping Line carrier</option>
                  <option value="Airline">Airline Cargo carrier</option>
                  <option value="CHA">Custom House Agent (CHA)</option>
                  <option value="Warehouse">Warehouse contract partner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Representative Name"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Contact Mobile</label>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Perf Score (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={form.performanceScore}
                    onChange={(e) => setForm({ ...form, performanceScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Contract / Scope details</label>
                <textarea
                  placeholder="Terms of SLA scope..."
                  value={form.contractDetails}
                  onChange={(e) => setForm({ ...form, contractDetails: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Register Vendor Partner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
