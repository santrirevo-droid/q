import type { PageData } from "@/types/quran";
import { toArabicNumber } from "@/lib/utils";

interface MushafPageProps {
  data: PageData;
  variant?: "full" | "thumbnail";
}

export default function MushafPage({ data, variant = "full" }: MushafPageProps) {
  const isThumb = variant === "thumbnail";
  const juz = data.ayahs[0]?.juz;

  return (
    <div
      className={`font-arabic relative flex w-full flex-col border border-amber-800/40 bg-[#fbf6ea] text-[#2a1a08] shadow-sm ${
        isThumb ? "aspect-[2/3] p-[3%]" : "p-[5%]"
      }`}
    >
      {!isThumb && (
        <div className="mb-2 flex items-center justify-between text-[11px] tracking-wide text-amber-900/70">
          <span>{data.ayahs[0]?.surah.name ?? ""}</span>
          <span>الجزء {juz ? toArabicNumber(juz) : ""}</span>
        </div>
      )}

      <div
        data-testid="page-text"
        className={`text-right leading-[2] ${
          isThumb
            ? "flex-1 overflow-hidden text-[4px] leading-[1.7]"
            : "text-[19px] md:text-[22px]"
        }`}
        style={{ textAlign: "justify", direction: "rtl" }}
      >
        {data.ayahs.map((ayah) => (
          <span key={ayah.number}>
            {ayah.numberInSurah === 1 && (
              <span
                className={`mx-auto my-1 block rounded border border-amber-800/50 bg-amber-800/5 text-center ${
                  isThumb ? "py-[1px] text-[4px]" : "py-1 text-[13px]"
                }`}
                style={{ direction: "rtl" }}
              >
                {ayah.surah.name}
              </span>
            )}
            {ayah.text}
            <span
              className={`mx-1 inline-flex items-center justify-center rounded-full border border-amber-800/60 align-middle ${
                isThumb ? "h-[5px] w-[5px] text-[3px]" : "h-[1.4em] w-[1.4em] text-[10px]"
              }`}
            >
              {toArabicNumber(ayah.numberInSurah)}
            </span>{" "}
          </span>
        ))}
      </div>

      {!isThumb && (
        <div className="mt-2 text-center text-[12px] text-amber-900/70">
          {toArabicNumber(data.page)}
        </div>
      )}
    </div>
  );
}
