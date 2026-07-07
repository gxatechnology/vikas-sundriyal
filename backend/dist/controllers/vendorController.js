"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendor = exports.updateVendor = exports.getAllVendors = exports.createVendor = void 0;
const db_1 = __importDefault(require("../db"));
const createVendor = async (req, res) => {
    try {
        const { name, type, contactPerson, mobile, email, contractDetails, performanceScore } = req.body;
        const vendor = await db_1.default.vendor.create({
            data: {
                name,
                type,
                contactPerson,
                mobile,
                email,
                contractDetails,
                performanceScore: performanceScore ? parseFloat(performanceScore) : undefined,
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'Create',
                entity: 'Vendor',
                details: `Created vendor profile: ${name} (${type})`,
                ipAddress: req.ip,
            },
        });
        return res.status(201).json({ message: 'Vendor profile created successfully', vendor });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createVendor = createVendor;
const getAllVendors = async (req, res) => {
    try {
        const vendors = await db_1.default.vendor.findMany({
            orderBy: { name: 'asc' },
        });
        return res.json({ vendors });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getAllVendors = getAllVendors;
const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, contactPerson, mobile, email, contractDetails, performanceScore } = req.body;
        const vendor = await db_1.default.vendor.update({
            where: { id: parseInt(id) },
            data: {
                name,
                type,
                contactPerson,
                mobile,
                email,
                contractDetails,
                performanceScore: performanceScore ? parseFloat(performanceScore) : undefined,
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'Update',
                entity: 'Vendor',
                details: `Updated vendor details for: ${name}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Vendor details updated successfully', vendor });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateVendor = updateVendor;
const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await db_1.default.vendor.delete({
            where: { id: parseInt(id) },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'Delete',
                entity: 'Vendor',
                details: `Deleted vendor profile: ${vendor.name}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Vendor deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.deleteVendor = deleteVendor;
