import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateCustomsClearance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const { billOfEntry, shippingBill, dutyAmount, status, remarks, clearanceDate } = req.body;

    const customs = await prisma.customsClearance.update({
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
    await prisma.auditLog.create({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getCustomsStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customsList = await prisma.customsClearance.findMany({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
