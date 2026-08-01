import type { PageData } from "@/types/quran";
import { toArabicNumber } from "@/lib/utils";

interface MushafThumbnailProps {
  data: PageData;
}

export default function MushafThumbnail({ data }: MushafThumbnailProps) {
  return (
    <div className="font-arabic relative flex aspect-[2/3] w-full flex-col border border-gray-200 bg-white p-[3%] text-[#272727] shadow-sm">
      <div
        data-testid="page-text"
        className="flex-1 overflow-hidden text-right text-[4px] leading-[1.7]"
        style={{ textAlign: "justify", direction: "rtl" }}
      >
        {data.ayahs.map((ayah) => (
          <span key={ayah.number}>
            {ayah.numberInSurah === 1 && (
              <span
                className="mx-auto my-1 block rounded border border-gray-200 bg-gray-50 py-[1px] text-center text-[4px] font-semibold text-gray-800"
                style={{ direction: "rtl" }}
              >
                {ayah.surah.name}
              </span>
            )}
            {ayah.text}
            <span className="mx-1 inline-flex h-[5px] w-[5px] items-center justify-center rounded-full border border-teal-600 align-middle text-[3px] text-teal-700">
              {toArabicNumber(ayah.numberInSurah)}
            </span>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
