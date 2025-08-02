import { useState } from "react";

export default function SplitBillCalculator() {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState(2);
  const [tip, setTip] = useState(10);
  const [excludeTipFor, setExcludeTipFor] = useState(0);
  const [result, setResult] = useState(null);
  const [names, setNames] = useState(["", ""]);

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const updatePeople = (count) => {
    setPeople(count);
    setNames(Array(count).fill(""));
    setExcludeTipFor(0);
    setResult(null);
  };

  const calculate = () => {
    const bill = parseFloat(total);
    const tipAmount = (bill * tip) / 100;
    const effectivePeople = people - excludeTipFor;

    const tipPerPerson = effectivePeople > 0 ? tipAmount / effectivePeople : 0;
    const billPerPerson = bill / people;

    const detailed = names.map((name, i) => {
      const personName = name || `Person ${i + 1}`;
      const includesTip = i >= excludeTipFor;
      const amount = billPerPerson + (includesTip ? tipPerPerson : 0);
      return { personName, amount: amount.toFixed(2) };
    });

    setResult(detailed);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-rose-100 to-white p-6">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-4">💸 Split Bill Calculator</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Total Bill Amount (₹)</label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full border p-2 rounded-md"
              placeholder="e.g., 1500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Number of People</label>
            <input
              type="number"
              min="1"
              value={people}
              onChange={(e) => updatePeople(parseInt(e.target.value))}
              className="w-full border p-2 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tip Percentage (%)</label>
            <input
              type="number"
              min="0"
              value={tip}
              onChange={(e) => setTip(parseFloat(e.target.value))}
              className="w-full border p-2 rounded-md"
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Exclude Tip for How Many People?
            </label>
            <input
              type="number"
              min="0"
              max={people}
              value={excludeTipFor}
              onChange={(e) => setExcludeTipFor(parseInt(e.target.value))}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-medium mb-2">Enter Names (Optional)</label>
          <div className="grid grid-cols-2 gap-2">
            {names.map((name, i) => (
              <input
                key={i}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                className="border p-2 rounded-md"
                placeholder={`Person ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md transition"
        >
          Calculate Split
        </button>

        {result && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-lg mb-2 text-center">🧾 Split Breakdown</h3>
            <ul className="space-y-2">
              {result.map((person, i) => (
                <li
                  key={i}
                  className="flex justify-between px-4 py-2 bg-gray-50 rounded-md border"
                >
                  <span>{person.personName}</span>
                  <span>₹ {person.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
