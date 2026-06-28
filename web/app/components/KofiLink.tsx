export default function KofiLink({
  children = '☕ buy us a coffee?',
  className = 'text-[#1D9E75] hover:underline transition-colors',
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
