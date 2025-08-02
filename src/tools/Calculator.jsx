import { useEffect, useState } from "react";

export default function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const handleClick = (value) => {
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  const handleCalculate = () => {
    try {
      const evalResult = eval(expression);
      setResult(evalResult);
    } catch {
      setResult("Error");
    }
  };

  useEffect(() => {
    const handleKeyUp = (e) => {
      const allowedKeys = "0123456789+-*/.";

      if (allowedKeys.includes(e.key)) {
        setExpression((prev) => prev + e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === "Backspace") {
        setExpression((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Basic Calculator</h2>
        <input
          type="text"
          value={expression}
          placeholder="0"
          className="w-full text-right px-4 py-2 border rounded-lg mb-2 text-xl"
          readOnly
        />
        <div className="grid grid-cols-4 gap-2">
          {[7, 8, 9, "/", 4, 5, 6, "*", 1, 2, 3, "-", 0, ".", "C", "+"].map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === "C" ? handleClear() : handleClick(btn))}
              className="bg-blue-100 hover:bg-blue-200 text-lg rounded-md p-3 font-semibold"
            >
              {btn}
            </button>
          ))}
          <button
            onClick={handleCalculate}
            className="col-span-4 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded-md p-3 mt-2"
          >
            =
          </button>
        </div>
        {result !== "" && (
          <div className="mt-4 text-right text-xl text-green-600 font-medium">
            Result: {result}
          </div>
        )}
      </div>
    </div>
  );
}
