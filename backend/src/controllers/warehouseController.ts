import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

// Warehousing
export const createWarehouse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, location, capacity } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, location, capacity: parseFloat(capacity || '0') },
    });
    return res.status(201).json({ message: 'Warehouse created successfully', warehouse });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllWarehouses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { inventory: true },
    });
    return res.json({ warehouses });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const addInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { warehouseId, cargoDescription, shipmentNumber, rackLocation, quantity, status } = req.body;
    const item = await prisma.inventory.create({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: { warehouse: { select: { name: true } } },
    });
    return res.json({ inventory });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rackLocation, movementNote } = req.body;

    const item = await prisma.inventory.findUnique({ where: { id: parseInt(id) } });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const logMessage = `\nMoved/Updated status to ${status} at rack ${rackLocation || item.rackLocation}. Note: ${movementNote || 'None'} on ${new Date().toISOString()}`;

    const updatedItem = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        status,
        rackLocation,
        movementLog: (item.movementLog || '') + logMessage,
      },
    });

    return res.json({ message: 'Inventory updated successfully', item: updatedItem });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Transportation
export const updateTransportation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const {
      vehicleNumber,
      driverName,
      driverContact,
      routeDetails,
      fuelCost,
      pickupTime,
      deliveryTime,
      emptyReturnDate,
      status,
    } = req.body;

    const transport = await prisma.transportation.update({
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
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'Update',
        entity: 'Transportation',
        details: `Updated transportation logistics for shipment ${transport.shipment.shipmentNumber}. Status: ${status}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Transportation details updated successfully', transport });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getTransportationList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transportList = await prisma.transportation.findMany({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
