import jwt from 'jsonwebtoken';
import { Role } from '../types';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlogisticserpjwttokenkey123!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretlogisticserprefreshjwttokenkey123!';

export const generateAccessToken = (user: { id: number; email: string; role: string }) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: { id: number; email: string; role: string }) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Generates an invoice PDF and pipes it to the response stream
export const generateInvoicePDF = (res: Response, invoice: any) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the PDF to the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
  doc.pipe(res);

  // Header Layout
  doc.fillColor('#1e293b')
     .fontSize(20)
     .text('GXA TECHNOLOGIES LOGISTICS ERP', 50, 45, { align: 'left' });
  doc.fontSize(10)
     .fillColor('#64748b')
     .text('123 Logistics Boulevard, Cargo City, India', 50, 70)
     .text('Email: info@gxatechnologies.com | GSTIN: 27GXAAB1111A1Z1', 50, 85);

  doc.fontSize(16)
     .fillColor('#0f172a')
     .text('TAX INVOICE', 400, 45, { align: 'right' });

  doc.fontSize(10)
     .fillColor('#475569')
     .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 70, { align: 'right' })
     .text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 400, 85, { align: 'right' })
     .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 100, { align: 'right' });

  // Divider Line
  doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#e2e8f0').stroke();

  // Customer Section
  doc.fontSize(12)
     .fillColor('#0f172a')
     .text('Bill To:', 50, 140)
     .fontSize(10)
     .fillColor('#334155')
     .text(invoice.customer.companyName, 50, 155)
     .text(`Contact: ${invoice.customer.contactPerson}`, 50, 170)
     .text(`GSTIN: ${invoice.customer.gstNumber || 'N/A'}`, 50, 185)
     .text(`${invoice.customer.address}, ${invoice.customer.city}, ${invoice.customer.state}`, 50, 200);

  // Shipment Section
  doc.fontSize(12)
     .fillColor('#0f172a')
     .text('Shipment Info:', 350, 140)
     .fontSize(10)
     .fillColor('#334155')
     .text(`Shipment No: ${invoice.shipment.shipmentNumber}`, 350, 155)
     .text(`Type: ${invoice.shipment.shipmentType} (${invoice.shipment.direction})`, 350, 170)
     .text(`Route: ${invoice.shipment.origin} -> ${invoice.shipment.destination}`, 350, 185)
     .text(`Gross Weight: ${invoice.shipment.grossWeight} kg`, 350, 200);

  // Divider Line
  doc.moveTo(50, 225).lineTo(550, 225).strokeColor('#e2e8f0').stroke();

  // Invoice Items Table Headers
  let y = 245;
  doc.fontSize(10).fillColor('#0f172a');
  doc.text('Description', 50, y);
  doc.text('Amount (INR)', 450, y, { align: 'right' });

  doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#cbd5e1').stroke();
  y += 25;

  // Invoice Items
  invoice.items.forEach((item: any) => {
    doc.fillColor('#475569').text(item.description, 50, y);
    doc.text(item.amount.toFixed(2), 450, y, { align: 'right' });
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
  y += 15;

  // Invoice Totals
  doc.fillColor('#475569').text('Subtotal:', 350, y);
  doc.text(invoice.subTotal.toFixed(2), 450, y, { align: 'right' });
  y += 18;

  doc.text(`GST (${invoice.taxRate}%):`, 350, y);
  doc.text(invoice.taxAmount.toFixed(2), 450, y, { align: 'right' });
  y += 20;

  doc.fontSize(12).fillColor('#0f172a').text('Grand Total (INR):', 350, y);
  doc.text(invoice.grandTotal.toFixed(2), 450, y, { align: 'right' });

  // Signature / Footer
  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('Thank you for your business. Terms & Conditions apply.', 50, 700, { align: 'center' });

  doc.end();
};

// Generates a Quotation PDF and pipes it to the response stream
export const generateQuotationPDF = (res: Response, quote: any) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Quotation-${quote.quoteNumber}.pdf`);
  doc.pipe(res);

  // Header Layout
  doc.fillColor('#1e293b')
     .fontSize(20)
     .text('GXA TECHNOLOGIES LOGISTICS ERP', 50, 45, { align: 'left' });
  doc.fontSize(10)
     .fillColor('#64748b')
     .text('123 Logistics Boulevard, Cargo City, India', 50, 70);

  doc.fontSize(16)
     .fillColor('#0f172a')
     .text('FREIGHT QUOTATION', 400, 45, { align: 'right' });

  doc.fontSize(10)
     .fillColor('#475569')
     .text(`Quote Ref: ${quote.quoteNumber}`, 400, 70, { align: 'right' })
     .text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 400, 85, { align: 'right' })
     .text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 400, 100, { align: 'right' });

  doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#e2e8f0').stroke();

  // Customer / Lead Section
  doc.fontSize(12)
     .fillColor('#0f172a')
     .text('Prepared For:', 50, 140)
     .fontSize(10)
     .fillColor('#334155')
     .text(quote.companyName, 50, 155)
     .text(`Contact: ${quote.contactPerson}`, 50, 170)
     .text(`Email: ${quote.email}`, 50, 185);

  // Freight Details
  doc.fontSize(12)
     .fillColor('#0f172a')
     .text('Cargo & Route Info:', 350, 140)
     .fontSize(10)
     .fillColor('#334155')
     .text(`Origin: ${quote.origin}`, 350, 155)
     .text(`Destination: ${quote.destination}`, 350, 170)
     .text(`Mode: ${quote.mode} Freight`, 350, 185)
     .text(`Est. Gross Weight: ${quote.grossWeight} kg`, 350, 200)
     .text(`Commodity: ${quote.commodity}`, 350, 215);

  doc.moveTo(50, 235).lineTo(550, 235).strokeColor('#e2e8f0').stroke();

  // Price breakdown
  let y = 255;
  doc.fontSize(10).fillColor('#0f172a');
  doc.text('Charge Component', 50, y);
  doc.text('Amount (INR)', 450, y, { align: 'right' });

  doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#cbd5e1').stroke();
  y += 25;

  quote.charges.forEach((charge: any) => {
    doc.fillColor('#475569').text(charge.description, 50, y);
    doc.text(charge.amount.toFixed(2), 450, y, { align: 'right' });
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
  y += 15;

  doc.fontSize(12).fillColor('#0f172a').text('Total Estimated Charges (INR):', 300, y);
  doc.text(quote.totalAmount.toFixed(2), 450, y, { align: 'right' });

  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('Subject to local duties and standard shipping rules. Prepared automatically by GXA Technologies Logistics ERP.', 50, 700, { align: 'center' });

  doc.end();
};
