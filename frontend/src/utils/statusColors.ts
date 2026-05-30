/**
 * Get status-based colors for inventory and other metrics
 */

export const getStockStatusColor = (quantity: number, reorderPoint: number = 5) => {
  if (quantity === 0) {
    return {
      bg: "bg-red-950/40",
      text: "text-red-400",
      border: "border-red-600/40",
      badge: "bg-red-600 text-white",
      label: "Out of Stock",
    };
  } else if (quantity <= reorderPoint) {
    return {
      bg: "bg-amber-950/40",
      text: "text-amber-400",
      border: "border-amber-600/40",
      badge: "bg-amber-500 text-slate-900",
      label: "Low Stock",
    };
  } else {
    return {
      bg: "bg-emerald-950/40",
      text: "text-emerald-400",
      border: "border-emerald-600/40",
      badge: "bg-emerald-600 text-white",
      label: "In Stock",
    };
  }
};

export const getPriceChangeColor = (change: number) => {
  if (change > 0) {
    return "text-emerald-400";
  } else if (change < 0) {
    return "text-red-400";
  }
  return "text-slate-400";
};

export const getMetricColor = (value: number, threshold: number = 50) => {
  if (value >= threshold) {
    return "text-emerald-400";
  } else if (value >= threshold * 0.5) {
    return "text-amber-400";
  }
  return "text-red-400";
};
