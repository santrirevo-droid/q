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
      className={`font-arabic relative flex w-full flex-col border border-gray-200 bg-white text-[#272727] shadow-sm ${
        isThumb ? "aspect-[2/3] p-[3%]" : "p-[5%]"
      }`}
    >
      {!isThumb && (
        <div className="mb-2 flex items-center justify-between font-sans text-[11px] tracking-wide text-gray-400">
          <span className="font-arabic">{data.ayahs[0]?.surah.name ?? ""}</span>
          <span className="font-arabic">الجزء {juz ? toArabicNumber(juz) : ""}</span>
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
                className={`mx-auto my-1 block rounded border border-gray-200 bg-gray-50 text-center font-semibold text-gray-800 ${
                  isThumb ? "py-[1px] text-[4px]" : "py-1 text-[13px]"
                }`}
                style={{ direction: "rtl" }}
              >
                {ayah.surah.name}
              </span>
            )}
            {ayah.text}
            <span
              className={`mx-1 inline-flex items-center justify-center rounded-full border border-teal-600 align-middle text-teal-700 ${
                isThumb ? "h-[5px] w-[5px] text-[3px]" : "h-[1.4em] w-[1.4em] text-[10px]"
              }`}
            >
              {toArabicNumber(ayah.numberInSurah)}
            </span>{" "}
          </span>
        ))}
      </div>

      {!isThumb && (
        <div className="font-arabic mt-2 text-center text-[12px] text-gray-400">
          {toArabicNumber(data.page)}
        </div>
      )}
    </div>
  );
}
