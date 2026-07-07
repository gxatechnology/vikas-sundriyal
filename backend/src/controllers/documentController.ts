import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type, shipmentId, customerId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // File URL will point to our static endpoint
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const document = await prisma.document.create({
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

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'Create',
        entity: 'Document',
        details: `Uploaded document: ${document.name} of type ${type}`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let whereClause: any = {};

    if (req.user?.role === 'CUSTOMER') {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (profile) {
        whereClause.OR = [
          { customerId: profile.id },
          { shipment: { customerId: profile.id } },
        ];
      } else {
        return res.json({ documents: [] });
      }
    }

    const documents = await prisma.document.findMany({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const approveDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const document = await prisma.document.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedById: req.user.id,
      },
      include: {
        uploadedBy: { select: { email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'Approve',
        entity: 'Document',
        details: `Set status of document ${document.name} to ${status}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: `Document status set to ${status}`, document });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
