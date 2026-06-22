// Warm cream palette — terracotta primary, warm brown text, airy borders
const warm = {
  border: "border-[#e8dfd5]",
  borderFocus: "focus:border-[#b07040]",
  bg: "bg-white",
};

export const card = `${warm.bg} rounded-2xl border ${warm.border}`;

export const inputCls =
  `w-full bg-white border ${warm.border} rounded-lg px-3 py-2.5 text-sm text-[#1a1208] ` +
  `placeholder:text-[#c4b5a5] focus:outline-none ${warm.borderFocus} transition-colors`;

export const btnPrimary =
  "inline-flex items-center gap-1.5 bg-[#b07040] text-white text-sm font-medium " +
  "px-4 py-2 rounded-lg hover:bg-[#8f5a32] transition-colors cursor-pointer " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#b07040]";

export const btnSecondary =
  "inline-flex items-center gap-1.5 bg-white text-[#4a3728] text-sm font-medium " +
  `px-4 py-2 rounded-lg border ${warm.border} hover:border-[#c4b5a5] hover:text-[#1a1208] transition-colors cursor-pointer`;

export const th =
  "text-left px-4 py-3 text-xs font-medium text-[#a0907c]";

export const td = "px-4 py-3.5 text-sm";

export const labelCls = "block text-xs font-medium text-[#a0907c] uppercase tracking-wide mb-1.5";

export const sectionHeading = "text-xs font-semibold text-[#a0907c] uppercase tracking-wider";
