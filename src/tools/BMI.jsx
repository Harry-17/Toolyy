import { useState, useEffect } from "react";
import { FaWeight, FaRulerVertical, FaLaughBeam } from "react-icons/fa";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState("");
  const [compliment, setCompliment] = useState("");

  const calculateBMI = () => {
    if (!height || !weight) return;

    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    const roundedBmi = bmiValue.toFixed(1);
    setBmi(roundedBmi);

    let statusText = "";
    let comment = "";

    if (bmiValue < 18.5) {
      statusText = "Underweight";
      comment = "You might get blown away by a strong breeze 🌬️.";
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      statusText = "Normal (Healthy)";
      comment = "Perfect! Your body called and said thanks 💪.";
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      statusText = "Billu's weight";
      comment = "Just a little more fluff to love 😅.";
    } else {
      statusText = "Obese";
      comment = "You're in a committed relationship with snacks 🍕.";
    }

    setStatus(statusText);
    setCompliment(comment);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") calculateBMI();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transition-all">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6 flex items-center justify-center gap-2">
          <FaLaughBeam /> BMI Calculator
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Height (cm)
            </label>
            <div className="flex items-center gap-2">
              <FaRulerVertical className="text-gray-500" />
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="e.g. 170"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Weight (kg)
            </label>
            <div className="flex items-center gap-2">
              <FaWeight className="text-gray-500" />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Calculate BMI
          </button>
        </div>

        {bmi && (
          <div className="mt-6 text-center space-y-2 animate-fadeIn">
            <p className="text-xl font-semibold text-gray-800">
              Your BMI: <span className="text-red-600 font-bold">{bmi}</span>
            </p>
            <p className="text-lg text-gray-700">
              Status:{" "}
              <span className="font-medium text-red-500">{status}</span>
            </p>
            <p className="text-sm text-gray-600 italic">{compliment}</p>
          </div>
        )}
      </div>
    </div>
  );
}
