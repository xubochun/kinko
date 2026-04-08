import { useLayoutEffect } from 'react';
import { createIcons, icons } from 'lucide';

export function useLucideIcons() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // createIcons from 'lucide' replaces <i> tags with <svg> tags.
    // This is dangerous in React because React loses track of the node.
    // We only run this on mount to handle any initial icons.
    // Dynamic icons should ideally use the <Icon /> component which returns stable SVGs.

    const run = () => {
      try {
        createIcons({ icons });
      } catch (e) {
        console.warn('Lucide icon replacement failed', e);
      }
    };

    run();

    // We removed the MutationObserver because it causes "removeChild" errors in React
    // when it tries to replace icons that React is currently managing or unmounting.
  }, []);
}
