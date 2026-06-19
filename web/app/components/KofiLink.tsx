export default function KofiLink({
  children = 'Invítanos un café ☕',
  className = 'hover:text-[#1D9E75] transition-colors',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href="https://ko-fi.com/wereadtos"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
