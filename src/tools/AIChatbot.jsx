import React, { useState, useEffect, useRef } from 'react';

// Main App Component
export default function App() {
  // State management for messages, input, and loading status
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your friendly AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for the message container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect to scroll to the bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Gemini API Interaction ---
  const getAIResponse = async (userInput) => {
    setIsLoading(true);
    setError(null);

    // Prepare the conversation history for the API
    const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    // Add the current user input to the history
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });

    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyBwMh15k5J9Ph4dwJch3WF5iVzJR9yvJrI"; // API key is handled by the environment
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

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const botResponse = result.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      } else {
        // Handle cases where the response structure is unexpected
        console.error("Unexpected API response structure:", result);
        setError("Sorry, I couldn't get a valid response. Please try again.");
        setMessages(prev => [...prev, { text: "I'm having trouble thinking right now. Please check the console for details.", sender: 'bot' }]);
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError("Something went wrong. Please check your connection and try again.");
      setMessages(prev => [...prev, { text: `Error: ${err.message}`, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };


  // --- Event Handlers ---
  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Add user message to the state
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      // Fetch AI response
      getAIResponse(input);
      // Clear the input field
      setInput('');
    }
  };

  // --- UI Rendering ---
  return (
    <div className="bg-gray-900 text-white flex flex-col h-screen font-sans">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cyan-400">AI Chatbot</h1>
        <div className="flex items-center space-x-2">
           <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-sm text-gray-400">Powered by Gemini</span>
        </div>
      </header>
      
      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            )}
            
            {/* Message Bubble */}
            <div className={`max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl shadow-lg ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-base leading-relaxed">{msg.text}</p>
            </div>

            {/* User Avatar */}
             {msg.sender === 'user' && (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-end gap-3 justify-start">
             <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            <div className="max-w-lg px-5 py-3 rounded-2xl bg-gray-700 shadow-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
            </div>
          </div>
        )}
        
        {/* Error Message Display */}
        {error && (
            <div className="flex justify-center">
                <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            </div>
        )}

        {/* Dummy div to scroll to */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Form */}
      <footer className="bg-gray-800 p-4">
        <form onSubmit={handleSend} className="flex items-center space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500 text-gray-900 rounded-full p-3 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform duration-200 active:scale-95 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
