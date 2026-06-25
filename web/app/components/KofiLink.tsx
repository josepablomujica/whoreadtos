export default function KofiLink({
  children = "This is free and we don't sell your data. If it helped, want to buy us a coffee?",
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
