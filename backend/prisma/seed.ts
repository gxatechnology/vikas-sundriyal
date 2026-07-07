import { PrismaClient } from '@prisma/client';
import { Role } from '../src/types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GXA Technologies Database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.document.deleteMany();
  await prisma.customsClearance.deleteMany();
  await prisma.transportation.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPassword = bcrypt.hashSync('admin123', saltRounds);
  const employeePassword = bcrypt.hashSync('employee123', saltRounds);
  const customerPassword = bcrypt.hashSync('customer123', saltRounds);

  // 1. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'vikas@gxatechnologies.com',
      password: adminPassword,
      name: 'Vikas Sundriyal',
      role: Role.SUPER_ADMIN,
    },
  });

  const employeeUser = await prisma.user.create({
    data: {
      email: 'tauqeer@gxatechnologies.com',
      password: employeePassword,
      name: 'Tauqeer Ashraf',
      role: Role.EMPLOYEE,
    },
  });

  const operationsMgr = await prisma.user.create({
    data: {
      email: 'operations@gxatechnologies.com',
      password: employeePassword,
      name: 'GXA Tech',
      role: Role.OPERATIONS_MANAGER,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accounts@gxatechnologies.com',
      password: employeePassword,
      name: 'Tauqeer Ashraf',
      role: Role.ACCOUNTANT,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'client@gxatechnologies.com',
      password: customerPassword,
      name: 'Test Vikas',
      role: Role.CUSTOMER,
    },
  });

  console.log('GXA Users successfully seeded.');

  // 2. Create Employee Profiles
  await prisma.employeeProfile.create({
    data: {
      userId: employeeUser.id,
      employeeId: 'EMP2001',
      name: 'Tauqeer Ashraf',
      mobile: '+919988770011',
      role: Role.EMPLOYEE,
      salary: 50000,
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: operationsMgr.id,
      employeeId: 'EMP2002',
      name: 'GXA Tech',
      mobile: '+919988770022',
      role: Role.OPERATIONS_MANAGER,
      salary: 80000,
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: accountant.id,
      employeeId: 'EMP2003',
      name: 'Tauqeer Ashraf',
      mobile: '+919988770033',
      role: Role.ACCOUNTANT,
      salary: 65000,
    },
  });

  console.log('GXA Employee profiles seeded.');

  // 3. Create Customer Profiles
  const clientTestVikas = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      companyName: 'Test Vikas',
      contactPerson: 'Test Vikas',
      mobileNumber: '+919876500111',
      email: 'client@gxatechnologies.com',
      gstNumber: '27GXAAB1111A1Z1',
      panNumber: 'GXAAB1111A',
      address: 'GXA Tech Park, DLF Phase 3',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      postalCode: '122002',
      customerType: 'Importer',
      creditLimit: 750000,
      paymentTerms: 'Net 30',
    },
  });

  const clientABC = await prisma.customerProfile.create({
    data: {
      companyName: 'ABC Manufacturing',
      contactPerson: 'John Smith',
      mobileNumber: '+919876500222',
      email: 'contact@abc.com',
      gstNumber: '06ABCMF2222B2Z2',
      panNumber: 'ABCMF2222B',
      address: 'Industrial Area Phase 1',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      postalCode: '201301',
      customerType: 'Exporter',
      creditLimit: 500000,
      paymentTerms: 'Net 15',
    },
  });

  const clientXYZ = await prisma.customerProfile.create({
    data: {
      companyName: 'XYZ Exporters',
      contactPerson: 'Jane Miller',
      mobileNumber: '+919876500333',
      email: 'info@xyz.com',
      gstNumber: '27XYZEX3333C3Z3',
      panNumber: 'XYZEX3333C',
      address: 'MIDC Industrial Estate',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411018',
      customerType: 'Exporter',
      creditLimit: 400000,
      paymentTerms: 'Net 30',
    },
  });

  const clientGlobalImports = await prisma.customerProfile.create({
    data: {
      companyName: 'Global Import Solutions',
      contactPerson: 'Robert King',
      mobileNumber: '+919876500444',
      email: 'support@globalimports.com',
      gstNumber: '27GBLIP4444D4Z4',
      panNumber: 'GBLIP4444D',
      address: 'JNPT Port Road',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400702',
      customerType: 'Importer',
      creditLimit: 600000,
      paymentTerms: 'Cash on Delivery',
    },
  });

  console.log('GXA Client profiles seeded.');

  // 4. Create Warehouses
  const warehouseDelhi = await prisma.warehouse.create({
    data: {
      name: 'GXA Gurugram Logistics Hub',
      location: 'Sector 34, Gurugram, Haryana',
      capacity: 60000,
    },
  });

  const warehouseMumb = await prisma.warehouse.create({
    data: {
      name: 'GXA JNPT Container Depot',
      location: 'Uran, Navi Mumbai, Maharashtra',
      capacity: 80000,
    },
  });

  // 5. Create Vendors
  await prisma.vendor.create({
    data: {
      name: 'Maersk Line India',
      type: 'Shipping Line',
      contactPerson: 'Sanjay Sharma',
      mobile: '+919876500888',
      email: 'maersk@gxatechnologies.com',
      contractDetails: 'FCL ocean freight carrier agreement',
      performanceScore: 4.9,
    },
  });

  await prisma.vendor.create({
    data: {
      name: 'BlueDart Express',
      type: 'Transport',
      contactPerson: 'Deepak Verma',
      mobile: '+919876500999',
      email: 'bluedart@gxatechnologies.com',
      contractDetails: 'Domestic road cargo transport contract',
      performanceScore: 4.7,
    },
  });

  await prisma.vendor.create({
    data: {
      name: 'Emirates SkyCargo',
      type: 'Airline',
      contactPerson: 'Salim Khan',
      mobile: '+919876500777',
      email: 'emirates@gxatechnologies.com',
      contractDetails: 'International air cargo priority booking contract',
      performanceScore: 4.8,
    },
  });

  console.log('GXA Facilities and Vendors seeded.');

  // 6. Create Shipments
  // Shipment 1: Sea Import FCL (In Transit)
  const shipment1 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'GXA-SH-10001',
      customerId: clientTestVikas.id,
      shipmentType: 'FCL',
      direction: 'Import',
      mode: 'Sea',
      origin: 'Shenzhen Port, China',
      destination: 'Nhava Sheva Port, Mumbai',
      consigneeName: 'Test Vikas',
      consigneeAddress: 'GXA Tech Park, DLF Phase 3, Gurugram',
      shipperName: 'GXA Technologies Supplier China',
      shipperAddress: 'Industrial Zone, Shenzhen, China',
      commodity: 'High-End Tech Hardware (Routers & Servers)',
      grossWeight: 14200,
      netWeight: 13800,
      volume: 42,
      packagesCount: 180,
      containerNumber: 'GXAU8877665',
      containerSize: '40ft',
      carrier: 'Maersk Line India',
      vesselName: 'GXA McKinney Moller',
      etd: new Date('2026-06-22T08:00:00Z'),
      eta: new Date('2026-07-18T18:00:00Z'),
      status: 'In Transit',
      currentLat: 14.5678,
      currentLng: 79.1234,
    },
  });

  await prisma.customsClearance.create({
    data: {
      shipmentId: shipment1.id,
      type: 'Import',
      billOfEntry: 'BOE-GXA-998877',
      dutyAmount: 280000,
      status: 'Pending',
    },
  });

  await prisma.transportation.create({
    data: {
      shipmentId: shipment1.id,
      vehicleNumber: 'HR-55-GXA-9988',
      driverName: 'Ramesh Kumar',
      driverContact: '+919888877777',
      routeDetails: 'Nhava Sheva Port -> Gurugram Warehouse',
      status: 'Pending',
    },
  });

  // Shipment 2: Air Import Cargo (Delivered)
  const shipment2 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'GXA-SH-10002',
      customerId: clientTestVikas.id,
      shipmentType: 'Air Cargo',
      direction: 'Import',
      mode: 'Air',
      origin: 'Incheon Airport, South Korea',
      destination: 'IGI Airport, Delhi',
      consigneeName: 'Test Vikas',
      consigneeAddress: 'GXA Tech Park, Gurugram',
      shipperName: 'GXA Micro Korea',
      shipperAddress: 'Science Park, Seoul, Korea',
      commodity: 'Integrated Circuit Boards',
      grossWeight: 920,
      netWeight: 890,
      volume: 4.2,
      packagesCount: 22,
      carrier: 'Emirates SkyCargo',
      flightNumber: 'EK-GXA-501',
      etd: new Date('2026-07-02T10:00:00Z'),
      eta: new Date('2026-07-03T18:00:00Z'),
      deliveryDate: new Date('2026-07-04T12:00:00Z'),
      status: 'Delivered',
      currentLat: 28.5562,
      currentLng: 77.1000,
    },
  });

  await prisma.customsClearance.create({
    data: {
      shipmentId: shipment2.id,
      type: 'Import',
      billOfEntry: 'BOE-GXA-887766',
      dutyAmount: 110000,
      status: 'Cleared',
      clearanceDate: new Date('2026-07-03T20:00:00Z'),
    },
  });

  await prisma.transportation.create({
    data: {
      shipmentId: shipment2.id,
      vehicleNumber: 'HR-55-GXA-1234',
      driverName: 'Sohan Singh',
      driverContact: '+919888866666',
      routeDetails: 'Delhi IGI Airport -> Gurugram HQ',
      status: 'Delivered',
      pickupTime: new Date('2026-07-04T09:00:00Z'),
      deliveryTime: new Date('2026-07-04T12:00:00Z'),
    },
  });

  // Shipment 3: Road Export Cargo (Booked)
  const shipment3 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'GXA-SH-10003',
      customerId: clientABC.id,
      shipmentType: 'Road Cargo',
      direction: 'Export',
      mode: 'Road',
      origin: 'Noida Factory, UP',
      destination: 'Nhava Sheva Port, Mumbai',
      consigneeName: 'GXA Technologies Middle East FZE',
      consigneeAddress: 'Jebel Ali Free Zone, Dubai, UAE',
      shipperName: 'ABC Manufacturing',
      shipperAddress: 'Industrial Area, Noida, UP',
      commodity: 'Precision Mechanical Seals',
      grossWeight: 5200,
      volume: 20,
      packagesCount: 95,
      vehicleNumber: 'MH-12-GXA-5544',
      carrier: 'BlueDart Express',
      etd: new Date('2026-07-12T06:00:00Z'),
      eta: new Date('2026-07-15T18:00:00Z'),
      status: 'Booked',
      currentLat: 28.6139,
      currentLng: 77.2090,
    },
  });

  await prisma.customsClearance.create({
    data: {
      shipmentId: shipment3.id,
      type: 'Export',
      shippingBill: 'SB-GXA-334455',
      status: 'Pending',
    },
  });

  await prisma.transportation.create({
    data: {
      shipmentId: shipment3.id,
      vehicleNumber: 'MH-12-GXA-5544',
      driverName: 'Vikram Jadhav',
      driverContact: '+919877766555',
      routeDetails: 'Noida Factory -> Nhava Sheva Port',
      status: 'Pending',
    },
  });

  console.log('GXA Cargo Shipments seeded.');

  // 7. Create Invoices
  // Invoice for Shipment 2 (Paid)
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'GXA-INV-20001',
      shipmentId: shipment2.id,
      customerId: clientTestVikas.id,
      issueDate: new Date('2026-07-04T13:00:00Z'),
      dueDate: new Date('2026-08-04T13:00:00Z'),
      subTotal: 95000,
      taxRate: 18.0,
      taxAmount: 17100,
      grandTotal: 112100,
      status: 'Paid',
      paymentTerms: 'Net 30',
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      description: 'Air Freight charges: Incheon to Delhi IGI',
      amount: 75000,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      description: 'Customs Brokerage Agency Fees',
      amount: 10000,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      description: 'Last Mile Dispatch Delivery (IGI to Gurugram)',
      amount: 10000,
    },
  });

  // Record Payment
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      receiptNumber: 'GXA-RCP-30001',
      paymentDate: new Date('2026-07-05T11:00:00Z'),
      amount: 112100,
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'TXNGXA987654321',
    },
  });

  // Invoice for Shipment 1 (Unpaid)
  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'GXA-INV-20002',
      shipmentId: shipment1.id,
      customerId: clientTestVikas.id,
      issueDate: new Date('2026-07-05T10:00:00Z'),
      dueDate: new Date('2026-08-05T10:00:00Z'),
      subTotal: 175000,
      taxRate: 18.0,
      taxAmount: 31500,
      grandTotal: 206500,
      status: 'Unpaid',
      paymentTerms: 'Net 30',
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice2.id,
      description: 'Ocean Freight charges (40ft Container, Shenzhen to Nhava Sheva)',
      amount: 145000,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice2.id,
      description: 'Destination Port Terminal Handling Charges (DTHC)',
      amount: 30000,
    },
  });

  console.log('GXA Billing invoices seeded.');

  // 8. Create Support Tickets
  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'GXA-TKT-50001',
      title: 'Status Update for Cargo GXA-SH-10001',
      description: 'The shipment is showing delayed arrival at Nhava Sheva Port. Can we get an updated tracking map link?',
      status: 'Open',
      priority: 'High',
      createdById: customerUser.id,
    },
  });

  console.log('Support tickets seeded.');

  // 9. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'Create',
      entity: 'System',
      details: 'System database successfully refactored and seeded with GXA Technologies logistics records.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('GXA Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
