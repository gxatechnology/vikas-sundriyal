"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getAllCustomers = void 0;
const db_1 = __importDefault(require("../db"));
const getAllCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search) {
            const searchStr = String(search);
            whereClause = {
                OR: [
                    { companyName: { contains: searchStr } },
                    { contactPerson: { contains: searchStr } },
                    { email: { contains: searchStr } },
                ],
            };
        }
        const customers = await db_1.default.customerProfile.findMany({
            where: whereClause,
            include: {
                user: { select: { email: true } },
            },
        });
        return res.json({ customers });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await db_1.default.customerProfile.findUnique({
            where: { id: parseInt(id) },
            include: {
                shipments: { orderBy: { bookingDate: 'desc' } },
                invoices: { orderBy: { issueDate: 'desc' } },
                documents: true,
            },
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        return res.json({ customer });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res) => {
    try {
        const { companyName, contactPerson, mobileNumber, email, gstNumber, panNumber, address, city, state, country, postalCode, customerType, creditLimit, paymentTerms, } = req.body;
        const customer = await db_1.default.customerProfile.create({
            data: {
                companyName,
                contactPerson,
                mobileNumber,
                email,
                gstNumber,
                panNumber,
                address,
                city,
                state,
                country,
                postalCode,
                customerType,
                creditLimit: parseFloat(creditLimit || '0'),
                paymentTerms,
            },
        });
        // Log activity
        const authReq = req;
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user?.id,
                action: 'Create',
                entity: 'CustomerProfile',
                details: `Created customer profile: ${companyName}`,
                ipAddress: req.ip,
            },
        });
        return res.status(201).json({ message: 'Customer created successfully', customer });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, contactPerson, mobileNumber, email, gstNumber, panNumber, address, city, state, country, postalCode, customerType, creditLimit, paymentTerms, } = req.body;
        const customer = await db_1.default.customerProfile.update({
            where: { id: parseInt(id) },
            data: {
                companyName,
                contactPerson,
                mobileNumber,
                email,
                gstNumber,
                panNumber,
                address,
                city,
                state,
                country,
                postalCode,
                customerType,
                creditLimit: parseFloat(creditLimit || '0'),
                paymentTerms,
            },
        });
        // Log activity
        const authReq = req;
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user?.id,
                action: 'Update',
                entity: 'CustomerProfile',
                details: `Updated customer profile: ${companyName}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Customer updated successfully', customer });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await db_1.default.customerProfile.delete({
            where: { id: parseInt(id) },
        });
        // Log activity
        const authReq = req;
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user?.id,
                action: 'Delete',
                entity: 'CustomerProfile',
                details: `Deleted customer profile: ${profile.companyName}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.deleteCustomer = deleteCustomer;
