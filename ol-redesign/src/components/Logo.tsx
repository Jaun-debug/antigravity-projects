export default function OLLogo({ className = "", lightMode = false }: { className?: string; lightMode?: boolean }) {
  const mainColor = lightMode ? "#ffffff" : "#1c325b";
  const shadowColor = lightMode ? "rgba(255,255,255,0.4)" : "#009cde";
  const greenColor = "#7cbd36";

  return (
    <svg viewBox="0 0 500 240" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Ohlthaver & List Group Logo">
      <defs>
        <style>
          {`
            .font-serif { font-family: "Georgia", "Times New Roman", serif; }
            .font-sans { font-family: "Inter", "Arial", sans-serif; font-weight: bold; }
          `}
        </style>
      </defs>

      {/* Top Monogram */}
      <g transform="translate(130, 20)">
        {/* Big O */}
        <text x="60" y="100" fill={mainColor} fontSize="130" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="-5">O</text>
        
        {/* L Shadow */}
        <text x="145" y="102" fill={shadowColor} fontSize="130" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle">L</text>
        {/* L Main */}
        <text x="140" y="100" fill={mainColor} fontSize="130" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle">L</text>
        
        {/* Green Ampersand */}
        <text x="105" y="85" fill={greenColor} fontSize="85" fontWeight="900" fontFamily="Georgia, serif" textAnchor="middle">&amp;</text>
      </g>

      {/* SINCE 1919 */}
      <text x="310" y="145" fill={mainColor} className="font-sans" fontSize="16" letterSpacing="2" textAnchor="middle">SINCE 1919</text>

      {/* Ohlthaver & List */}
      <g transform="translate(250, 185)">
        <text x="-120" y="0" fill={mainColor} fontSize="44" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-1">Ohlthaver</text>
        <text x="80" y="0" fill={greenColor} fontSize="44" fontWeight="800" fontFamily="Arial, sans-serif">&amp;</text>
        <text x="105" y="0" fill={mainColor} fontSize="44" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-1">List</text>
      </g>

      {/* GROUP */}
      <text x="350" y="215" fill={mainColor} className="font-sans" fontSize="15" letterSpacing="4" textAnchor="middle">GROUP</text>
    </svg>
  );
}
