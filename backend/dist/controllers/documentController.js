"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveDocument = exports.getDocuments = exports.uploadDocument = void 0;
const db_1 = __importDefault(require("../db"));
const uploadDocument = async (req, res) => {
    try {
        const { name, type, shipmentId, customerId } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        // File URL will point to our static endpoint
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const document = await db_1.default.document.create({
            data: {
                name: name || req.file.originalname,
                type,
                fileUrl,
                shipmentId: shipmentId ? parseInt(shipmentId) : null,
                customerId: customerId ? parseInt(customerId) : null,
                uploadedById: req.user.id,
                status: 'Pending',
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Create',
                entity: 'Document',
                details: `Uploaded document: ${document.name} of type ${type}`,
                ipAddress: req.ip,
            },
        });
        return res.status(201).json({ message: 'Document uploaded successfully', document });
    }
    catch (error) {
        console.error('Document upload error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.uploadDocument = uploadDocument;
const getDocuments = async (req, res) => {
    try {
        let whereClause = {};
        if (req.user?.role === 'CUSTOMER') {
            const profile = await db_1.default.customerProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (profile) {
                whereClause.OR = [
                    { customerId: profile.id },
                    { shipment: { customerId: profile.id } },
                ];
            }
            else {
                return res.json({ documents: [] });
            }
        }
        const documents = await db_1.default.document.findMany({
            where: whereClause,
            include: {
                shipment: { select: { shipmentNumber: true } },
                customer: { select: { companyName: true } },
                uploadedBy: { select: { name: true, role: true } },
                approvedBy: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ documents });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getDocuments = getDocuments;
const approveDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Approved or Rejected
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const document = await db_1.default.document.update({
            where: { id: parseInt(id) },
            data: {
                status,
                approvedById: req.user.id,
            },
            include: {
                uploadedBy: { select: { email: true } },
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'Approve',
                entity: 'Document',
                details: `Set status of document ${document.name} to ${status}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: `Document status set to ${status}`, document });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.approveDocument = approveDocument;
