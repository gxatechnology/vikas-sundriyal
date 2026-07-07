'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import {
  FileText,
  Plus,
  Loader2,
  DollarSign,
  Download,
  Calendar,
  X,
  CreditCard,
  Percent,
} from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  grandTotal: number;
  status: string;
  customer: {
    companyName: string;
  };
  shipment: {
    shipmentNumber: string;
  };
}

export default function BillingPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Invoice State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    shipmentId: '',
    dueDate: '',
    taxRate: '18.0',
    items: [{ description: '', amount: '' }],
  });

  // Modal Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Quotation State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    origin: '',
    destination: '',
    mode: 'Sea',
    grossWeight: '',
    commodity: '',
    charges: [
      { description: 'Ocean Freight charges', amount: '80000' },
      { description: 'Local handling fee', amount: '12000' },
    ],
  });

  useEffect(() => {
    fetchInvoices();
    fetchSetupData();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing/invoices');
      setInvoices(res.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetupData = async () => {
    if (['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'].includes(user?.role || '')) {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/customers'),
          api.get('/shipments'),
        ]);
        setCustomers(cRes.data.customers);
        setShipments(sRes.data.shipments);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', amount: '' }],
    });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    const list = [...invoiceForm.items];
    list.splice(index, 1);
    setInvoiceForm({ ...invoiceForm, items: list });
  };

  const handleInvoiceItemChange = (index: number, field: string, val: string) => {
    const list = [...invoiceForm.items];
    (list[index] as any)[field] = val;
    setInvoiceForm({ ...invoiceForm, items: list });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/billing/invoice', {
        ...invoiceForm,
        customerId: parseInt(invoiceForm.customerId),
        shipmentId: parseInt(invoiceForm.shipmentId),
      });
      setShowInvoiceModal(false);
      // Reset form
      setInvoiceForm({
        customerId: '',
        shipmentId: '',
        dueDate: '',
        taxRate: '18.0',
        items: [{ description: '', amount: '' }],
      });
      fetchInvoices();
    } catch (err) {
      alert('Failed to generate invoice. Please verify fields.');
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.grandTotal));
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.post('/billing/payment', {
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        referenceNumber,
      });
      setShowPaymentModal(false);
      setReferenceNumber('');
      fetchInvoices();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const handleDownloadInvoice = (id: number, number: string) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/billing/invoices/${id}/pdf?token=${token}`;
    window.open(url, '_blank');
  };

  const handleGenerateQuotePDF = () => {
    const chargesStr = encodeURIComponent(JSON.stringify(quoteForm.charges));
    const url = `http://localhost:5000/api/billing/quote/pdf?companyName=${encodeURIComponent(
      quoteForm.companyName
    )}&contactPerson=${encodeURIComponent(quoteForm.contactPerson)}&email=${encodeURIComponent(
      quoteForm.email
    )}&origin=${encodeURIComponent(quoteForm.origin)}&destination=${encodeURIComponent(
      quoteForm.destination
    )}&mode=${encodeURIComponent(quoteForm.mode)}&grossWeight=${encodeURIComponent(
      quoteForm.grossWeight
    )}&commodity=${encodeURIComponent(quoteForm.commodity)}&charges=${chargesStr}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title and Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Generate tax invoices, track client outstanding amounts, and generate sales quotations.
          </p>
        </div>
        <div className="flex gap-2">
          {['SUPER_ADMIN', 'ADMIN', 'SALES_EXECUTIVE'].includes(user?.role || '') && (
            <button
              onClick={() => setShowQuoteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Sales Quotation Board
            </button>
          )}
          {['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'].includes(user?.role || '') && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <Plus size={16} /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No invoices generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Invoice No</th>
                  <th className="p-4 font-bold">Shipment Number</th>
                  <th className="p-4 font-bold">Client / Company</th>
                  <th className="p-4 font-bold">Due Date</th>
                  <th className="p-4 font-bold">Grand Total</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">
                      {inv.shipment.shipmentNumber}
                    </td>
                    <td className="p-4 font-semibold">{inv.customer.companyName}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 font-semibold"
                      >
                        <Download size={12} /> PDF
                      </button>
                      {inv.status !== 'Paid' &&
                        ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'].includes(user?.role || '') && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                          >
                            <DollarSign size={12} /> Record Pay
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice modal form */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-md">Tax Invoice Generation</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Select Customer</label>
                  <select
                    required
                    value={invoiceForm.customerId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
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
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Select Shipment ID</label>
                  <select
                    required
                    value={invoiceForm.shipmentId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, shipmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="">-- Select Booking --</option>
                    {shipments
                      .filter((s) => !invoiceForm.customerId || s.customerId === parseInt(invoiceForm.customerId))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.shipmentNumber} ({s.origin} → {s.destination})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">GST Rate (%)</label>
                  <input
                    type="number"
                    value={invoiceForm.taxRate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Items pricing board */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Charge Components</p>
                  <button
                    type="button"
                    onClick={handleAddInvoiceItem}
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    + Add Charge Component
                  </button>
                </div>

                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ocean Freight / Handling charges"
                      value={item.description}
                      onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Amount (INR)"
                      value={item.amount}
                      onChange={(e) => handleInvoiceItemChange(index, 'amount', e.target.value)}
                      className="w-32 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                    {invoiceForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInvoiceItem(index)}
                        className="p-2 text-red-500 hover:bg-slate-100 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Record Payment ({selectedInvoice.invoiceNumber})</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Payment Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash payment</option>
                  <option value="UPI">UPI instant transfer</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Transaction Reference Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN9876543"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Submit Receipt Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sales Quotation board Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-md">Freight Quotation Generator</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={quoteForm.companyName}
                  onChange={(e) => setQuoteForm({ ...quoteForm, companyName: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={quoteForm.contactPerson}
                  onChange={(e) => setQuoteForm({ ...quoteForm, contactPerson: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <input
                  type="email"
                  placeholder="Contact Email"
                  value={quoteForm.email}
                  onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <select
                  value={quoteForm.mode}
                  onChange={(e) => setQuoteForm({ ...quoteForm, mode: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                >
                  <option value="Sea">Sea Freight</option>
                  <option value="Air">Air Freight</option>
                  <option value="Road">Road Freight</option>
                </select>
                <input
                  type="text"
                  placeholder="Origin"
                  value={quoteForm.origin}
                  onChange={(e) => setQuoteForm({ ...quoteForm, origin: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={quoteForm.destination}
                  onChange={(e) => setQuoteForm({ ...quoteForm, destination: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="Gross Weight (kg)"
                  value={quoteForm.grossWeight}
                  onChange={(e) => setQuoteForm({ ...quoteForm, grossWeight: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="Commodity Type"
                  value={quoteForm.commodity}
                  onChange={(e) => setQuoteForm({ ...quoteForm, commodity: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                />
              </div>

              <button
                onClick={handleGenerateQuotePDF}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Download size={14} /> Generate and Download Quote PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
