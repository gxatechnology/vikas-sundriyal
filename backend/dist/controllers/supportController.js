"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.updateTicketStatus = exports.getTickets = exports.createTicket = void 0;
const db_1 = __importDefault(require("../db"));
const createTicket = async (req, res) => {
    try {
        const authReq = req;
        const { title, description, priority } = req.body;
        if (!authReq.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const count = await db_1.default.supportTicket.count();
        const ticketNumber = `TKT-${50000 + count + 1}`;
        const ticket = await db_1.default.supportTicket.create({
            data: {
                ticketNumber,
                title,
                description,
                priority: priority || 'Medium',
                createdById: authReq.user.id,
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user.id,
                action: 'Create',
                entity: 'SupportTicket',
                details: `Opened support ticket: ${ticketNumber}`,
                ipAddress: req.ip,
            },
        });
        return res.status(201).json({ message: 'Ticket raised successfully', ticket });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createTicket = createTicket;
const getTickets = async (req, res) => {
    try {
        const authReq = req;
        let whereClause = {};
        if (authReq.user?.role === 'CUSTOMER') {
            whereClause = { createdById: authReq.user.id };
        }
        const tickets = await db_1.default.supportTicket.findMany({
            where: whereClause,
            include: {
                createdBy: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ tickets });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getTickets = getTickets;
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await db_1.default.supportTicket.update({
            where: { id: parseInt(id) },
            data: { status, updatedAt: new Date() },
        });
        const authReq = req;
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user?.id,
                action: 'Update',
                entity: 'SupportTicket',
                details: `Updated ticket ${ticket.ticketNumber} status to ${status}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Ticket status updated', ticket });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateTicketStatus = updateTicketStatus;
const getAuditLogs = async (req, res) => {
    try {
        const logs = await db_1.default.auditLog.findMany({
            include: {
                user: { select: { name: true, email: true, role: true } },
            },
            orderBy: { timestamp: 'desc' },
        });
        return res.json({ logs });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getAuditLogs = getAuditLogs;
