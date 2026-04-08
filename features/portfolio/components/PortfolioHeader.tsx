import React from 'react';
import Image from 'next/image';

type Props = {
  hasAssets: boolean;
  privacy: boolean;
  onTogglePrivacy: () => void;
  onAddAsset?: () => void;
};

export default function PortfolioHeader({
  hasAssets: _hasAssets,
  privacy: _privacy,
  onTogglePrivacy: _onTogglePrivacy,
  onAddAsset: _onAddAsset,
}: Props) {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden ring-1 ring-black/[.06] bg-white shadow-sm flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="kinko logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <div className="text-[18px] font-black text-black tracking-tight">
              Kinko
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Only global branding/navigation here. Page actions moved to content area. */}
      </div>
    </header>
  );
}
