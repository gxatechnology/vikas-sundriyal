"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomsStatus = exports.updateCustomsClearance = void 0;
const db_1 = __importDefault(require("../db"));
const updateCustomsClearance = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const { billOfEntry, shippingBill, dutyAmount, status, remarks, clearanceDate } = req.body;
        const customs = await db_1.default.customsClearance.update({
            where: { shipmentId: parseInt(shipmentId) },
            data: {
                billOfEntry,
                shippingBill,
                dutyAmount: dutyAmount ? parseFloat(dutyAmount) : undefined,
                status,
                remarks,
                clearanceDate: clearanceDate ? new Date(clearanceDate) : undefined,
            },
            include: {
                shipment: { select: { shipmentNumber: true } },
            },
        });
        // Log Activity
        await db_1.default.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'Update',
                entity: 'CustomsClearance',
                details: `Updated customs clearance for shipment ${customs.shipment.shipmentNumber}. Status: ${status}`,
                ipAddress: req.ip,
            },
        });
        // Real-time update for customs changes
        const io = req.app.get('io');
        if (io) {
            io.emit('customsUpdate', {
                shipmentId: customs.shipmentId,
                shipmentNumber: customs.shipment.shipmentNumber,
                status: customs.status,
            });
        }
        return res.json({ message: 'Customs details updated successfully', customs });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateCustomsClearance = updateCustomsClearance;
const getCustomsStatus = async (req, res) => {
    try {
        const customsList = await db_1.default.customsClearance.findMany({
            include: {
                shipment: {
                    select: {
                        shipmentNumber: true,
                        mode: true,
                        origin: true,
                        destination: true,
                        customer: { select: { companyName: true } },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return res.json({ customsList });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getCustomsStatus = getCustomsStatus;
