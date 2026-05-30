import { getDashboardMetrics } from './analyticsController';
import prisma from '../utils/prisma';

// Mock prisma methods
jest.mock('../utils/prisma', () => ({
  sale: { findMany: jest.fn() },
  expense: { findMany: jest.fn() },
  product: { findMany: jest.fn() },
  service: { findMany: jest.fn() },
  debt: { findMany: jest.fn() },
  mobileMoneyTransaction: { findMany: jest.fn() },
  debtPayment: { findMany: jest.fn() },
}));

const mockReq: any = {};

const mockRes = () => {
  const res: any = {};
  res.json = jest.fn();
  return res;
};

describe('getDashboardMetrics', () => {
  beforeEach(() => jest.resetAllMocks());

  it('calculates totalDebtPayments and outstanding debt correctly', async () => {
    const sales: any[] = [];
    const services: any[] = [];
    const expenses: any[] = [];
    const products: any[] = [];
    const debts = [ { id: 'd1', remainingAmount: 500 }, { id: 'd2', remainingAmount: 300 } ];
    const mobileTransactions: any[] = [];
    const debtPayments = [ { id: 'p1', paymentMethod: 'CASH', amount: 200 }, { id: 'p2', paymentMethod: 'MOMO', amount: 100 } ];

    (prisma.sale.findMany as jest.Mock).mockResolvedValue(sales);
    (prisma.service.findMany as jest.Mock).mockResolvedValue(services);
    (prisma.expense.findMany as jest.Mock).mockResolvedValue(expenses);
    (prisma.product.findMany as jest.Mock).mockResolvedValue(products);
    (prisma.debt.findMany as jest.Mock).mockResolvedValue(debts);
    (prisma.mobileMoneyTransaction.findMany as jest.Mock).mockResolvedValue(mobileTransactions);
    (prisma.debtPayment.findMany as jest.Mock).mockResolvedValue(debtPayments);

    const res = mockRes();
    await getDashboardMetrics(mockReq, res);

    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.totalDebtPaymentsCash).toBe(200);
    expect(payload.totalDebtPaymentsMomo).toBe(100);
    expect(payload.debtBalance).toBe(800);
  });
});
