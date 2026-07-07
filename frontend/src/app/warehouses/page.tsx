'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Warehouse, Plus, X, Box, Tag, Layers } from 'lucide-react';

interface InventoryItem {
  id: number;
  cargoDescription: string;
  shipmentNumber: string | null;
  rackLocation: string | null;
  quantity: number;
  status: string;
  warehouse: {
    name: string;
  };
}

export default function WarehousesPage() {
  const { user } = useAuthStore();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Warehouse State
  const [showWHModal, setShowWHModal] = useState(false);
  const [whForm, setWHForm] = useState({ name: '', location: '', capacity: '' });

  // Modal Inventory State
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({
    warehouseId: '',
    cargoDescription: '',
    shipmentNumber: '',
    rackLocation: '',
    quantity: '1',
    status: 'Received',
  });

  useEffect(() => {
    fetchWarehouses();
    fetchInventory();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(res.data.warehouses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get('/warehouses/inventory');
      setInventory(res.data.inventory);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/warehouses', whForm);
      setShowWHModal(false);
      setWHForm({ name: '', location: '', capacity: '' });
      fetchWarehouses();
    } catch (err) {
      alert('Failed to create warehouse');
    }
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/warehouses/inventory', {
        ...invForm,
        warehouseId: parseInt(invForm.warehouseId),
        quantity: parseInt(invForm.quantity),
      });
      setShowInvModal(false);
      setInvForm({
        warehouseId: '',
        cargoDescription: '',
        shipmentNumber: '',
        rackLocation: '',
        quantity: '1',
        status: 'Received',
      });
      fetchInventory();
      fetchWarehouses();
    } catch (err) {
      alert('Failed to log inventory');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouse Logistics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage cargo inventory levels, allocate rack locations, and audit storage facilities.
          </p>
        </div>
        <div className="flex gap-2">
          {['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
            <button
              onClick={() => setShowWHModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-sm font-semibold transition"
            >
              <Warehouse size={16} /> New Warehouse
            </button>
          )}
          {['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER'].includes(user?.role || '') && (
            <button
              onClick={() => setShowInvModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <Plus size={16} /> Receive Cargo Stock
            </button>
          )}
        </div>
      </div>

      {/* Grid: Warehouses lists */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{wh.name}</h3>
                    <p className="text-[10px] text-slate-400">{wh.location}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-slate-400">Total Capacity</p>
                  <p className="font-bold">{wh.capacity ? `${wh.capacity.toLocaleString()} sqft` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Inventory Items</p>
                  <p className="font-bold">{wh.inventory.length} active logs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Global Stock logs */}
      <div className="space-y-4">
        <h2 className="text-md font-bold">Live Inventory Stock Registry</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {inventory.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No cargo currently recorded in warehouse stocks</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Cargo Description</th>
                    <th className="p-4 font-bold">Warehouse Facility</th>
                    <th className="p-4 font-bold">Shipment ID</th>
                    <th className="p-4 font-bold">Rack Allocation</th>
                    <th className="p-4 font-bold">Quantity</th>
                    <th className="p-4 font-bold text-center">Stock status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventory.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Box size={14} className="text-blue-500" /> {inv.cargoDescription}
                      </td>
                      <td className="p-4 font-medium">{inv.warehouse.name}</td>
                      <td className="p-4 text-slate-500">{inv.shipmentNumber || '—'}</td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-[10px]">
                          {inv.rackLocation || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{inv.quantity} CTN</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            inv.status === 'Stored'
                              ? 'bg-blue-500/10 text-blue-500'
                              : inv.status === 'Dispatched'
                              ? 'bg-slate-500/10 text-slate-500'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Warehouse */}
      {showWHModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Add Warehouse Facility</h3>
              <button onClick={() => setShowWHModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Warehouse Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noida Cargo Hub"
                  value={whForm.name}
                  onChange={(e) => setWHForm({ ...whForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector-81, Phase-2"
                  value={whForm.location}
                  onChange={(e) => setWHForm({ ...whForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Capacity (Sq Ft)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={whForm.capacity}
                  onChange={(e) => setWHForm({ ...whForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Register Warehouse
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Stock */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Receive Stock Cargo</h3>
              <button onClick={() => setShowInvModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInventory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Warehouse Destination</label>
                <select
                  required
                  value={invForm.warehouseId}
                  onChange={(e) => setInvForm({ ...invForm, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Cargo Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Box of Chip Semiconductors"
                  value={invForm.cargoDescription}
                  onChange={(e) => setInvForm({ ...invForm, cargoDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Shipment No (Optional)</label>
                  <input
                    type="text"
                    placeholder="SH-10001"
                    value={invForm.shipmentNumber}
                    onChange={(e) => setInvForm({ ...invForm, shipmentNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Rack Location</label>
                  <input
                    type="text"
                    placeholder="e.g. A-102"
                    value={invForm.rackLocation}
                    onChange={(e) => setInvForm({ ...invForm, rackLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Quantity</label>
                  <input
                    type="number"
                    required
                    value={invForm.quantity}
                    onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Status</label>
                  <select
                    value={invForm.status}
                    onChange={(e) => setInvForm({ ...invForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Received">Received</option>
                    <option value="Stored">Stored</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Log Cargo Incoming
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
