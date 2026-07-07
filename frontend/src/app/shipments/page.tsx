'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Ship,
  Plane,
  Truck,
  Eye,
  Loader2,
  Calendar,
  X,
  FileText,
  Download,
} from 'lucide-react';
import LinkComponent from 'next/link';

interface Shipment {
  id: number;
  shipmentNumber: string;
  bookingDate: string;
  shipmentType: string;
  direction: string;
  mode: string;
  origin: string;
  destination: string;
  commodity: string;
  grossWeight: number;
  status: string;
  carrier: string | null;
  customer: {
    companyName: string;
    contactPerson: string;
  };
}

export default function ShipmentsPage() {
  const { user } = useAuthStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Create Shipment Modal State
  const [showModal, setShowModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    customerId: '',
    shipmentType: 'FCL',
    direction: 'Import',
    mode: 'Sea',
    origin: '',
    destination: '',
    consigneeName: '',
    consigneeAddress: '',
    shipperName: '',
    shipperAddress: '',
    commodity: '',
    grossWeight: '',
    netWeight: '',
    volume: '',
    packagesCount: '1',
    carrier: '',
    vesselName: '',
    flightNumber: '',
    vehicleNumber: '',
    etd: '',
    eta: '',
  });

  useEffect(() => {
    fetchShipments();
    fetchCustomers();
  }, [search, statusFilter, modeFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments', {
        params: { search, status: statusFilter, mode: modeFilter },
      });
      setShipments(res.data.shipments);
    } catch (err) {
      console.error('Failed to load shipments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'SALES_EXECUTIVE'].includes(user?.role || '')) {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data.customers);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shipments', newShipment);
      setShowModal(false);
      // Reset form
      setNewShipment({
        customerId: '',
        shipmentType: 'FCL',
        direction: 'Import',
        mode: 'Sea',
        origin: '',
        destination: '',
        consigneeName: '',
        consigneeAddress: '',
        shipperName: '',
        shipperAddress: '',
        commodity: '',
        grossWeight: '',
        netWeight: '',
        volume: '',
        packagesCount: '1',
        carrier: '',
        vesselName: '',
        flightNumber: '',
        vehicleNumber: '',
        etd: '',
        eta: '',
      });
      fetchShipments();
    } catch (err) {
      alert('Failed to book shipment. Check all fields.');
    }
  };

  // Helper for Exporting Data as CSV
  const handleExportCSV = () => {
    const headers = 'Shipment ID,Booking Date,Company,Mode,Direction,Route,Gross Weight,Status\n';
    const rows = shipments
      .map(
        (s) =>
          `"${s.shipmentNumber}","${new Date(s.bookingDate).toLocaleDateString()}","${
            s.customer.companyName
          }","${s.mode}","${s.direction}","${s.origin} -> ${s.destination}",${s.grossWeight},"${
            s.status
          }"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Shipments_Report_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Inquiry':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Booked':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case 'In Transit':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'air':
        return <Plane className="text-indigo-500" size={16} />;
      case 'road':
        return <Truck className="text-amber-500" size={16} />;
      default:
        return <Ship className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Booking Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipment Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track and orchestrate freight forwarding movements globally.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
          >
            <Download size={16} /> Export CSV
          </button>
          {['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'SALES_EXECUTIVE'].includes(user?.role || '') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow shadow-blue-500/20 transition"
            >
              <Plus size={16} /> Book Shipment
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="Search by Shipment No, Carrier, Customer, Route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 outline-none transition"
          />
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Booked">Booked</option>
            <option value="Picked Up">Picked Up</option>
            <option value="At Warehouse">At Warehouse</option>
            <option value="Customs Clearance">Customs Clearance</option>
            <option value="In Transit">In Transit</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Mode filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full sm:w-36 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition"
          >
            <option value="">All Modes</option>
            <option value="Sea">Sea Freight</option>
            <option value="Air">Air Freight</option>
            <option value="Road">Road Freight</option>
          </select>
        </div>
      </div>

      {/* Shipment Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No shipments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Shipment ID</th>
                  <th className="p-4 font-bold">Booking Date</th>
                  <th className="p-4 font-bold">Client / Company</th>
                  <th className="p-4 font-bold">Freight Mode</th>
                  <th className="p-4 font-bold">Route</th>
                  <th className="p-4 font-bold">Gross Wt</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {s.shipmentNumber}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(s.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{s.customer.companyName}</p>
                      <p className="text-[10px] text-slate-400">{s.customer.contactPerson}</p>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 capitalize font-medium">
                        {getModeIcon(s.mode)} {s.mode.toLowerCase()} ({s.shipmentType})
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium truncate max-w-xs">{s.origin} → {s.destination}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{s.direction.toLowerCase()} movement</p>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {s.grossWeight} kg
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <LinkComponent
                        href={`/shipments/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                      >
                        <Eye size={12} /> Inspect
                      </LinkComponent>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Form Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-lg">Freight Booking Registration</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Customer */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Select Customer</label>
                  <select
                    required
                    value={newShipment.customerId}
                    onChange={(e) => setNewShipment({ ...newShipment, customerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="">-- Select Client --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Freight Mode */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Transport Mode</label>
                  <select
                    value={newShipment.mode}
                    onChange={(e) => setNewShipment({ ...newShipment, mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Sea">Sea Freight</option>
                    <option value="Air">Air Freight</option>
                    <option value="Road">Road Freight</option>
                  </select>
                </div>

                {/* Shipment Type */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Shipment Type</label>
                  <select
                    value={newShipment.shipmentType}
                    onChange={(e) => setNewShipment({ ...newShipment, shipmentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="FCL">FCL (Full Container Load)</option>
                    <option value="LCL">LCL (Less Container Load)</option>
                    <option value="Air Cargo">Air Cargo consolidation</option>
                    <option value="Road Cargo">Road Cargo transport</option>
                  </select>
                </div>

                {/* Direction */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Direction</label>
                  <select
                    value={newShipment.direction}
                    onChange={(e) => setNewShipment({ ...newShipment, direction: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Import">Import</option>
                    <option value="Export">Export</option>
                  </select>
                </div>

                {/* Origin */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Origin Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shenzhen Port, China"
                    value={newShipment.origin}
                    onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Destination Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JNPT, Mumbai, India"
                    value={newShipment.destination}
                    onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Shipper & Consignee */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipper Details</p>
                  <input
                    type="text"
                    required
                    placeholder="Shipper Company Name"
                    value={newShipment.shipperName}
                    onChange={(e) => setNewShipment({ ...newShipment, shipperName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                  <textarea
                    placeholder="Shipper Address"
                    value={newShipment.shipperAddress}
                    onChange={(e) => setNewShipment({ ...newShipment, shipperAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none h-16 resize-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consignee Details</p>
                  <input
                    type="text"
                    required
                    placeholder="Consignee Company Name"
                    value={newShipment.consigneeName}
                    onChange={(e) => setNewShipment({ ...newShipment, consigneeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                  <textarea
                    placeholder="Consignee Address"
                    value={newShipment.consigneeAddress}
                    onChange={(e) => setNewShipment({ ...newShipment, consigneeAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none h-16 resize-none"
                  />
                </div>
              </div>

              {/* Cargo Details */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Commodity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhones, General Cargo"
                    value={newShipment.commodity}
                    onChange={(e) => setNewShipment({ ...newShipment, commodity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Gross Weight (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newShipment.grossWeight}
                    onChange={(e) => setNewShipment({ ...newShipment, grossWeight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Volume (CBM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18.5"
                    value={newShipment.volume}
                    onChange={(e) => setNewShipment({ ...newShipment, volume: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Packages Count</label>
                  <input
                    type="number"
                    required
                    value={newShipment.packagesCount}
                    onChange={(e) => setNewShipment({ ...newShipment, packagesCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Carrier Details */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Carrier / Shipping Line / Airline</label>
                  <input
                    type="text"
                    placeholder="e.g. Maersk, Emirates Cargo"
                    value={newShipment.carrier}
                    onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Est. ETD</label>
                  <input
                    type="date"
                    value={newShipment.etd}
                    onChange={(e) => setNewShipment({ ...newShipment, etd: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Est. ETA</label>
                  <input
                    type="date"
                    value={newShipment.eta}
                    onChange={(e) => setNewShipment({ ...newShipment, eta: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
