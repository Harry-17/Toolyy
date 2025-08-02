import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, RefreshCw, Download, Eye, EyeOff, Shield, QrCode } from 'lucide-react';

const PasswordQRGenerator = () => {
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const canvasRef = useRef(null);
  
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false
  });

  const [qrOptions, setQrOptions] = useState({
    text: '',
    size: 200,
    errorCorrection: 'M'
  });

  const generatePassword = () => {
    let charset = '';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (options.excludeSimilar) charset = charset.replace(/[0O1lI]/g, '');
    if (!charset) return alert('Please select at least one character type');

    let newPassword = '';
    for (let i = 0; i < options.length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setCopied(false);
  };

  const generateQRCode = async () => {
    if (!qrOptions.text.trim()) {
      alert('Please enter text for QR code');
      return;
    }

    try {
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, qrOptions.text, {
        width: qrOptions.size,
        errorCorrectionLevel: qrOptions.errorCorrection
      });

      const dataUrl = canvas.toDataURL('image/png');
      setQrCode(dataUrl);
      setQrCopied(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code.');
    }
  };

  const copyToClipboard = async (text, isQR = false) => {
    try {
      if (isQR && qrCode) {
        await navigator.clipboard.writeText(qrCode);
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    link.click();
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { text: 'Weak', color: 'text-red-500', bg: 'bg-red-100' };
    if (score <= 4) return { text: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { text: 'Strong', color: 'text-green-500', bg: 'bg-green-100' };
  };

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Security Tools</h1>
          <p className="text-gray-600">Generate secure passwords and QR codes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Password Generator */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Password Generator</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length: {options.length}
                </label>
                <input
                  type="range"
                  min="4"
                  max="50"
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'uppercase', label: 'Uppercase (A-Z)' },
                  { key: 'lowercase', label: 'Lowercase (a-z)' },
                  { key: 'numbers', label: 'Numbers (0-9)' },
                  { key: 'symbols', label: 'Symbols (!@#$...)' }
                ].map(option => (
                  <label key={option.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options[option.key]}
                      onChange={(e) => setOptions({ ...options, [option.key]: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Exclude similar characters (0, O, 1, l, I)</span>
              </label>
            </div>

            <button
              onClick={generatePassword}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 mb-4"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Password
            </button>

            {password && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 p-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      readOnly
                      className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(password)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {copied && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Copied!
                    </div>
                  )}
                </div>

                {strength && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${strength.bg} ${strength.color}`}>
                    Strength: {strength.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Code Generator */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <QrCode className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">QR Code Generator</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text or URL
                </label>
                <textarea
                  value={qrOptions.text}
                  onChange={(e) => setQrOptions({ ...qrOptions, text: e.target.value })}
                  placeholder="Enter text, URL, or data to encode..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {qrOptions.size}px
                </label>
                <input
                  type="range"
                  min="150"
                  max="400"
                  step="50"
                  value={qrOptions.size}
                  onChange={(e) => setQrOptions({ ...qrOptions, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={generateQRCode}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <QrCode className="w-4 h-4" />
              Generate QR Code
            </button>

            {qrCode && (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                  <img src={qrCode} alt="Generated QR Code" className="max-w-full h-auto" />
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard('', true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      qrCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {qrCopied ? 'Copied!' : 'Copy Data URL'}
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Keep your passwords secure and never share them. QR codes are generated client-side.</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordQRGenerator;
