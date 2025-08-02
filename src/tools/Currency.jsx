import React, { useState, useEffect, useCallback } from 'react';

// SVG Icon for the swap button
const SwapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

// Main App Component
export default function App() {
  // State for all our data and UI states
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  // --- API Interaction using Frankfurter.app ---

  // Fetch the list of available currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        // Using the more reliable frankfurter.app API
        const response = await fetch('https://api.frankfurter.app/currencies');
        if (!response.ok) throw new Error('Failed to fetch currency symbols.');
        const data = await response.json();
        // Extracting currency codes from the response
        setCurrencies(Object.keys(data));
      } catch (err) {
        setError('Could not load currency list. Please try again later.');
        console.error(err);
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch exchange rate and perform conversion whenever dependencies change
  const fetchConversion = useCallback(async () => {
    if (!fromCurrency || !toCurrency || amount <= 0 || fromCurrency === toCurrency) {
      setConvertedAmount(fromCurrency === toCurrency ? amount : null);
      setExchangeRate(fromCurrency === toCurrency ? 1 : null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // The frankfurter.app API endpoint for conversion
      const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch exchange rates.');
      const data = await response.json();

      if (data.rates && data.rates[toCurrency]) {
        const finalAmount = data.rates[toCurrency];
        const rate = finalAmount / amount; // Calculate the single unit exchange rate
        setConvertedAmount(finalAmount.toFixed(4));
        setExchangeRate(rate);
        setLastUpdated(data.date);
      } else {
        throw new Error(`Data for '${toCurrency}' not available.`);
      }
    } catch (err) {
      setError(`Failed to get conversion. ${err.message}`);
      setConvertedAmount(null);
      setExchangeRate(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  // useEffect to trigger the conversion with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchConversion();
    }, 300); // 300ms delay for a responsive feel

    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency, fetchConversion]);


  // Handler to swap the 'from' and 'to' currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // --- UI Rendering ---
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Currency Converter</h1>
            <p className="text-gray-400">Get real-time exchange rates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            
            <div className="md:col-span-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="1.00"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-300 mb-2">From</label>
              <select
                id="fromCurrency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              >
                {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>

            <div className="flex justify-center items-end">
                <button
                    onClick={handleSwapCurrencies}
                    className="bg-gray-700 hover:bg-cyan-500 text-white hover:text-gray-900 rounded-full p-3 transition-all duration-300 transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    aria-label="Swap currencies"
                >
                    <SwapIcon />
                </button>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-300 mb-2">To</label>
              <select
                id="toCurrency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              >
                {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-8 text-center h-32 flex items-center justify-center">
            {isLoading && (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Fetching rates...</span>
              </div>
            )}
            {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            
            {!isLoading && !error && convertedAmount && (
              <div className="bg-gray-900/50 p-6 rounded-xl w-full">
                <p className="text-xl text-gray-400 mb-2">{amount} {fromCurrency} =</p>
                <p className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">{convertedAmount} {toCurrency}</p>
                {exchangeRate && (
                  <p className="text-sm text-gray-500 mt-4">
                    1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                    <br/>
                    Last updated: {lastUpdated}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
