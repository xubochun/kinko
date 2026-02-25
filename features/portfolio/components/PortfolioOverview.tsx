import TotalSummary from "./TotalSummary";
import EmptyStateWelcome from "./EmptyStateWelcome";
import AssetStructureSection from "./AssetStructureSection";

type Props = {
  hasAssets: boolean;
  isReady: boolean;
  privacy: boolean;
  animatedTotal: number;
  updatedAt: string;
  cashPct: string;
  stockPct: string;
  cashCount: number;
  stockCount: number;
  cashTotal: number;
  stockTotal: number;
  onAddAsset: () => void;
  onOpenDetail: (type: "cash" | "stock") => void;
};

export default function PortfolioOverview({
  hasAssets,
  isReady,
  privacy,
  animatedTotal,
  updatedAt,
  cashPct,
  stockPct,
  cashCount,
  stockCount,
  cashTotal,
  stockTotal,
  onAddAsset,
  onOpenDetail
}: Props) {
  return (
    <div className="flex flex-col gap-8 lg:col-span-5 lg:-ml-2">
      {isReady ? (
        <>
          <TotalSummary privacy={privacy} animatedTotal={animatedTotal} updatedAt={updatedAt} />
          <EmptyStateWelcome hasAssets={hasAssets} isReady={isReady} onAddAsset={onAddAsset} />
          <AssetStructureSection
            hasAssets={hasAssets}
            isReady={isReady}
            cashPct={cashPct}
            stockPct={stockPct}
            cashCount={cashCount}
            stockCount={stockCount}
            cashTotal={cashTotal}
            stockTotal={stockTotal}
            privacy={privacy}
            onOpenDetail={onOpenDetail}
            onAddAsset={onAddAsset}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="skeleton skeleton-text w-24"></div>
            <div className="skeleton skeleton-title w-56"></div>
            <div className="skeleton skeleton-text w-40"></div>
          </div>
          <div className="soft-card p-6">
            <div className="flex flex-col gap-4">
              <div className="skeleton skeleton-text w-48"></div>
              <div className="skeleton skeleton-title w-full"></div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="skeleton skeleton-title w-40"></div>
                <div className="skeleton skeleton-title w-32"></div>
              </div>
            </div>
          </div>
          <div className="soft-card p-5">
            <div className="flex flex-col gap-4">
              <div className="skeleton skeleton-text w-full"></div>
              <div className="flex items-center justify-between">
                <div className="skeleton skeleton-text w-32"></div>
                <div className="skeleton skeleton-text w-32"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="skeleton skeleton-circle w-8 h-8"></div>
                  <div className="skeleton skeleton-text w-28"></div>
                </div>
                <div className="skeleton skeleton-text w-24"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="skeleton skeleton-circle w-8 h-8"></div>
                  <div className="skeleton skeleton-text w-28"></div>
                </div>
                <div className="skeleton skeleton-text w-24"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
