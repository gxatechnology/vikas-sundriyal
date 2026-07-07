"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const db_1 = __importDefault(require("../db"));
const getDashboardMetrics = async (req, res) => {
    try {
        const authReq = req;
        let customerWhere = {};
        let shipmentWhere = {};
        let invoiceWhere = {};
        // If user is a customer, restrict stats to their profile
        if (authReq.user?.role === 'CUSTOMER') {
            const customerProfile = await db_1.default.customerProfile.findUnique({
                where: { userId: authReq.user.id },
            });
            if (customerProfile) {
                const cId = customerProfile.id;
                shipmentWhere.customerId = cId;
                invoiceWhere.customerId = cId;
            }
            else {
                return res.json({
                    totalCustomers: 0,
                    activeShipments: 0,
                    deliveredShipments: 0,
                    pendingShipments: 0,
                    customsPending: 0,
                    todaysDeliveries: 0,
                    totalRevenue: 0,
                    statusChartData: [],
                    recentActivities: [],
                });
            }
        }
        // 1. Total Customers
        const totalCustomers = await db_1.default.customerProfile.count();
        // 2. Active Shipments (booked -> out for delivery)
        const activeShipments = await db_1.default.shipment.count({
            where: {
                ...shipmentWhere,
                status: { in: ['Booked', 'Picked Up', 'At Warehouse', 'Customs Clearance', 'Loaded', 'In Transit', 'Arrived', 'Out For Delivery'] },
            },
        });
        // 3. Delivered Shipments
        const deliveredShipments = await db_1.default.shipment.count({
            where: {
                ...shipmentWhere,
                status: 'Delivered',
            },
        });
        // 4. Pending Shipments (booked or picked up)
        const pendingShipments = await db_1.default.shipment.count({
            where: {
                ...shipmentWhere,
                status: { in: ['Inquiry', 'Quotation', 'Booked'] },
            },
        });
        // 5. Customs Clearance Pending
        const customsPending = await db_1.default.customsClearance.count({
            where: {
                status: { not: 'Cleared' },
                shipment: authReq.user?.role === 'CUSTOMER' ? shipmentWhere : undefined,
            },
        });
        // 6. Today's Deliveries
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todaysDeliveries = await db_1.default.shipment.count({
            where: {
                ...shipmentWhere,
                deliveryDate: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        // 7. Revenue Summary (Sum of paid invoices)
        const invoices = await db_1.default.invoice.findMany({
            where: {
                ...invoiceWhere,
                status: 'Paid',
            },
            select: { grandTotal: true },
        });
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        // 8. Shipment Status Chart Data
        const rawStatusCounts = await db_1.default.shipment.groupBy({
            by: ['status'],
            where: shipmentWhere,
            _count: {
                status: true,
            },
        });
        const statusChartData = rawStatusCounts.map(item => ({
            status: item.status,
            count: item._count.status,
        }));
        // 9. Recent Activities (Audit Log)
        const recentActivities = await db_1.default.auditLog.findMany({
            take: 10,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, role: true } } },
        });
        return res.json({
            totalCustomers,
            activeShipments,
            deliveredShipments,
            pendingShipments,
            customsPending,
            todaysDeliveries,
            totalRevenue,
            statusChartData,
            recentActivities,
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
