import { useLayoutEffect } from "react";
import { createIcons, icons } from "lucide";

export function useLucideIcons() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const run = () => {
      createIcons({ icons });
      document.querySelectorAll("svg[data-lucide]").forEach((node) => {
        node.removeAttribute("data-lucide");
      });
    };

    const hasPending = () => document.querySelector("i[data-lucide]") !== null;
    if (hasPending()) run();

    let frame = 0;
    const observer = new MutationObserver(() => {
      if (!hasPending() || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        run();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
