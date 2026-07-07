"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const authController_1 = require("../controllers/authController");
const customerController_1 = require("../controllers/customerController");
const shipmentController_1 = require("../controllers/shipmentController");
const billingController_1 = require("../controllers/billingController");
const customsController_1 = require("../controllers/customsController");
const warehouseController_1 = require("../controllers/warehouseController");
const vendorController_1 = require("../controllers/vendorController");
const supportController_1 = require("../controllers/supportController");
const documentController_1 = require("../controllers/documentController");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
// Configure Multer for Uploads
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', authController_1.register);
router.post('/auth/login', authController_1.login);
router.get('/auth/profile', auth_1.authenticateJWT, authController_1.getProfile);
// Employee Management
router.get('/employees', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), authController_1.getAllEmployees);
router.put('/employees/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), authController_1.updateEmployee);
// ==========================================
// Customer Routes
// ==========================================
router.get('/customers', auth_1.authenticateJWT, customerController_1.getAllCustomers);
router.get('/customers/:id', auth_1.authenticateJWT, customerController_1.getCustomerById);
router.post('/customers', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.SALES_EXECUTIVE), customerController_1.createCustomer);
router.put('/customers/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.SALES_EXECUTIVE), customerController_1.updateCustomer);
router.delete('/customers/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), customerController_1.deleteCustomer);
// ==========================================
// Shipment Routes
// ==========================================
router.post('/shipments', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER, types_1.Role.SALES_EXECUTIVE), shipmentController_1.createShipment);
router.get('/shipments', auth_1.authenticateJWT, shipmentController_1.getAllShipments);
router.get('/shipments/:id', auth_1.authenticateJWT, shipmentController_1.getShipmentById);
router.put('/shipments/:id/status', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER), shipmentController_1.updateShipmentStatus);
router.put('/shipments/:id/location', auth_1.authenticateJWT, shipmentController_1.updateShipmentLocation);
router.put('/shipments/:id/freight', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER), shipmentController_1.updateFreightDetails);
// ==========================================
// Customs Routes
// ==========================================
router.get('/customs', auth_1.authenticateJWT, customsController_1.getCustomsStatus);
router.put('/customs/:shipmentId', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.CUSTOMS_EXECUTIVE), customsController_1.updateCustomsClearance);
// ==========================================
// Transportation Routes
// ==========================================
router.get('/transportation', auth_1.authenticateJWT, warehouseController_1.getTransportationList);
router.put('/transportation/:shipmentId', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.TRANSPORT_MANAGER), warehouseController_1.updateTransportation);
// ==========================================
// Warehousing Routes
// ==========================================
router.post('/warehouses', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), warehouseController_1.createWarehouse);
router.get('/warehouses', auth_1.authenticateJWT, warehouseController_1.getAllWarehouses);
router.post('/warehouses/inventory', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER), warehouseController_1.addInventoryItem);
router.get('/warehouses/inventory', auth_1.authenticateJWT, warehouseController_1.getInventory);
router.put('/warehouses/inventory/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER), warehouseController_1.updateInventoryItem);
// ==========================================
// Vendor Routes
// ==========================================
router.get('/vendors', auth_1.authenticateJWT, vendorController_1.getAllVendors);
router.post('/vendors', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), vendorController_1.createVendor);
router.put('/vendors/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), vendorController_1.updateVendor);
router.delete('/vendors/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), vendorController_1.deleteVendor);
// ==========================================
// Billing Routes
// ==========================================
router.post('/billing/invoice', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.ACCOUNTANT), billingController_1.createInvoice);
router.get('/billing/invoices', auth_1.authenticateJWT, billingController_1.getAllInvoices);
router.get('/billing/invoices/:id', auth_1.authenticateJWT, billingController_1.getInvoiceById);
router.get('/billing/invoices/:id/pdf', billingController_1.downloadInvoicePDF); // Download is public/authenticated via query/bearer
router.post('/billing/payment', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.ACCOUNTANT), billingController_1.addPayment);
router.post('/billing/quote', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.SALES_EXECUTIVE), billingController_1.generateQuotation);
router.get('/billing/quote/pdf', billingController_1.downloadQuotationPDF);
// ==========================================
// Document Routes
// ==========================================
router.post('/documents', auth_1.authenticateJWT, upload.single('file'), documentController_1.uploadDocument);
router.get('/documents', auth_1.authenticateJWT, documentController_1.getDocuments);
router.put('/documents/:id/approve', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN, types_1.Role.OPERATIONS_MANAGER, types_1.Role.DOCUMENTATION_EXECUTIVE), documentController_1.approveDocument);
// ==========================================
// Support Routes & Audit Logs
// ==========================================
router.post('/support/tickets', auth_1.authenticateJWT, supportController_1.createTicket);
router.get('/support/tickets', auth_1.authenticateJWT, supportController_1.getTickets);
router.put('/support/tickets/:id', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), supportController_1.updateTicketStatus);
router.get('/support/logs', auth_1.authenticateJWT, (0, auth_1.authorizeRoles)(types_1.Role.SUPER_ADMIN, types_1.Role.ADMIN), supportController_1.getAuditLogs);
// ==========================================
// Dashboard Metrics Route
// ==========================================
router.get('/dashboard/metrics', auth_1.authenticateJWT, dashboardController_1.getDashboardMetrics);
exports.default = router;
