export default function HiddenAmount({
  sizeClass = "h-3.5 w-3.5",
  justifyClass = "justify-center",
  heightClass = "h-[1.2em]",
  lineHeightClass = "leading-[1.2]",
  minWidthClass = "min-w-[72px]"
}: {
  sizeClass?: string;
  justifyClass?: string;
  heightClass?: string;
  lineHeightClass?: string;
  minWidthClass?: string;
}) {
  return (
    <span className={`relative inline-flex items-center w-full ${minWidthClass} ${heightClass} min-h-[1em] ${lineHeightClass}`}>
      <span className={`absolute inset-0 flex items-center ${justifyClass} gap-1.5 opacity-55 text-gray-400 whitespace-nowrap`}>
        <i data-lucide="eye-closed" className={sizeClass}></i>
        <i data-lucide="eye-closed" className={sizeClass}></i>
        <i data-lucide="eye-closed" className={sizeClass}></i>
      </span>
    </span>
  );
}
