const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const invalidSales = await prisma.sale.findMany({
      where: {
        totalAmount: { gt: 0 },
        paidAmount: 0,
        remainingAmount: 0,
        isDebt: false,
      },
    });

    const invalidServices = await prisma.service.findMany({
      where: {
        amount: { gt: 0 },
        paidAmount: 0,
        remainingAmount: 0,
        isDebt: false,
      },
    });

    const nullDebtPayments = await prisma.debtPayment.findMany({
      where: { paymentMethod: null },
    });

    console.log('invalidSales', invalidSales.length);
    console.log('invalidServices', invalidServices.length);
    console.log('nullDebtPayments', nullDebtPayments.length);

    for (const sale of invalidSales) {
      const updatedSale = await prisma.sale.update({
        where: { id: sale.id },
        data: {
          paidAmount: sale.totalAmount,
          remainingAmount: 0,
          isDebt: false,
        },
      });
      console.log('fixed sale', updatedSale.id);
    }

    for (const svc of invalidServices) {
      const updatedService = await prisma.service.update({
        where: { id: svc.id },
        data: {
          paidAmount: svc.amount,
          remainingAmount: 0,
          isDebt: false,
        },
      });
      console.log('fixed service', updatedService.id);
    }

    for (const payment of nullDebtPayments) {
      const updatedPayment = await prisma.debtPayment.update({
        where: { id: payment.id },
        data: {
          paymentMethod: 'CASH',
        },
      });
      console.log('fixed paymentMethod', updatedPayment.id);
    }

    const inconsistentSales = await prisma.sale.findMany({
      where: {
        totalAmount: { gt: 0 },
        OR: [
          { paidAmount: { not: 0 }, remainingAmount: { not: { equals: 0 } } },
          { paidAmount: 0, remainingAmount: { not: 0 } },
        ],
      },
    });

    for (const sale of inconsistentSales) {
      const correctedRemaining = Math.max(sale.totalAmount - sale.paidAmount, 0);
      const correctedIsDebt = correctedRemaining > 0;
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          remainingAmount: correctedRemaining,
          isDebt: correctedIsDebt,
        },
      });
      console.log('normalized sale', sale.id);
    }

    const inconsistentServices = await prisma.service.findMany({
      where: {
        amount: { gt: 0 },
        OR: [
          { paidAmount: { not: 0 }, remainingAmount: { not: { equals: 0 } } },
          { paidAmount: 0, remainingAmount: { not: 0 } },
        ],
      },
    });

    for (const svc of inconsistentServices) {
      const correctedRemaining = Math.max(svc.amount - svc.paidAmount, 0);
      const correctedIsDebt = correctedRemaining > 0;
      await prisma.service.update({
        where: { id: svc.id },
        data: {
          remainingAmount: correctedRemaining,
          isDebt: correctedIsDebt,
        },
      });
      console.log('normalized service', svc.id);
    }

    const inconsistentDebts = await prisma.debt.findMany({
      where: {
        OR: [
          { paidAmount: { not: 0 }, remainingAmount: { not: { equals: 0 } } },
          { totalOwed: { not: 0 }, paidAmount: 0, remainingAmount: { not: { equals: 0 } } },
        ],
      },
    });

    for (const debt of inconsistentDebts) {
      const correctedRemaining = Math.max(debt.totalOwed - debt.paidAmount, 0);
      const correctedStatus = correctedRemaining === 0 ? 'CLOSED' : debt.paidAmount > 0 ? 'PARTIAL' : 'OPEN';
      await prisma.debt.update({
        where: { id: debt.id },
        data: {
          remainingAmount: correctedRemaining,
          status: correctedStatus,
        },
      });
      console.log('normalized debt', debt.id);
    }

    console.log('cleanup complete');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
