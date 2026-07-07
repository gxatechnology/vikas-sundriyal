import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, priority } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${50000 + count + 1}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority: priority || 'Medium',
        createdById: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'Create',
        entity: 'SupportTicket',
        details: `Opened support ticket: ${ticketNumber}`,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({ message: 'Ticket raised successfully', ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let whereClause = {};
    if (req.user?.role === 'CUSTOMER') {
      whereClause = { createdById: req.user.id };
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ tickets });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id: parseInt(id) },
      data: { status, updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'Update',
        entity: 'SupportTicket',
        details: `Updated ticket ${ticket.ticketNumber} status to ${status}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Ticket status updated', ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
