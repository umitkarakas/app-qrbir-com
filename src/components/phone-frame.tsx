import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block select-none">
      {/* Yan düğmeler — sol */}
      <div className="absolute left-[-4px] top-[90px] w-[4px] h-7 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-4px] top-[130px] w-[4px] h-10 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-4px] top-[178px] w-[4px] h-10 bg-gray-700 rounded-l-sm" />
      {/* Yan düğme — sağ (güç) */}
      <div className="absolute right-[-4px] top-[120px] w-[4px] h-14 bg-gray-700 rounded-r-sm" />

      {/* Gövde */}
      <div
        className="bg-gray-900 shadow-2xl ring-1 ring-gray-700"
        style={{ borderRadius: "2.8rem", padding: "10px", width: "300px" }}
      >
        {/* Ekran */}
        <div
          className="bg-white overflow-hidden"
          style={{ borderRadius: "2.2rem" }}
        >
          {/* Dynamic island */}
          <div
            className="bg-black flex items-center justify-center"
            style={{ height: "36px" }}
          >
            <div
              className="bg-black border border-gray-700"
              style={{
                width: "80px",
                height: "22px",
                borderRadius: "9999px",
              }}
            />
          </div>

          {/* İçerik */}
          <div
            className="overflow-y-auto"
            style={{ height: "560px", scrollbarWidth: "none" }}
          >
            {children}
          </div>

          {/* Home bar */}
          <div
            className="bg-white flex items-end justify-center"
            style={{ height: "24px", paddingBottom: "6px" }}
          >
            <div
              className="bg-gray-300 rounded-full"
              style={{ width: "80px", height: "4px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
