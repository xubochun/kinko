const fmt = new Intl.NumberFormat("zh-Hant-TW");

export const currency = (n: number) => `NT$ ${fmt.format(Math.round(n))}`;

export const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
};

export const formatPnlAmount = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${currency(Math.abs(value))}`;
};

export const formatPnlPct = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
};

export const pnlClass = (value: number) => {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";
  return "text-gray-500";
};
