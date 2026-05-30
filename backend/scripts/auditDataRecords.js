const { PrismaClient } = require('@prisma/client');

const normalizeFloat = (value) => Number(Number(value).toFixed(2));

const isInconsistentSale = (sale) => {
  const hasNegative = sale.paidAmount < 0 || sale.remainingAmount < 0;
  const sumsMismatch = normalizeFloat(sale.paidAmount + sale.remainingAmount) !== normalizeFloat(sale.totalAmount);
  const invalidDebtFlag = (!sale.isDebt && sale.remainingAmount > 0) || (sale.isDebt && sale.remainingAmount <= 0);
  return hasNegative || sumsMismatch || invalidDebtFlag;
};

const isInconsistentService = (service) => {
  const hasNegative = service.paidAmount < 0 || service.remainingAmount < 0;
  const sumsMismatch = normalizeFloat(service.paidAmount + service.remainingAmount) !== normalizeFloat(service.amount);
  const invalidDebtFlag = (!service.isDebt && service.remainingAmount > 0) || (service.isDebt && service.remainingAmount <= 0);
  return hasNegative || sumsMismatch || invalidDebtFlag;
};

const isInconsistentDebt = (debt) => {
  const hasNegative = debt.paidAmount < 0 || debt.remainingAmount < 0 || debt.totalOwed <= 0;
  const sumsMismatch = normalizeFloat(debt.paidAmount + debt.remainingAmount) !== normalizeFloat(debt.totalOwed);
  const invalidStatus =
    (debt.status === 'OPEN' && debt.paidAmount > 0) ||
    (debt.status === 'PARTIAL' && (debt.remainingAmount <= 0 || debt.paidAmount <= 0)) ||
    (debt.status === 'CLOSED' && debt.remainingAmount !== 0);
  return hasNegative || sumsMismatch || invalidStatus;
};

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Running data audit...');

    const allSales = await prisma.sale.findMany();
    const allServices = await prisma.service.findMany();
    const allDebts = await prisma.debt.findMany({ include: { payments: true } });
    const allDebtPayments = await prisma.debtPayment.findMany();

    const invalidSales = allSales.filter(
      (sale) => sale.totalAmount > 0 && sale.paidAmount === 0 && sale.remainingAmount === 0 && !sale.isDebt
    );

    const inconsistentSales = allSales.filter(isInconsistentSale);

    const invalidServices = allServices.filter(
      (service) => service.amount > 0 && service.paidAmount === 0 && service.remainingAmount === 0 && !service.isDebt
    );

    const inconsistentServices = allServices.filter(isInconsistentService);

    const nullDebtPayments = allDebtPayments.filter((payment) => payment.paymentMethod == null);

    const inconsistentDebts = allDebts.filter(isInconsistentDebt);

    console.log('Summary:');
    console.log('  total sales:', allSales.length);
    console.log('  total services:', allServices.length);
    console.log('  total debts:', allDebts.length);
    console.log('  total debt payments:', allDebtPayments.length);
    console.log('  invalid sales (paid=0, remaining=0, isDebt=false):', invalidSales.length);
    console.log('  inconsistent sales:', inconsistentSales.length);
    console.log('  invalid services (paid=0, remaining=0, isDebt=false):', invalidServices.length);
    console.log('  inconsistent services:', inconsistentServices.length);
    console.log('  debt payments without method:', nullDebtPayments.length);
    console.log('  inconsistent debts:', inconsistentDebts.length);

    if (invalidSales.length > 0) {
      console.log('\nSample invalid sales:');
      console.log(JSON.stringify(invalidSales.slice(0, 10), null, 2));
    }
    if (inconsistentSales.length > 0) {
      console.log('\nSample inconsistent sales:');
      console.log(JSON.stringify(inconsistentSales.slice(0, 10), null, 2));
    }
    if (invalidServices.length > 0) {
      console.log('\nSample invalid services:');
      console.log(JSON.stringify(invalidServices.slice(0, 10), null, 2));
    }
    if (inconsistentServices.length > 0) {
      console.log('\nSample inconsistent services:');
      console.log(JSON.stringify(inconsistentServices.slice(0, 10), null, 2));
    }
    if (nullDebtPayments.length > 0) {
      console.log('\nSample debt payments without method:');
      console.log(JSON.stringify(nullDebtPayments.slice(0, 10), null, 2));
    }
    if (inconsistentDebts.length > 0) {
      console.log('\nSample inconsistent debts:');
      console.log(JSON.stringify(inconsistentDebts.slice(0, 10), null, 2));
    }

    console.log('\nData audit complete.');
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
