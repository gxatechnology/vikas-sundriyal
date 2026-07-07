import { Request, Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createShipment = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      shipmentType,
      direction,
      mode,
      origin,
      destination,
      consigneeName,
      consigneeAddress,
      shipperName,
      shipperAddress,
      commodity,
      grossWeight,
      netWeight,
      volume,
      packagesCount,
      containerNumber,
      containerSize,
      carrier,
      vesselName,
      flightNumber,
      vehicleNumber,
      etd,
      eta,
    } = req.body;

    const count = await prisma.shipment.count();
    const shipmentNumber = `GXA-SH-${10000 + count + 1}`;

    const shipment = await prisma.$transaction(async (tx) => {
      const newShipment = await tx.shipment.create({
        data: {
          shipmentNumber,
          customerId: parseInt(customerId),
          shipmentType,
          direction,
          mode,
          origin,
          destination,
          consigneeName,
          consigneeAddress,
          shipperName,
          shipperAddress,
          commodity,
          grossWeight: parseFloat(grossWeight || '0'),
          netWeight: netWeight ? parseFloat(netWeight) : null,
          volume: volume ? parseFloat(volume) : null,
          packagesCount: parseInt(packagesCount || '1'),
          containerNumber,
          containerSize,
          carrier,
          vesselName,
          flightNumber,
          vehicleNumber,
          etd: etd ? new Date(etd) : null,
          eta: eta ? new Date(eta) : null,
          status: 'Inquiry',
          currentLat: 19.0760, // Default coordinates (e.g. Mumbai)
          currentLng: 72.8777,
        },
      });

      // Automatically create empty customs clearance tracking
      await tx.customsClearance.create({
        data: {
          shipmentId: newShipment.id,
          type: direction,
          status: 'Pending',
        },
      });

      // Automatically create empty transportation tracking
      await tx.transportation.create({
        data: {
          shipmentId: newShipment.id,
          status: 'Pending',
          pickupLocation: origin,
          deliveryLocation: destination,
        },
      });

      // Log activity
      const authReq = req as AuthenticatedRequest;
      await tx.auditLog.create({
        data: {
          userId: authReq.user?.id,
          action: 'Create',
          entity: 'Shipment',
          details: `Created shipment ${shipmentNumber}`,
          ipAddress: req.ip,
        },
      });

      return newShipment;
    });

    return res.status(201).json({ message: 'Shipment booked successfully', shipment });
  } catch (error: any) {
    console.error('Create shipment error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllShipments = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { search, status, mode } = req.query;

    let whereClause: any = {};

    // Filter by customer if user is CUSTOMER
    if (authReq.user?.role === 'CUSTOMER') {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: authReq.user.id },
      });
      if (customerProfile) {
        whereClause.customerId = customerProfile.id;
      } else {
        return res.json({ shipments: [] });
      }
    }

    if (status) {
      whereClause.status = String(status);
    }
    if (mode) {
      whereClause.mode = String(mode);
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { shipmentNumber: { contains: searchStr } },
        { containerNumber: { contains: searchStr } },
        { origin: { contains: searchStr } },
        { destination: { contains: searchStr } },
        { carrier: { contains: searchStr } },
        { customer: { companyName: { contains: searchStr } } },
      ];
    }

    const shipments = await prisma.shipment.findMany({
      where: whereClause,
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });

    return res.json({ shipments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getShipmentById = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        customs: true,
        transport: true,
        documents: {
          include: {
            uploadedBy: { select: { name: true } },
            approvedBy: { select: { name: true } },
          },
        },
        invoices: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Customer can only view their own shipments
    if (authReq.user?.role === 'CUSTOMER') {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: authReq.user.id },
      });
      if (!profile || shipment.customerId !== profile.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    return res.json({ shipment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const oldShipment = await prisma.shipment.findUnique({ where: { id: parseInt(id) } });
    if (!oldShipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const updateData: any = { status };
    if (status === 'Delivered') {
      updateData.deliveryDate = new Date();
    }

    const shipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Log activity
    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Update',
        entity: 'Shipment',
        details: `Updated shipment status from ${oldShipment.status} to ${status}. Remarks: ${remarks || 'None'}`,
        ipAddress: req.ip,
      },
    });

    // Real-time notification with socket io
    const io = req.app.get('io');
    if (io) {
      io.emit('shipmentStatusUpdate', {
        shipmentId: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        status,
        updatedAt: shipment.updatedAt,
      });
    }

    return res.json({ message: 'Status updated successfully', shipment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateShipmentLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const shipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        currentLat: parseFloat(lat),
        currentLng: parseFloat(lng),
      },
    });

    // Real-time tracking push
    const io = req.app.get('io');
    if (io) {
      io.emit('locationUpdate', {
        shipmentId: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        lat: shipment.currentLat,
        lng: shipment.currentLng,
      });
    }

    return res.json({ message: 'Location tracking updated', shipment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateFreightDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      carrier,
      vesselName,
      flightNumber,
      vehicleNumber,
      containerNumber,
      containerSize,
      etd,
      eta,
    } = req.body;

    const shipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        carrier,
        vesselName,
        flightNumber,
        vehicleNumber,
        containerNumber,
        containerSize,
        etd: etd ? new Date(etd) : null,
        eta: eta ? new Date(eta) : null,
      },
    });

    // Log Activity
    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Update',
        entity: 'Shipment',
        details: `Updated freight carrier details for shipment ${shipment.shipmentNumber}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Freight details updated successfully', shipment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
