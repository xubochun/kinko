type IconName =
  | "plus"
  | "home"
  | "pie-chart"
  | "search"
  | "user"
  | "settings"
  | "file-up"
  | "archive"
  | "archive-restore"
  | "sparkles"
  | "eye"
  | "eye-off";

type Props = {
  name: IconName;
  className?: string;
};

export default function Icon({ name, className }: Props) {
  return <i data-lucide={name} className={className}></i>;
}
