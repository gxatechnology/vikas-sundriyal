import { Request, Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateInvoicePDF, generateQuotationPDF } from '../utils/helpers';

export const createInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shipmentId, customerId, dueDate, items, taxRate = 18.0 } = req.body;

    const count = await prisma.invoice.count();
    const invoiceNumber = `GXA-INV-${20000 + count + 1}`;

    // Calculate totals
    const parsedItems = items as { description: string; amount: number }[];
    const subTotal = parsedItems.reduce((acc, item) => acc + parseFloat(String(item.amount)), 0);
    const taxAmount = subTotal * (parseFloat(String(taxRate)) / 100);
    const grandTotal = subTotal + taxAmount;

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          shipmentId: parseInt(shipmentId),
          customerId: parseInt(customerId),
          dueDate: new Date(dueDate),
          subTotal,
          taxRate: parseFloat(String(taxRate)),
          taxAmount,
          grandTotal,
          status: 'Unpaid',
        },
      });

      // Create items
      for (const item of parsedItems) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: newInvoice.id,
            description: item.description,
            amount: parseFloat(String(item.amount)),
          },
        });
      }

      // Log activity
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'Create',
          entity: 'Invoice',
          details: `Generated invoice ${invoiceNumber} for amount INR ${grandTotal.toFixed(2)}`,
          ipAddress: req.ip,
        },
      });

      return newInvoice;
    });

    return res.status(201).json({ message: 'Invoice generated successfully', invoice });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let whereClause: any = {};

    if (req.user?.role === 'CUSTOMER') {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (profile) {
        whereClause.customerId = profile.id;
      } else {
        return res.json({ invoices: [] });
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
        shipment: { select: { shipmentNumber: true } },
      },
      orderBy: { issueDate: 'desc' },
    });

    return res.json({ invoices });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getInvoiceById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        shipment: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.json({ invoice });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const downloadInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        shipment: true,
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    generateInvoicePDF(res, invoice);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const addPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, referenceNumber } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(invoiceId) },
      include: { payments: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const count = await prisma.payment.count();
    const receiptNumber = `GXA-RCP-${30000 + count + 1}`;

    const parsedAmount = parseFloat(amount);

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId: parseInt(invoiceId),
          receiptNumber,
          amount: parsedAmount,
          paymentMethod,
          referenceNumber,
        },
      });

      // Update Invoice Status
      const totalPaid = invoice.payments.reduce((acc, pay) => acc + pay.amount, 0) + parsedAmount;
      let newStatus = 'Partially Paid';
      if (totalPaid >= invoice.grandTotal) {
        newStatus = 'Paid';
      }

      await tx.invoice.update({
        where: { id: parseInt(invoiceId) },
        data: { status: newStatus },
      });

      // Log Activity
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'Create',
          entity: 'Payment',
          details: `Processed payment of INR ${parsedAmount.toFixed(2)} for Invoice ${invoice.invoiceNumber}. Receipt No: ${receiptNumber}`,
          ipAddress: req.ip,
        },
      });

      return newPayment;
    });

    return res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const generateQuotation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyName, contactPerson, email, origin, destination, mode, grossWeight, commodity, charges } = req.body;
    
    const count = await prisma.shipment.count();
    const quoteNumber = `GXA-QT-${40000 + count + 1}`;
    const parsedCharges = charges as { description: string; amount: number }[];
    const totalAmount = parsedCharges.reduce((acc, charge) => acc + parseFloat(String(charge.amount)), 0);

    const quote = {
      quoteNumber,
      companyName,
      contactPerson,
      email,
      origin,
      destination,
      mode,
      grossWeight: parseFloat(grossWeight),
      commodity,
      charges: parsedCharges,
      totalAmount,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Valid for 15 days
    };

    // Return the response as JSON. In real cases, we can also offer download via pdf endpoint
    return res.status(201).json({ message: 'Quotation generated successfully', quote });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const downloadQuotationPDF = async (req: Request, res: Response) => {
  try {
    // Generate a mock quotation dynamically for downloading
    const { companyName, contactPerson, email, origin, destination, mode, grossWeight, commodity, charges, quoteNumber } = req.query;

    const parsedCharges = JSON.parse(String(charges || '[]'));
    const totalAmount = parsedCharges.reduce((acc: number, charge: any) => acc + parseFloat(String(charge.amount)), 0);

    const quote = {
      quoteNumber: String(quoteNumber || 'GXA-QT-40001'),
      companyName: String(companyName || 'GXA Technologies'),
      contactPerson: String(contactPerson || 'Vikas Sundriyal'),
      email: String(email || 'vikas@gxatechnologies.com'),
      origin: String(origin || 'Mumbai'),
      destination: String(destination || 'New York'),
      mode: String(mode || 'Sea'),
      grossWeight: parseFloat(String(grossWeight || '1000')),
      commodity: String(commodity || 'General Cargo'),
      charges: parsedCharges,
      totalAmount,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    };

    generateQuotationPDF(res, quote);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
