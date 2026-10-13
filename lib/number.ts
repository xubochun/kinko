/**
 * 解析使用者輸入的數字字串，允許千分位逗號與空白，例如 "1,234,567"。
 * 無法解析時回傳 null。
 */
export const parseNumberInput = (raw: string): number | null => {
  const cleaned = raw.replace(/[,\s，]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

/** 將數字格式化為輸入框顯示用的千分位字串（保留最多 4 位小數）。 */
export const formatInputNumber = (n: number): string =>
  n.toLocaleString('en-US', { maximumFractionDigits: 4 });

/** 價格顯示：最多 2 位小數，整數不補零。 */
export const formatPrice = (n: number): string =>
  n.toLocaleString('zh-TW', { maximumFractionDigits: 2 });

/** 股數顯示：千分位。 */
export const formatShares = (n: number): string =>
  n.toLocaleString('zh-TW', { maximumFractionDigits: 4 });

/** 相對時間，例如「今天」、「3 天前」。 */
export const formatRelativeDays = (timestamp: number, now = Date.now()) => {
  const startOf = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOf(now) - startOf(timestamp)) / 86400000);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 個月前`;
  return `${Math.floor(months / 12)} 年前`;
};
