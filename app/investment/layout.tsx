import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "投資目標與持股分布",
  description: "設定您的投資目標，追蹤美股、台股持股進度，並分析您的年度資產配置比例。",
  openGraph: {
    title: "投資目標與持股分布 | kinko",
    description: "設定您的投資目標，追蹤美股、台股持股進度。",
  },
};

export default function InvestmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
