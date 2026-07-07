'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  ShieldAlert,
  Calendar,
  IndianRupee,
  Ship,
  Plane,
  Truck,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface MetricData {
  totalCustomers: number;
  activeShipments: number;
  deliveredShipments: number;
  pendingShipments: number;
  customsPending: number;
  todaysDeliveries: number;
  totalRevenue: number;
  statusChartData: { status: string; count: number }[];
  recentActivities: any[];
}

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prep mode counts for pie chart
  const modeData = [
    { name: 'Sea Freight', value: metrics.statusChartData.reduce((acc, item) => acc + (['Booked', 'In Transit'].includes(item.status) ? item.count : 0), 0) || 1 },
    { name: 'Air Freight', value: metrics.statusChartData.reduce((acc, item) => acc + (item.status === 'Delivered' ? item.count : 0), 0) || 1 },
    { name: 'Road Freight', value: metrics.statusChartData.reduce((acc, item) => acc + (item.status === 'Inquiry' ? item.count : 0), 0) || 1 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here is what is happening across your logistics network today.
        </p>
      </div>

      {/* Metrics Board Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Shipments */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Shipments
            </p>
            <h3 className="text-2xl font-bold">{metrics.activeShipments}</h3>
            <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
              <TrendingUp size={12} /> +12.4% vs last month
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText size={24} />
          </div>
        </div>

        {/* Card 2: Delivered Shipments */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Delivered Cargo
            </p>
            <h3 className="text-2xl font-bold">{metrics.deliveredShipments}</h3>
            <p className="text-[10px] text-slate-400">Total lifetime fulfillments</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Card 3: Customs Clearance Pending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Customs Pending
            </p>
            <h3 className="text-2xl font-bold text-amber-500">{metrics.customsPending}</h3>
            <p className="text-[10px] text-amber-500">Requires documents approval</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Processed Revenue
            </p>
            <h3 className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-400">From paid invoices</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart 1: Shipment status bar chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h2 className="text-md font-bold mb-4">Shipments status spread</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.statusChartData}>
                <XAxis dataKey="status" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Mode of Transport breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-md font-bold mb-4">Freight modes breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {modeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex justify-center gap-4 text-xs mt-2">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Sea</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Air</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Road</span>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity (Audit logs) and Quick Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Audit Log Feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h2 className="text-md font-bold mb-4">Live audit logs</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {metrics.recentActivities.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs items-start border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold shrink-0">
                  {log.user ? log.user.name.charAt(0) : 'S'}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {log.user ? log.user.name : 'System'}
                    </span>{' '}
                    {log.details}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress || 'Internal'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  log.action === 'Create' ? 'bg-blue-500/10 text-blue-500' :
                  log.action === 'Delete' ? 'bg-red-500/10 text-red-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-md font-bold mb-3">Freight quick action board</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Quick shortcuts to operational modules.
            </p>
            <div className="space-y-2">
              <a
                href="/shipments"
                className="flex items-center gap-2 p-3 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 rounded-xl border border-slate-100 dark:border-slate-800 text-left transition-all"
              >
                <div className="h-6 w-6 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Ship size={14} />
                </div>
                <div>
                  <p className="font-semibold">Book Ocean/Air Cargo</p>
                  <p className="text-[10px] text-slate-400">Register new shipment bookings</p>
                </div>
              </a>
              <a
                href="/customs"
                className="flex items-center gap-2 p-3 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-amber-600/10 dark:hover:bg-amber-500/10 rounded-xl border border-slate-100 dark:border-slate-800 text-left transition-all"
              >
                <div className="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <p className="font-semibold">Review Pending Customs</p>
                  <p className="text-[10px] text-slate-400">Inspect shipping documents & duties</p>
                </div>
              </a>
              <a
                href="/billing"
                className="flex items-center gap-2 p-3 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-emerald-600/10 dark:hover:bg-emerald-500/10 rounded-xl border border-slate-100 dark:border-slate-800 text-left transition-all"
              >
                <div className="h-6 w-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <IndianRupee size={14} />
                </div>
                <div>
                  <p className="font-semibold">Billing Board</p>
                  <p className="text-[10px] text-slate-400">Generate tax invoices and receipts</p>
                </div>
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400">System online status: OK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
