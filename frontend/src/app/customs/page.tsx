'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2, ShieldCheck, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CustomsDeskPage() {
  const [customs, setCustoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustoms();
  }, []);

  const fetchCustoms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customs');
      setCustoms(res.data.customsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customs Clearance Desk</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor Bills of Entry, Shipping Bills, duty assessments, and official release approvals.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : customs.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No customs profiles registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Shipment ID</th>
                  <th className="p-4 font-bold">Client / Company</th>
                  <th className="p-4 font-bold">Customs Type</th>
                  <th className="p-4 font-bold">Bill of Entry (BOE)</th>
                  <th className="p-4 font-bold">Shipping Bill (SB)</th>
                  <th className="p-4 font-bold">Duty Assessed</th>
                  <th className="p-4 font-bold text-center">Customs Status</th>
                  <th className="p-4 font-bold text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {c.shipment.shipmentNumber}
                    </td>
                    <td className="p-4 font-medium">{c.shipment.customer.companyName}</td>
                    <td className="p-4 capitalize text-slate-500">{c.type.toLowerCase()} cargo</td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {c.billOfEntry || '—'}
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {c.shippingBill || '—'}
                    </td>
                    <td className="p-4 font-semibold">₹{c.dutyAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          c.status === 'Cleared'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/shipments/${c.shipmentId}`}
                        className="inline-flex px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs font-semibold"
                      >
                        Open Desk
                      </Link>
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
