"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadQuotationPDF = exports.generateQuotation = exports.addPayment = exports.downloadInvoicePDF = exports.getInvoiceById = exports.getAllInvoices = exports.createInvoice = void 0;
const db_1 = __importDefault(require("../db"));
const helpers_1 = require("../utils/helpers");
const createInvoice = async (req, res) => {
    try {
        const { shipmentId, customerId, dueDate, items, taxRate = 18.0 } = req.body;
        const count = await db_1.default.invoice.count();
        const invoiceNumber = `GXA-INV-${20000 + count + 1}`;
        // Calculate totals
        const parsedItems = items;
        const subTotal = parsedItems.reduce((acc, item) => acc + parseFloat(String(item.amount)), 0);
        const taxAmount = subTotal * (parseFloat(String(taxRate)) / 100);
        const grandTotal = subTotal + taxAmount;
        const invoice = await db_1.default.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    shipmentId: parseInt(shipmentId),
                    customerId: parseInt(customerId),
                    dueDate: new Date(dueDate),
                    subTotal,
                    taxRate: parseFloat(String(taxRate)),
                    taxAmount,
                    grandTotal,
                    status: 'Unpaid',
                },
            });
            // Create items
            for (const item of parsedItems) {
                await tx.invoiceItem.create({
                    data: {
                        invoiceId: newInvoice.id,
                        description: item.description,
                        amount: parseFloat(String(item.amount)),
                    },
                });
            }
            // Log activity
            await tx.auditLog.create({
                data: {
                    userId: req.user?.id,
                    action: 'Create',
                    entity: 'Invoice',
                    details: `Generated invoice ${invoiceNumber} for amount INR ${grandTotal.toFixed(2)}`,
                    ipAddress: req.ip,
                },
            });
            return newInvoice;
        });
        return res.status(201).json({ message: 'Invoice generated successfully', invoice });
    }
    catch (error) {
        console.error('Invoice creation error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createInvoice = createInvoice;
const getAllInvoices = async (req, res) => {
    try {
        let whereClause = {};
        if (req.user?.role === 'CUSTOMER') {
            const profile = await db_1.default.customerProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (profile) {
                whereClause.customerId = profile.id;
            }
            else {
                return res.json({ invoices: [] });
            }
        }
        const invoices = await db_1.default.invoice.findMany({
            where: whereClause,
            include: {
                customer: { select: { companyName: true, contactPerson: true } },
                shipment: { select: { shipmentNumber: true } },
            },
            orderBy: { issueDate: 'desc' },
        });
        return res.json({ invoices });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getAllInvoices = getAllInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await db_1.default.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true,
                shipment: true,
                items: true,
                payments: true,
            },
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        return res.json({ invoice });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getInvoiceById = getInvoiceById;
const downloadInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await db_1.default.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true,
                shipment: true,
                items: true,
            },
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        (0, helpers_1.generateInvoicePDF)(res, invoice);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.downloadInvoicePDF = downloadInvoicePDF;
const addPayment = async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod, referenceNumber } = req.body;
        const invoice = await db_1.default.invoice.findUnique({
            where: { id: parseInt(invoiceId) },
            include: { payments: true },
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        const count = await db_1.default.payment.count();
        const receiptNumber = `GXA-RCP-${30000 + count + 1}`;
        const parsedAmount = parseFloat(amount);
        const payment = await db_1.default.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    invoiceId: parseInt(invoiceId),
                    receiptNumber,
                    amount: parsedAmount,
                    paymentMethod,
                    referenceNumber,
                },
            });
            // Update Invoice Status
            const totalPaid = invoice.payments.reduce((acc, pay) => acc + pay.amount, 0) + parsedAmount;
            let newStatus = 'Partially Paid';
            if (totalPaid >= invoice.grandTotal) {
                newStatus = 'Paid';
            }
            await tx.invoice.update({
                where: { id: parseInt(invoiceId) },
                data: { status: newStatus },
            });
            // Log Activity
            await tx.auditLog.create({
                data: {
                    userId: req.user?.id,
                    action: 'Create',
                    entity: 'Payment',
                    details: `Processed payment of INR ${parsedAmount.toFixed(2)} for Invoice ${invoice.invoiceNumber}. Receipt No: ${receiptNumber}`,
                    ipAddress: req.ip,
                },
            });
            return newPayment;
        });
        return res.status(201).json({ message: 'Payment recorded successfully', payment });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.addPayment = addPayment;
const generateQuotation = async (req, res) => {
    try {
        const { companyName, contactPerson, email, origin, destination, mode, grossWeight, commodity, charges } = req.body;
        const count = await db_1.default.shipment.count();
        const quoteNumber = `GXA-QT-${40000 + count + 1}`;
        const parsedCharges = charges;
        const totalAmount = parsedCharges.reduce((acc, charge) => acc + parseFloat(String(charge.amount)), 0);
        const quote = {
            quoteNumber,
            companyName,
            contactPerson,
            email,
            origin,
            destination,
            mode,
            grossWeight: parseFloat(grossWeight),
            commodity,
            charges: parsedCharges,
            totalAmount,
            createdAt: new Date(),
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Valid for 15 days
        };
        // Return the response as JSON. In real cases, we can also offer download via pdf endpoint
        return res.status(201).json({ message: 'Quotation generated successfully', quote });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.generateQuotation = generateQuotation;
const downloadQuotationPDF = async (req, res) => {
    try {
        // Generate a mock quotation dynamically for downloading
        const { companyName, contactPerson, email, origin, destination, mode, grossWeight, commodity, charges, quoteNumber } = req.query;
        const parsedCharges = JSON.parse(String(charges || '[]'));
        const totalAmount = parsedCharges.reduce((acc, charge) => acc + parseFloat(String(charge.amount)), 0);
        const quote = {
            quoteNumber: String(quoteNumber || 'GXA-QT-40001'),
            companyName: String(companyName || 'GXA Technologies'),
            contactPerson: String(contactPerson || 'Vikas Sundriyal'),
            email: String(email || 'vikas@gxatechnologies.com'),
            origin: String(origin || 'Mumbai'),
            destination: String(destination || 'New York'),
            mode: String(mode || 'Sea'),
            grossWeight: parseFloat(String(grossWeight || '1000')),
            commodity: String(commodity || 'General Cargo'),
            charges: parsedCharges,
            totalAmount,
            createdAt: new Date(),
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        };
        (0, helpers_1.generateQuotationPDF)(res, quote);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.downloadQuotationPDF = downloadQuotationPDF;
