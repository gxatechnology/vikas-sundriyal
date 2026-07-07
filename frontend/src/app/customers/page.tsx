'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import {
  Users,
  Search,
  Plus,
  X,
  Loader2,
  Trash2,
  Edit2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';

interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstNumber: string | null;
  panNumber: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  customerType: string;
  creditLimit: number;
  paymentTerms: string;
}

export default function CustomersPage() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    customerType: 'Importer',
    creditLimit: '0',
    paymentTerms: 'Net 30',
  });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditId(customer.id);
    setForm({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      gstNumber: customer.gstNumber || '',
      panNumber: customer.panNumber || '',
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      postalCode: customer.postalCode,
      customerType: customer.customerType,
      creditLimit: String(customer.creditLimit),
      paymentTerms: customer.paymentTerms,
    });
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      companyName: '',
      contactPerson: '',
      mobileNumber: '',
      email: '',
      gstNumber: '',
      panNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      customerType: 'Importer',
      creditLimit: '0',
      paymentTerms: 'Net 30',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      alert('Operation failed. Please verify the fields.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer profile?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage company profiles, payment parameters, and account ledger limits.
          </p>
        </div>
        {['SUPER_ADMIN', 'ADMIN', 'SALES_EXECUTIVE'].includes(user?.role || '') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      {/* Search Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Company name, Contact person, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 outline-none transition"
          />
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        </div>
      </div>

      {/* Customers Cards Grid Layout */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20">
          <Users className="mx-auto text-slate-400 mb-3" size={32} />
          <p className="text-sm text-slate-500">No customers found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group flex flex-col justify-between"
            >
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] rounded font-bold uppercase tracking-wider">
                      {c.customerType}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {c.companyName}
                    </h3>
                  </div>

                  {/* Actions */}
                  {['SUPER_ADMIN', 'ADMIN', 'SALES_EXECUTIVE'].includes(user?.role || '') && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" /> {c.contactPerson}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" /> {c.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" /> {c.mobileNumber}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" /> {c.city}, {c.state}
                  </p>
                </div>
              </div>

              {/* Footer Account terms */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <span className="flex items-center gap-1">
                  <CreditCard size={12} className="text-slate-400" /> Limit: ₹{c.creditLimit.toLocaleString('en-IN')}
                </span>
                <span>Terms: {c.paymentTerms}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-md">
                {editId ? 'Edit Customer Profile' : 'Add New Customer Profile'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Company Name</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">PAN Number (Optional)</label>
                  <input
                    type="text"
                    value={form.panNumber}
                    onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Address Address</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Client Type</label>
                  <select
                    value={form.customerType}
                    onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Importer">Importer</option>
                    <option value="Exporter">Exporter</option>
                    <option value="Consignee">Consignee</option>
                    <option value="Shipper">Shipper</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Credit Limit (INR)</label>
                  <input
                    type="number"
                    required
                    value={form.creditLimit}
                    onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                  </select>
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
                  {editId ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
