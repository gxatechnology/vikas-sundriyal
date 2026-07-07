"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportationList = exports.updateTransportation = exports.updateInventoryItem = exports.getInventory = exports.addInventoryItem = exports.getAllWarehouses = exports.createWarehouse = void 0;
const db_1 = __importDefault(require("../db"));
// Warehousing
const createWarehouse = async (req, res) => {
    try {
        const { name, location, capacity } = req.body;
        const warehouse = await db_1.default.warehouse.create({
            data: { name, location, capacity: parseFloat(capacity || '0') },
        });
        return res.status(201).json({ message: 'Warehouse created successfully', warehouse });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.createWarehouse = createWarehouse;
const getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await db_1.default.warehouse.findMany({
            include: { inventory: true },
        });
        return res.json({ warehouses });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getAllWarehouses = getAllWarehouses;
const addInventoryItem = async (req, res) => {
    try {
        const { warehouseId, cargoDescription, shipmentNumber, rackLocation, quantity, status } = req.body;
        const item = await db_1.default.inventory.create({
            data: {
                warehouseId: parseInt(warehouseId),
                cargoDescription,
                shipmentNumber,
                rackLocation,
                quantity: parseInt(quantity || '1'),
                status,
                movementLog: `Received in warehouse by User ID ${req.user?.id} at ${new Date().toISOString()}`,
            },
        });
        return res.status(201).json({ message: 'Inventory item recorded', item });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.addInventoryItem = addInventoryItem;
const getInventory = async (req, res) => {
    try {
        const inventory = await db_1.default.inventory.findMany({
            include: { warehouse: { select: { name: true } } },
        });
        return res.json({ inventory });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getInventory = getInventory;
const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rackLocation, movementNote } = req.body;
        const item = await db_1.default.inventory.findUnique({ where: { id: parseInt(id) } });
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        const logMessage = `\nMoved/Updated status to ${status} at rack ${rackLocation || item.rackLocation}. Note: ${movementNote || 'None'} on ${new Date().toISOString()}`;
        const updatedItem = await db_1.default.inventory.update({
            where: { id: parseInt(id) },
            data: {
                status,
                rackLocation,
                movementLog: (item.movementLog || '') + logMessage,
            },
        });
        return res.json({ message: 'Inventory updated successfully', item: updatedItem });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateInventoryItem = updateInventoryItem;
// Transportation
const updateTransportation = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const { vehicleNumber, driverName, driverContact, routeDetails, fuelCost, pickupTime, deliveryTime, emptyReturnDate, status, } = req.body;
        const transport = await db_1.default.transportation.update({
            where: { shipmentId: parseInt(shipmentId) },
            data: {
                vehicleNumber,
                driverName,
                driverContact,
                routeDetails,
                fuelCost: fuelCost ? parseFloat(fuelCost) : undefined,
                status,
                pickupTime: pickupTime ? new Date(pickupTime) : undefined,
                deliveryTime: deliveryTime ? new Date(deliveryTime) : undefined,
                emptyReturnDate: emptyReturnDate ? new Date(emptyReturnDate) : undefined,
            },
            include: {
                shipment: { select: { shipmentNumber: true } },
            },
        });
        // Log activity
        const authReq = req;
        await db_1.default.auditLog.create({
            data: {
                userId: authReq.user?.id,
                action: 'Update',
                entity: 'Transportation',
                details: `Updated transportation logistics for shipment ${transport.shipment.shipmentNumber}. Status: ${status}`,
                ipAddress: req.ip,
            },
        });
        return res.json({ message: 'Transportation details updated successfully', transport });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.updateTransportation = updateTransportation;
const getTransportationList = async (req, res) => {
    try {
        const transportList = await db_1.default.transportation.findMany({
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
        return res.json({ transportList });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getTransportationList = getTransportationList;
