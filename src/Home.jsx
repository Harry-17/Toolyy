import { useState } from "react";
import { Link } from "react-router-dom";

const tools = [
  
  
  { name: "AI Chatbot", path: "/chatbot" },
  { name: "Age Calculator", path: "/agecalculator" },
  { name: "Basic Calculator", path: "/calculator" },
  { name: "BMI Calculator", path: "/bmi" },
  { name: "Color Picker", path: "/color" },
  { name: "Currency Converter", path: "/currency" },
  { name: "News Headlines", path: "/news" },
  { name: "Pass-QR Generator", path: "/password" },
  { name: "Split Bill Calculator", path: "/splitbill" },
  { name: "To-Do List", path: "/todo" },
  { name: "Text Summarizer", path: "/summarizer" },
  { name: "Unit Convertor", path: "/unitconvert" },
  { name: "Weather Checker", path: "/weather" },
  { name: "Word Counter", path: "/wordcounter" },
  { name: "Image Editor", path: "/image" }
  
];

export default function App() {
  const [search, setSearch] = useState("");

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Tooly</h1>
        <input
          type="text"
          placeholder="Search tools..."
          className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </nav>

      {/* Tool Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredTools.map((tool) => (
          <Link to={tool.path} key={tool.name}>
            <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition duration-300 cursor-pointer hover:-translate-y-1">
              <h2 className="text-lg font-semibold text-gray-800">{tool.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
