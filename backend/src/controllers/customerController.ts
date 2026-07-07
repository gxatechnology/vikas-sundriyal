import { Request, Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllCustomers = async (req: Request, res: Response) => {
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

    const customers = await prisma.customerProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true } },
      },
    });

    return res.json({ customers });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customerProfile.findUnique({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
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
      creditLimit,
      paymentTerms,
    } = req.body;

    const customer = await prisma.customerProfile.create({
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
    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Create',
        entity: 'CustomerProfile',
        details: `Created customer profile: ${companyName}`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
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
      creditLimit,
      paymentTerms,
    } = req.body;

    const customer = await prisma.customerProfile.update({
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
    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Update',
        entity: 'CustomerProfile',
        details: `Updated customer profile: ${companyName}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Customer updated successfully', customer });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await prisma.customerProfile.delete({
      where: { id: parseInt(id) },
    });

    // Log activity
    const authReq = req as AuthenticatedRequest;
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.id,
        action: 'Delete',
        entity: 'CustomerProfile',
        details: `Deleted customer profile: ${profile.companyName}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
