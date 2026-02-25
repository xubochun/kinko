import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "設定",
  description: "管理您的 kinko 資料，匯入或導出投資組合 CSV 檔案。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
