import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { Role } from '../types';

import {
  register,
  login,
  getProfile,
  getAllEmployees,
  updateEmployee,
} from '../controllers/authController';

import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';

import {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
  updateShipmentLocation,
  updateFreightDetails,
} from '../controllers/shipmentController';

import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  downloadInvoicePDF,
  addPayment,
  generateQuotation,
  downloadQuotationPDF,
} from '../controllers/billingController';

import {
  updateCustomsClearance,
  getCustomsStatus,
} from '../controllers/customsController';

import {
  createWarehouse,
  getAllWarehouses,
  addInventoryItem,
  getInventory,
  updateInventoryItem,
  updateTransportation,
  getTransportationList,
} from '../controllers/warehouseController';

import {
  createVendor,
  getAllVendors,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController';

import {
  createTicket,
  getTickets,
  updateTicketStatus,
  getAuditLogs,
} from '../controllers/supportController';

import {
  uploadDocument,
  getDocuments,
  approveDocument,
} from '../controllers/documentController';

import {
  getDashboardMetrics,
} from '../controllers/dashboardController';

const router = Router();

// Configure Multer for Uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authenticateJWT, getProfile);

// Employee Management
router.get('/employees', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), getAllEmployees);
router.put('/employees/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), updateEmployee);

// ==========================================
// Customer Routes
// ==========================================
router.get('/customers', authenticateJWT, getAllCustomers);
router.get('/customers/:id', authenticateJWT, getCustomerById);
router.post('/customers', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_EXECUTIVE), createCustomer);
router.put('/customers/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_EXECUTIVE), updateCustomer);
router.delete('/customers/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), deleteCustomer);

// ==========================================
// Shipment Routes
// ==========================================
router.post('/shipments', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER, Role.SALES_EXECUTIVE), createShipment);
router.get('/shipments', authenticateJWT, getAllShipments);
router.get('/shipments/:id', authenticateJWT, getShipmentById);
router.put('/shipments/:id/status', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER), updateShipmentStatus);
router.put('/shipments/:id/location', authenticateJWT, updateShipmentLocation);
router.put('/shipments/:id/freight', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER), updateFreightDetails);

// ==========================================
// Customs Routes
// ==========================================
router.get('/customs', authenticateJWT, getCustomsStatus);
router.put('/customs/:shipmentId', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.CUSTOMS_EXECUTIVE), updateCustomsClearance);

// ==========================================
// Transportation Routes
// ==========================================
router.get('/transportation', authenticateJWT, getTransportationList);
router.put('/transportation/:shipmentId', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.TRANSPORT_MANAGER), updateTransportation);

// ==========================================
// Warehousing Routes
// ==========================================
router.post('/warehouses', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), createWarehouse);
router.get('/warehouses', authenticateJWT, getAllWarehouses);
router.post('/warehouses/inventory', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER), addInventoryItem);
router.get('/warehouses/inventory', authenticateJWT, getInventory);
router.put('/warehouses/inventory/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER), updateInventoryItem);

// ==========================================
// Vendor Routes
// ==========================================
router.get('/vendors', authenticateJWT, getAllVendors);
router.post('/vendors', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), createVendor);
router.put('/vendors/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), updateVendor);
router.delete('/vendors/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), deleteVendor);

// ==========================================
// Billing Routes
// ==========================================
router.post('/billing/invoice', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), createInvoice);
router.get('/billing/invoices', authenticateJWT, getAllInvoices);
router.get('/billing/invoices/:id', authenticateJWT, getInvoiceById);
router.get('/billing/invoices/:id/pdf', downloadInvoicePDF); // Download is public/authenticated via query/bearer
router.post('/billing/payment', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), addPayment);
router.post('/billing/quote', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_EXECUTIVE), generateQuotation);
router.get('/billing/quote/pdf', downloadQuotationPDF);

// ==========================================
// Document Routes
// ==========================================
router.post('/documents', authenticateJWT, upload.single('file'), uploadDocument);
router.get('/documents', authenticateJWT, getDocuments);
router.put('/documents/:id/approve', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS_MANAGER, Role.DOCUMENTATION_EXECUTIVE), approveDocument);

// ==========================================
// Support Routes & Audit Logs
// ==========================================
router.post('/support/tickets', authenticateJWT, createTicket);
router.get('/support/tickets', authenticateJWT, getTickets);
router.put('/support/tickets/:id', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), updateTicketStatus);
router.get('/support/logs', authenticateJWT, authorizeRoles(Role.SUPER_ADMIN, Role.ADMIN), getAuditLogs);

// ==========================================
// Dashboard Metrics Route
// ==========================================
router.get('/dashboard/metrics', authenticateJWT, getDashboardMetrics);

export default router;
