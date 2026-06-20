export default function Logo() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Shopping Home"
    >
      {/* Price-tag body, pointing right */}
      <path
        d="M4 4 L15 4 L22 12 L15 20 L4 20 Q2 20 2 18 L2 6 Q2 4 4 4 Z"
        fill="#6366f1"
      />
      {/* String hole */}
      <circle cx="6" cy="12" r="1.5" fill="white" fillOpacity="0.85" />
      {/* Upward sparkline — price-tracking motif */}
      <polyline
        points="9.5,16 12,13 14.5,15.5 17,10 18,8.5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
