'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, LifeBuoy, Plus, X, Tag } from 'lucide-react';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function SupportTicketsPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Ticket Form State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets');
      setTickets(res.data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support/tickets', form);
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'Medium' });
      fetchTickets();
    } catch (err) {
      alert('Failed to raise ticket');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/support/tickets/${id}`, { status });
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets Desk</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Raise technical queries or cargo delay alerts directly to the operations help desk.
          </p>
        </div>
        {user?.role === 'CUSTOMER' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} /> Open Ticket
          </button>
        )}
      </div>

      {/* Grid of tickets */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <LifeBuoy className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-sm text-slate-500">No support tickets registered</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] rounded font-bold uppercase tracking-wider">
                      {t.ticketNumber}
                    </span>
                    <h3 className="font-bold text-sm mt-1">{t.title}</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        t.priority === 'Urgent' || t.priority === 'High'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        t.status === 'Open'
                          ? 'bg-blue-500/10 text-blue-500'
                          : t.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                  {t.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                <p>Raised by: {t.createdBy.name}</p>
                {t.status !== 'Resolved' && ['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'In Progress')}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-semibold text-slate-700 dark:text-slate-300"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Resolved')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Raise Support Ticket</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of query"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Urgency Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="Low">Low priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="High">High priority</option>
                  <option value="Urgent">Urgent alerts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Detailed Description</label>
                <textarea
                  required
                  placeholder="Explain details of the issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
