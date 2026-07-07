'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../utils/api';
import { useAuthStore } from '../../../store/authStore';
import {
  Loader2,
  ArrowLeft,
  Ship,
  Plane,
  Truck,
  MapPin,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
} from 'lucide-react';
import axios from 'axios';

interface ShipmentDetail {
  id: number;
  shipmentNumber: string;
  bookingDate: string;
  shipmentType: string;
  direction: string;
  mode: string;
  origin: string;
  destination: string;
  consigneeName: string;
  consigneeAddress: string | null;
  shipperName: string;
  shipperAddress: string | null;
  commodity: string;
  grossWeight: number;
  netWeight: number | null;
  volume: number | null;
  packagesCount: number;
  containerNumber: string | null;
  containerSize: string | null;
  carrier: string | null;
  vesselName: string | null;
  flightNumber: string | null;
  vehicleNumber: string | null;
  etd: string | null;
  eta: string | null;
  deliveryDate: string | null;
  status: string;
  currentLat: number | null;
  currentLng: number | null;
  customer: {
    companyName: string;
    contactPerson: string;
    email: string;
  };
  customs: {
    id: number;
    billOfEntry: string | null;
    shippingBill: string | null;
    dutyAmount: number;
    status: string;
    clearanceDate: string | null;
    remarks: string | null;
  } | null;
  transport: {
    id: number;
    vehicleNumber: string | null;
    driverName: string | null;
    driverContact: string | null;
    routeDetails: string | null;
    fuelCost: number;
    status: string;
  } | null;
  documents: any[];
  invoices: any[];
}

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Status updates states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Location tracking mock states
  const [trackingLat, setTrackingLat] = useState('');
  const [trackingLng, setTrackingLng] = useState('');

  // Customs update states
  const [boe, setBoe] = useState('');
  const [sb, setSb] = useState('');
  const [duty, setDuty] = useState('');
  const [customsStatus, setCustomsStatus] = useState('');
  const [customsRemarks, setCustomsRemarks] = useState('');

  // Transport update states
  const [transVehicle, setTransVehicle] = useState('');
  const [transDriver, setTransDriver] = useState('');
  const [transContact, setTransContact] = useState('');
  const [transRoute, setTransRoute] = useState('');
  const [transFuel, setTransFuel] = useState('');
  const [transStatus, setTransStatus] = useState('');

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Bill of Lading');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shipments/${id}`);
      const data = res.data.shipment as ShipmentDetail;
      setShipment(data);
      setSelectedStatus(data.status);
      setTrackingLat(String(data.currentLat || '19.0760'));
      setTrackingLng(String(data.currentLng || '72.8777'));

      if (data.customs) {
        setBoe(data.customs.billOfEntry || '');
        setSb(data.customs.shippingBill || '');
        setDuty(String(data.customs.dutyAmount || '0'));
        setCustomsStatus(data.customs.status || 'Pending');
        setCustomsRemarks(data.customs.remarks || '');
      }

      if (data.transport) {
        setTransVehicle(data.transport.vehicleNumber || '');
        setTransDriver(data.transport.driverName || '');
        setTransContact(data.transport.driverContact || '');
        setTransRoute(data.transport.routeDetails || '');
        setTransFuel(String(data.transport.fuelCost || '0'));
        setTransStatus(data.transport.status || 'Pending');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      await api.put(`/shipments/${id}/status`, {
        status: selectedStatus,
        remarks: statusRemarks,
      });
      setStatusRemarks('');
      fetchShipmentDetails();
    } catch (err) {
      alert('Unauthorized or failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/shipments/${id}/location`, {
        lat: trackingLat,
        lng: trackingLng,
      });
      alert('Tracking coordinates updated successfully!');
      fetchShipmentDetails();
    } catch (err) {
      alert('Failed to update tracking coordinates');
    }
  };

  const handleUpdateCustoms = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/customs/${id}`, {
        billOfEntry: boe || null,
        shippingBill: sb || null,
        dutyAmount: parseFloat(duty || '0'),
        status: customsStatus,
        remarks: customsRemarks || null,
      });
      alert('Customs clearance status updated!');
      fetchShipmentDetails();
    } catch (err) {
      alert('Failed to update customs data');
    }
  };

  const handleUpdateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/transportation/${id}`, {
        vehicleNumber: transVehicle || null,
        driverName: transDriver || null,
        driverContact: transContact || null,
        routeDetails: transRoute || null,
        fuelCost: parseFloat(transFuel || '0'),
        status: transStatus,
      });
      alert('Transportation dispatch updated!');
      fetchShipmentDetails();
    } catch (err) {
      alert('Failed to update transportation tracking');
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', docType);
      formData.append('shipmentId', String(shipment?.id));

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Document uploaded successfully for review!');
      fetchShipmentDetails();
    } catch (err) {
      alert('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleApproveDocument = async (docId: number, status: string) => {
    try {
      await api.put(`/documents/${docId}/approve`, { status });
      alert(`Document set to: ${status}`);
      fetchShipmentDetails();
    } catch (err) {
      alert('Unauthorized or failed to set document status');
    }
  };

  if (loading || !shipment) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Define steps for shipment timeline
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

  const currentStepIndex = timelineSteps.indexOf(shipment.status);

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/shipments')}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Inspect Shipment {shipment.shipmentNumber}</h1>
          <p className="text-xs text-slate-500">Booking Date: {new Date(shipment.bookingDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Grid: Left - Shipment Details / Timeline | Right - Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2-Span) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline tracker */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-6">Real-Time Transit Timeline</h3>
            <div className="relative flex items-center justify-between overflow-x-auto pb-4 gap-4">
              {timelineSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center min-w-[70px]">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span className="text-[9px] mt-2 text-center font-medium truncate w-[80px]">
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Cargo & Routing Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <p className="text-slate-400">Carrier / Vessel Details</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {shipment.carrier || 'Unassigned'} {shipment.vesselName && `(Vessel: ${shipment.vesselName})`}
                  {shipment.flightNumber && `(Flight: ${shipment.flightNumber})`}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Container Details</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {shipment.containerNumber || 'None'} {shipment.containerSize && `(${shipment.containerSize})`}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Commodity</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{shipment.commodity}</p>
              </div>
              <div>
                <p className="text-slate-400">Origin Location</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin size={12} className="text-red-500" /> {shipment.origin}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Destination Location</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin size={12} className="text-green-500" /> {shipment.destination}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Expected ETA</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Gross Weight</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{shipment.grossWeight} kg</p>
              </div>
              <div>
                <p className="text-slate-400">Total Packages</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{shipment.packagesCount} units</p>
              </div>
              <div>
                <p className="text-slate-400">Direction</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{shipment.direction}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Shipper (Sender)</p>
                <p className="font-semibold mt-1">{shipment.shipperName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{shipment.shipperAddress}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Consignee (Recipient)</p>
                <p className="font-semibold mt-1">{shipment.consigneeName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{shipment.consigneeAddress}</p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Associated Shipping Documents
            </h3>
            {shipment.documents.length === 0 ? (
              <p className="text-xs text-slate-500">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {shipment.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Type: {doc.type} • Uploaded by: {doc.uploadedBy.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 font-semibold"
                      >
                        Preview
                      </a>
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : doc.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {doc.status}
                      </span>
                      {/* Operations / Doc Exec approval controls */}
                      {doc.status === 'Pending' &&
                        ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'DOCUMENTATION_EXECUTIVE'].includes(
                          user?.role || ''
                        ) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApproveDocument(doc.id, 'Approved')}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleApproveDocument(doc.id, 'Rejected')}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Document Upload Form */}
            <form onSubmit={handleDocumentUpload} className="flex flex-wrap items-center gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
              >
                <option value="Commercial Invoice">Commercial Invoice</option>
                <option value="Packing List">Packing List</option>
                <option value="Bill of Lading">Bill of Lading</option>
                <option value="Air Waybill">Air Waybill</option>
                <option value="Certificate of Origin">Certificate of Origin</option>
                <option value="Insurance Document">Insurance Document</option>
                <option value="Customs clearance receipt">Customs clearance receipt</option>
              </select>

              <input
                type="file"
                required
                ref={fileInputRef}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
              />

              <button
                type="submit"
                disabled={uploadingDoc}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 transition ml-auto"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload Doc'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (Actions / Mocks) */}
        <div className="space-y-6">
          {/* Operations Panel: Advanced Status (Super Admin, Admin, Operations) */}
          {['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER'].includes(user?.role || '') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Compass className="text-blue-500" size={16} /> Operations Console
              </h3>
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Advance Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    {timelineSteps.map((step) => (
                      <option key={step} value={step}>
                        {step}
                      </option>
                    ))}
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Remarks / Activity Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Vessel departed Shenzhen Port"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  {updatingStatus ? 'Updating Status...' : 'Apply Status Update'}
                </button>
              </form>

              {/* Mocks location tracking */}
              <form onSubmit={handleUpdateLocation} className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulate GPS Coordinates</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={trackingLat}
                    onChange={(e) => setTrackingLat(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={trackingLng}
                    onChange={(e) => setTrackingLng(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Update GPS Coordinates
                </button>
              </form>
            </div>
          )}

          {/* Customs clearance section */}
          {['SUPER_ADMIN', 'ADMIN', 'CUSTOMS_EXECUTIVE'].includes(user?.role || '') && shipment.customs && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                Customs Clearance Desk
              </h3>
              <form onSubmit={handleUpdateCustoms} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Bill of Entry (BOE)</label>
                  <input
                    type="text"
                    placeholder="Import BOE Number"
                    value={boe}
                    onChange={(e) => setBoe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Shipping Bill (SB)</label>
                  <input
                    type="text"
                    placeholder="Export SB Number"
                    value={sb}
                    onChange={(e) => setSb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Duty Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Customs Duty"
                      value={duty}
                      onChange={(e) => setDuty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Customs Status</label>
                    <select
                      value={customsStatus}
                      onChange={(e) => setCustomsStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Assessment">Under Assessment</option>
                      <option value="Duty Paid">Duty Paid</option>
                      <option value="Cleared">Cleared</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Duty Assessment Notes</label>
                  <input
                    type="text"
                    placeholder="Assessments remarks"
                    value={customsRemarks}
                    onChange={(e) => setCustomsRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Save Customs Audit
                </button>
              </form>
            </div>
          )}

          {/* Transportation routing updates */}
          {['SUPER_ADMIN', 'ADMIN', 'TRANSPORT_MANAGER'].includes(user?.role || '') && shipment.transport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                Domestic Transport Dispatch
              </h3>
              <form onSubmit={handleUpdateTransport} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="MH-12-AB-1234"
                      value={transVehicle}
                      onChange={(e) => setTransVehicle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Fuel Cost (INR)</label>
                    <input
                      type="number"
                      placeholder="Fuel expenses"
                      value={transFuel}
                      onChange={(e) => setTransFuel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Driver Name</label>
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={transDriver}
                      onChange={(e) => setTransDriver(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Driver Contact</label>
                    <input
                      type="text"
                      placeholder="Contact No"
                      value={transContact}
                      onChange={(e) => setTransContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Route Details</label>
                  <input
                    type="text"
                    placeholder="Route path details"
                    value={transRoute}
                    onChange={(e) => setTransRoute(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Dispatch Status</label>
                  <select
                    value={transStatus}
                    onChange={(e) => setTransStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 outline-none"
                  >
                    <option value="Pending">Pending Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned Empty</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Save Dispatch Log
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
