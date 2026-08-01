interface FrontMatterPageProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: React.ReactNode;
  arabic?: boolean;
}

export default function FrontMatterPage({
  eyebrow,
  title,
  subtitle,
  body,
  arabic = true,
}: FrontMatterPageProps) {
  return (
    <div className="relative flex aspect-[2/3] w-full flex-col items-center justify-center gap-4 border-4 border-double border-amber-800/50 bg-[#fbf6ea] p-[8%] text-center text-[#2a1a08] shadow-sm">
      {eyebrow && (
        <p className="text-[11px] tracking-[0.3em] text-amber-900/60 uppercase">
          {eyebrow}
        </p>
      )}
      <h1
        className={`text-2xl font-semibold md:text-3xl ${arabic ? "font-arabic" : ""}`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-amber-900/80 md:text-base">{subtitle}</p>
      )}
      {body && <div className="mt-2 text-xs text-amber-900/70 md:text-sm">{body}</div>}
    </div>
  );
}
