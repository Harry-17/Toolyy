import { useState } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const countWords = (text) =>
    text.trim().split(/\s+/).filter(Boolean).length;

  const countSpaces = (text) =>
    (text.match(/ /g) || []).length;

  const countVowels = (text) =>
    (text.match(/[aeiouAEIOU]/g) || []).length;

  const countConsonants = (text) =>
    (text.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;

  const countSentences = (text) =>
    (text.match(/[^.!?]*[.!?]/g) || []).length;

  const countParagraphs = (text) =>
    text.trim().split(/\n\s*\n+/).filter(Boolean).length;

  const clearText = () => setText("");

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stats = [
    { label: "Words", value: countWords(text) },
    { label: "Spaces", value: countSpaces(text) },
    { label: "Vowels", value: countVowels(text) },
    { label: "Consonants", value: countConsonants(text) },
    { label: "Sentences", value: countSentences(text) },
    { label: "Paragraphs", value: countParagraphs(text) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          ✍️ Word & Text Analyzer
        </h2>

        <textarea
          rows="10"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm mb-4 resize-none"
          placeholder="Type or paste your text here..."
        ></textarea>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <button
            onClick={clearText}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Clear
          </button>
          <button
            onClick={copyText}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          {stats.map((item) => (
            <div
              key={item.label}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h4 className="text-md text-gray-700 font-medium">
                {item.label}
              </h4>
              <p className="text-2xl text-blue-600 font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
