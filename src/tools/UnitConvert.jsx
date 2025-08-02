import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft, Zap } from 'lucide-react';

const UnitConverter = () => {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');

  const unitCategories = {
    length: {
      name: 'Length',
      icon: '📏',
      units: {
        meter: { name: 'Meter', factor: 1 },
        kilometer: { name: 'Kilometer', factor: 1000 },
        centimeter: { name: 'Centimeter', factor: 0.01 },
        millimeter: { name: 'Millimeter', factor: 0.001 },
        inch: { name: 'Inch', factor: 0.0254 },
        foot: { name: 'Foot', factor: 0.3048 },
        yard: { name: 'Yard', factor: 0.9144 },
        mile: { name: 'Mile', factor: 1609.34 },
        nauticalMile: { name: 'Nautical Mile', factor: 1852 }
      }
    },
    weight: {
      name: 'Weight',
      icon: '⚖️',
      units: {
        kilogram: { name: 'Kilogram', factor: 1 },
        gram: { name: 'Gram', factor: 0.001 },
        pound: { name: 'Pound', factor: 0.453592 },
        ounce: { name: 'Ounce', factor: 0.0283495 },
        ton: { name: 'Metric Ton', factor: 1000 },
        stone: { name: 'Stone', factor: 6.35029 }
      }
    },
    temperature: {
      name: 'Temperature',
      icon: '🌡️',
      units: {
        celsius: { name: 'Celsius' },
        fahrenheit: { name: 'Fahrenheit' },
        kelvin: { name: 'Kelvin' }
      }
    },
    volume: {
      name: 'Volume',
      icon: '🥤',
      units: {
        liter: { name: 'Liter', factor: 1 },
        milliliter: { name: 'Milliliter', factor: 0.001 },
        gallon: { name: 'Gallon (US)', factor: 3.78541 },
        quart: { name: 'Quart (US)', factor: 0.946353 },
        pint: { name: 'Pint (US)', factor: 0.473176 },
        cup: { name: 'Cup (US)', factor: 0.236588 },
        fluidOunce: { name: 'Fluid Ounce (US)', factor: 0.0295735 },
        tablespoon: { name: 'Tablespoon', factor: 0.0147868 },
        teaspoon: { name: 'Teaspoon', factor: 0.00492892 }
      }
    },
    area: {
      name: 'Area',
      icon: '📐',
      units: {
        squareMeter: { name: 'Square Meter', factor: 1 },
        squareKilometer: { name: 'Square Kilometer', factor: 1000000 },
        squareCentimeter: { name: 'Square Centimeter', factor: 0.0001 },
        squareInch: { name: 'Square Inch', factor: 0.00064516 },
        squareFoot: { name: 'Square Foot', factor: 0.092903 },
        squareYard: { name: 'Square Yard', factor: 0.836127 },
        acre: { name: 'Acre', factor: 4046.86 },
        hectare: { name: 'Hectare', factor: 10000 }
      }
    },
    speed: {
      name: 'Speed',
      icon: '🏃',
      units: {
        meterPerSecond: { name: 'Meter/Second', factor: 1 },
        kilometerPerHour: { name: 'Kilometer/Hour', factor: 0.277778 },
        milePerHour: { name: 'Mile/Hour', factor: 0.44704 },
        knot: { name: 'Knot', factor: 0.514444 },
        footPerSecond: { name: 'Foot/Second', factor: 0.3048 }
      }
    }
  };

  const convertTemperature = (value, from, to) => {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        return 0;
    }
    
    // Convert from Celsius to target
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return 0;
    }
  };

  const convertUnits = (value, category, from, to) => {
    if (!value || !from || !to || from === to) return value;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    if (category === 'temperature') {
      return convertTemperature(numValue, from, to);
    }
    
    const units = unitCategories[category].units;
    const fromFactor = units[from]?.factor || 1;
    const toFactor = units[to]?.factor || 1;
    
    return (numValue * fromFactor) / toFactor;
  };

  useEffect(() => {
    const units = Object.keys(unitCategories[selectedCategory].units);
    setFromUnit(units[0] || '');
    setToUnit(units[1] || units[0] || '');
    setInputValue('');
    setResult('');
  }, [selectedCategory]);

  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      const converted = convertUnits(inputValue, selectedCategory, fromUnit, toUnit);
      setResult(converted ? converted.toString() : '');
    } else {
      setResult('');
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(result);
  };

  const currentCategory = unitCategories[selectedCategory];
  const unitOptions = Object.entries(currentCategory.units);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Universal Unit Converter
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Convert between different units with precision and ease</p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {Object.entries(unitCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedCategory === key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg scale-105'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-25'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
            </button>
          ))}
        </div>

        {/* Converter Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <span className="text-3xl">{currentCategory.icon}</span>
              {currentCategory.name} Converter
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* From Unit */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {unitOptions.map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            {/* To Unit */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {unitOptions.map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
              <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-lg font-semibold text-gray-800 min-h-[3rem] flex items-center">
                {result && !isNaN(parseFloat(result)) ? parseFloat(result).toLocaleString(undefined, {maximumFractionDigits: 10}) : '0'}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={swapUnits}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              title="Swap units"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Convert Buttons */}
          {inputValue && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Convert to Other Units
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {unitOptions
                  .filter(([key]) => key !== fromUnit)
                  .map(([key, unit]) => {
                    const converted = convertUnits(inputValue, selectedCategory, fromUnit, key);
                    return (
                      <button
                        key={key}
                        onClick={() => setToUnit(key)}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          toUnit === key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        <div className="font-semibold">{unit.name}</div>
                        <div className="text-xs opacity-75">
                          {converted && !isNaN(parseFloat(converted)) ? parseFloat(converted).toLocaleString(undefined, {maximumFractionDigits: 4}) : '0'}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;