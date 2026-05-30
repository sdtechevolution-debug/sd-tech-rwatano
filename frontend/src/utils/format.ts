export const formatCurrency = (value?: number | string) => {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(numberValue)) return "RWF 0";
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(numberValue);
};
