import TopBar from './TopBar';

interface PortfolioLoadingProps {
  onAdd: () => void;
}

export default function PortfolioLoading({ onAdd }: PortfolioLoadingProps) {
  return (
    <main className="min-h-screen relative z-10 bg-slate-50/50">
      <TopBar onAdd={onAdd} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:pt-14 md:pb-14">
        <div className="soft-card p-6">
          <div className="flex flex-col gap-4">
            <div className="skeleton skeleton-text w-40"></div>
            <div className="skeleton skeleton-title w-64"></div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="skeleton skeleton-text w-full"></div>
              <div className="skeleton skeleton-text w-full"></div>
              <div className="skeleton skeleton-text w-full"></div>
            </div>
            <div className="skeleton skeleton-title w-full h-32"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
