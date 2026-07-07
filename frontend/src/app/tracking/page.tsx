'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
  Search,
  Compass,
  MapPin,
  Calendar,
  CheckCircle,
  Truck,
  Ship,
  Plane,
  Loader2,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicTrackingPage() {
  const router = useRouter();
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentNumber.trim()) return;

    setLoading(true);
    setError('');
    setShipment(null);

    try {
      // Hit general get endpoint of shipments (can query by number)
      const res = await axios.get(`http://localhost:5000/api/shipments?search=${encodeURIComponent(shipmentNumber)}`);
      const list = res.data.shipments;
      if (list && list.length > 0) {
        // Fetch full detail of that shipment
        const detailRes = await axios.get(`http://localhost:5000/api/shipments/${list[0].id}`);
        setShipment(detailRes.data.shipment);
      } else {
        setError('No shipment found with this tracking number.');
      }
    } catch (err) {
      setError('Error fetching tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timelineSteps = [
    'Inquiry',
    'Quotation',
    'Booked',
    'Picked Up',
    'At Warehouse',
    'Customs Clearance',
    'Loaded',
    'In Transit',
    'Arrived',
    'Out For Delivery',
    'Delivered',
  ];

  const currentStepIndex = shipment ? timelineSteps.indexOf(shipment.status) : -1;

  const getModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'air':
        return <Plane className="text-indigo-400" size={20} />;
      case 'road':
        return <Truck className="text-amber-400" size={20} />;
      default:
        return <Ship className="text-blue-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            GXA
          </div>
          <span className="font-bold text-md tracking-wider">GXA Technologies</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-xs font-semibold px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition"
        >
          Employee Login
        </button>
      </header>

      {/* Main Track container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col items-center justify-center gap-8">
        {/* Big Search Header */}
        <div className="text-center space-y-2 max-w-lg">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Track Your Freight
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your Shipment Number (e.g., GXA-SH-10001, GXA-SH-10002) below for real-time location mapping and timeline reports.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="w-full max-w-xl flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Shipment Number (GXA-SH-XXXXX)"
              value={shipmentNumber}
              onChange={(e) => setShipmentNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-2xl outline-none text-sm transition"
            />
            <Search className="absolute left-3.5 top-4 text-slate-500" size={18} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Track'}
          </button>
        </form>

        {/* Error Callout */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-950 text-red-400 text-xs max-w-md text-center">
            {error}
          </div>
        )}

        {/* Tracking Details display */}
        {shipment && (
          <div className="w-full bg-slate-900/50 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-8 animate-fade-in shadow-xl backdrop-blur-md">
            {/* Summary card header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-800 pb-4 gap-4">
              <div className="flex gap-3 items-center">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  {getModeIcon(shipment.mode)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{shipment.shipmentNumber}</h3>
                  <p className="text-[10px] text-slate-400">
                    Mode: {shipment.mode} Freight ({shipment.shipmentType}) • Route: {shipment.origin} to {shipment.destination}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Status</p>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mt-1">
                  {shipment.status}
                </span>
              </div>
            </div>

            {/* Geographical Route Visual Mockup */}
            <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-red-400" />
                  <div>
                    <p className="font-semibold text-slate-400">Origin</p>
                    <p className="text-white">{shipment.origin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <div>
                    <p className="font-semibold text-slate-400">Destination</p>
                    <p className="text-white">{shipment.destination}</p>
                  </div>
                  <MapPin size={14} className="text-green-400" />
                </div>
              </div>

              {/* Progress bar line */}
              <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, Math.min(100, (currentStepIndex + 1) * 9))}%` }}
                ></div>
              </div>

              {/* Coordinates tracking */}
              <div className="flex flex-col sm:flex-row justify-between text-[10px] text-slate-500 gap-2">
                <p className="flex items-center gap-1">
                  <Compass size={12} className="animate-spin" /> Latitude: {shipment.currentLat}° • Longitude: {shipment.currentLng}°
                </p>
                <p>
                  Est. Delivery: {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'Pending'}
                </p>
              </div>
            </div>

            {/* Timeline progression vertical checkmarks */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Cargo Journey Timeline</h4>
              <div className="relative border-l-2 border-slate-800 ml-3.5 pl-6 space-y-6 text-xs">
                {timelineSteps.slice(0, currentStepIndex + 1).reverse().map((step, idx) => (
                  <div key={step} className="relative">
                    {/* Circle marker */}
                    <div className="absolute left-[-31px] top-0 h-5 w-5 bg-blue-600 rounded-full border-4 border-slate-950 flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{step}</p>
                      <p className="text-[10px] text-slate-400">
                        {idx === 0 ? 'Status checked and verified' : 'Cargo processing cleared'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-900 flex items-center justify-center text-[10px] text-slate-500">
        © GXA Technologies. All Rights Reserved.
      </footer>
    </div>
  );
}
