import { useState, useEffect } from "react";

export default function ColorPalette() {
  const [color, setColor] = useState("#3498db");
  const [palette, setPalette] = useState([]);
  const [mode, setMode] = useState("analogous");
  const [copiedColor, setCopiedColor] = useState(null);

  useEffect(() => {
    generatePalette(color, mode);
  }, [color, mode]);

  const generatePalette = (hex, mode) => {
    const hsl = hexToHSL(hex);
    const { h, s, l } = hsl;

    let hues = [];

    switch (mode) {
      case "analogous":
        hues = [h, (h + 30) % 360, (h + 60) % 360];
        break;
      case "complementary":
        hues = [h, (h + 180) % 360];
        break;
      case "triadic":
        hues = [h, (h + 120) % 360, (h + 240) % 360];
        break;
      default:
        hues = [h];
    }

    const generated = hues.map(
      (hue) => hslToHex(`hsl(${hue}, ${s}%, ${l}%)`)
    );

    setPalette(generated);
  };

  const hexToHSL = (hex) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / d + 2) * 60;
          break;
        case b:
          h = ((r - g) / d + 4) * 60;
          break;
      }
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToHex = (hslString) => {
    const [h, s, l] = hslString.match(/\d+/g).map(Number);
    const a = s / 100;
    const b = l / 100;

    const f = (n) => {
      const k = (n + h / 30) % 12;
      const c = b - a * Math.min(b, 1 - b) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, "0");
    };

    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Color Palette Generator</h2>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-32 h-16 border-2 border-gray-300 rounded-lg mb-4 cursor-pointer"
        />

        <p className="mb-4 font-medium text-gray-700">
          Selected Color: <span className="font-mono">{color}</span>
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {["analogous", "complementary", "triadic"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                mode === m
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 hover:bg-blue-100"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {palette.map((clr, index) => (
            <div
              key={index}
              onClick={() => handleCopy(clr)}
              className="h-20 rounded-xl shadow-md flex items-center justify-center font-mono font-semibold text-white cursor-pointer relative transition hover:scale-105"
              style={{ backgroundColor: clr }}
            >
              {copiedColor === clr ? (
                <span className="text-sm font-bold">Copied!</span>
              ) : (
                clr
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
