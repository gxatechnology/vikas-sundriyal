import { Request, Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, type, contactPerson, mobile, email, contractDetails, performanceScore } = req.body;
    const vendor = await prisma.vendor.create({
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

    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Create',
        entity: 'Vendor',
        details: `Created vendor profile: ${name} (${type})`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({ message: 'Vendor profile created successfully', vendor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ vendors });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, contactPerson, mobile, email, contractDetails, performanceScore } = req.body;

    const vendor = await prisma.vendor.update({
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

    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Update',
        entity: 'Vendor',
        details: `Updated vendor details for: ${name}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Vendor details updated successfully', vendor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.delete({
      where: { id: parseInt(id) },
    });

    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Delete',
        entity: 'Vendor',
        details: `Deleted vendor profile: ${vendor.name}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Vendor deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
