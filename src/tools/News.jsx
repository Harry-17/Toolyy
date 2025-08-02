import React, { useState, useEffect, useCallback } from 'react';


const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
);


export default function App() {
   
    const [activeTab, setActiveTab] = useState('world');
    const [customCountry, setCustomCountry] = useState('us');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeArticle, setActiveArticle] = useState(null);
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    
 
    const NEWSDATA_API_KEY = 'pub_76b6537851d343d899e7f6f106809afb';

    
    const countries = [
        { code: 'us', name: 'United States' },
        { code: 'gb', name: 'United Kingdom' },
        { code: 'ca', name: 'Canada' },
        { code: 'au', name: 'Australia' },
        { code: 'de', name: 'Germany' },
    ];

   
    const fetchNews = useCallback(async () => {
        if (NEWSDATA_API_KEY === 'YOUR_NEWSDATA_API_KEY_HERE') {
            setError("Please add your Newsdata.io API key to fetch news.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setNews([]);

        let countryParam = '';
        if (activeTab === 'india') {
            countryParam = 'country=in';
        } else if (activeTab === 'custom') {
            countryParam = `country=${customCountry}`;
        } else { 
            countryParam = 'category=top'; 
        }

        const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&language=en&${countryParam}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.results?.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setNews(data.results || []);
        } catch (err) {
            console.error("Failed to fetch news:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTab, customCountry, NEWSDATA_API_KEY]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

  
    const handleGetSummary = async (article) => {
        setActiveArticle(article);
        setIsModalOpen(true);
        setIsSummarizing(true);
        setSummary('');

        
        const context = article.description || article.content || "No content available.";
        const prompt = `Please provide a concise, one-paragraph summary of the following news article based on its title and content snippet:\n\nTitle: ${article.title}\n\nContent: ${context}`;
        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const geminiApiKey = "AIzaSyBwMh15k5J9Ph4dwJch3WF5iVzJR9yvJrI"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Gemini API request failed.`);
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                setSummary(result.candidates[0].content.parts[0].text);
            } else {
                throw new Error("Invalid response structure from the summary API.");
            }
        } catch (err) {
            console.error("Summarization error:", err);
            setSummary(`Could not generate summary. ${err.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">Global News Feed</h1>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap items-center justify-center border-b border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('world')} className={`py-3 px-6 font-semibold transition ${activeTab === 'world' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>World</button>
                    <button onClick={() => setActiveTab('india')} className={`py-3 px-6 font-semibold transition ${activeTab === 'india' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>India</button>
                    <div className={`py-3 px-2 transition flex items-center gap-2 ${activeTab === 'custom' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
                        <select 
                            value={customCountry} 
                            onChange={(e) => {
                                setCustomCountry(e.target.value);
                                setActiveTab('custom');
                            }}
                            className="bg-gray-800 border border-gray-600 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* News Grid */}
                {loading && <div className="text-center text-lg">Loading news...</div>}
                {error && <div className="text-center bg-red-500/20 text-red-300 p-4 rounded-lg">{error}</div>}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((article, index) => (
                            <div key={article.article_id || index} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                                <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/1f2937/38bdf8?text=News'} />
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-100 flex-grow">{article.title}</h3>
                                    <p className="text-sm text-gray-400 mt-2">{article.source_id} &bull; {new Date(article.pubDate).toLocaleDateString()}</p>
                                    <button onClick={() => handleGetSummary(article)} className="mt-4 w-full bg-cyan-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-transform active:scale-95">
                                        Get AI Summary
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-cyan-400">AI Summary</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-2">{activeArticle?.title}</h3>
                            {isSummarizing ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="w-4 h-4 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-4 h-4 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s] mx-2"></div>
                                    <div className="w-4 h-4 bg-cyan-300 rounded-full animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
                            )}
                        </div>
                         <div className="p-4 border-t border-gray-700 mt-auto">
                            <a href={activeArticle?.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                Read Full Article at {activeArticle?.source_id}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
