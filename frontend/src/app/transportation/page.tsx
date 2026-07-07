'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2, Truck, Calendar, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function TransportationPage() {
  const [transports, setTransports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transportation');
      setTransports(res.data.transportList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Domestic Transportation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor dispatch operations, vehicle assignments, driver routing logs, and fuel costs.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : transports.length === 0 ? (
          <div className="text-center py-20">
            <Truck className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No transportation logs registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Shipment ID</th>
                  <th className="p-4 font-bold">Client / Company</th>
                  <th className="p-4 font-bold">Vehicle Number</th>
                  <th className="p-4 font-bold">Driver Name</th>
                  <th className="p-4 font-bold">Driver Contact</th>
                  <th className="p-4 font-bold">Route details</th>
                  <th className="p-4 font-bold">Fuel costs</th>
                  <th className="p-4 font-bold text-center">Dispatch Status</th>
                  <th className="p-4 font-bold text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transports.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {t.shipment.shipmentNumber}
                    </td>
                    <td className="p-4 font-semibold">{t.shipment.customer.companyName}</td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {t.vehicleNumber || '—'}
                    </td>
                    <td className="p-4 font-medium">{t.driverName || '—'}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{t.driverContact || '—'}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {t.routeDetails || '—'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      ₹{t.fuelCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          t.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : t.status === 'In Transit'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/shipments/${t.shipmentId}`}
                        className="inline-flex px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs font-semibold"
                      >
                        Inspect
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
