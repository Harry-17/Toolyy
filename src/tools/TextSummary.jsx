import React, { useState, useEffect } from 'react';

// --- Helper Icons ---
const ClipboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-8 4h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"></path></svg>
);
const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
);

// --- Main App Component ---
export default function App() {
    // State management
    const [inputText, setInputText] = useState('');
    const [summaryText, setSummaryText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ originalChars: 0, summaryChars: 0, reduction: 0 });
    const [copied, setCopied] = useState(false);

    // Function to calculate stats
    useEffect(() => {
        const originalChars = inputText.length;
        const summaryChars = summaryText.length;
        const reduction = originalChars > 0 ? Math.round(((originalChars - summaryChars) / originalChars) * 100) : 0;
        setStats({ originalChars, summaryChars, reduction });
    }, [inputText, summaryText]);

    // --- Gemini API Interaction ---
    const handleSummarize = async () => {
        if (!inputText.trim()) {
            setError("Please enter some text to summarize.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSummaryText('');

        const prompt = `Please provide a concise summary of the following text:\n\n---\n\n${inputText}`;
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyBwMh15k5J9Ph4dwJch3WF5iVzJR9yvJrI"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                setSummaryText(result.candidates[0].content.parts[0].text);
            } else {
                throw new Error("Invalid response structure from the API.");
            }
        } catch (err) {
            console.error("Summarization error:", err);
            setError(`Failed to summarize. ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (summaryText) {
          
            const textArea = document.createElement("textarea");
            textArea.value = summaryText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setError("Failed to copy text to clipboard.");
            }
            document.body.removeChild(textArea);
        }
    };
    
    // Handler to clear all fields
    const handleClear = () => {
        setInputText('');
        setSummaryText('');
        setError(null);
    };

    // --- UI Rendering ---
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-2">AI Text Summarizer</h1>
                    <p className="text-gray-400">Paste your text below to get a quick summary.</p>
                </div>

                <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
                    {/* Input Area */}
                    <div className="mb-6">
                        <label htmlFor="inputText" className="block text-lg font-medium text-gray-300 mb-2">Original Text</label>
                        <textarea
                            id="inputText"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your article, essay, or document here..."
                            className="w-full h-48 bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button
                            onClick={handleSummarize}
                            disabled={isLoading || !inputText.trim()}
                            className="flex-1 bg-cyan-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-transform duration-200 active:scale-95 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Summarizing...' : 'Summarize Text'}
                        </button>
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-transform duration-200 active:scale-95 shadow-lg"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Output Area */}
                    { (summaryText || isLoading || error) && (
                        <div className="border-t border-gray-700 pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-medium text-gray-300">Summary</h2>
                                <button onClick={handleCopy} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition flex items-center gap-2 disabled:opacity-50" disabled={!summaryText}>
                                    {copied ? <CheckIcon/> : <ClipboardIcon/>}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            
                            {isLoading && (
                                <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            )}

                            {error && <div className="text-center bg-red-500/20 text-red-300 p-4 rounded-lg">{error}</div>}
                            
                            {!isLoading && summaryText && (
                                <div className="w-full h-auto bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-gray-200 whitespace-pre-wrap">
                                    {summaryText}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center mt-4">
                                <div>
                                    <p className="text-2xl font-bold text-cyan-400">{stats.originalChars.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Original Chars</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-cyan-400">{stats.summaryChars.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">Summary Chars</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-400">{stats.reduction}%</p>
                                    <p className="text-sm text-gray-400">Reduction</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
