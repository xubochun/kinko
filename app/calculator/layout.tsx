import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '均價計算機',
  description: '計算加碼或攤平後的持股均價。',
  openGraph: {
    title: '均價計算機 | kinko',
    description: '計算加碼或攤平後的持股均價。',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
