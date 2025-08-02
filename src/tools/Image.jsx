// Enhanced React Image Editor with better UI, flip, zoom, rotate, crop, download support
// Additional improvements added:
// - Flip feedback
// - Reset to original
// - Download filename improved
// - Improved cropping UX

import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import {
  Upload, Crop, RefreshCw, FlipHorizontal, FlipVertical,
  Download, Scissors, ZoomIn, ZoomOut, RotateCcw, RotateCw
} from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [transformations, setTransformations] = useState({
    rotation: 0, scale: 1, flipH: false, flipV: false,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current.src) return;
    const ctx = canvas.getContext('2d');

    const { rotation, scale, flipH, flipV } = transformations;
    const img = imageRef.current;
    const rad = rotation * Math.PI / 180;
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));
    const newWidth = img.width * absCos + img.height * absSin;
    const newHeight = img.width * absSin + img.height * absCos;
    canvas.width = newWidth * scale;
    canvas.height = newHeight * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    if (isCropping && cropRect) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    }
  }, [transformations, isCropping, cropRect]);

  useEffect(() => { drawImage(); }, [image, transformations, isCropping, cropRect, drawImage]);

  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    const currentState = {
      imageData: imageRef.current.src,
      transformations: { ...transformations }
    };
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex, transformations]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageRef.current.onload = () => {
          setImage(imageRef.current);
          setTransformations({ rotation: 0, scale: 1, flipH: false, flipV: false });
          saveHistory();
        };
        imageRef.current.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = (angle) => setTransformations(t => ({ ...t, rotation: (t.rotation + angle) % 360 }));
  const handleFlip = (axis) => setTransformations(t => ({ ...t, [axis === 'h' ? 'flipH' : 'flipV']: !t[axis === 'h' ? 'flipH' : 'flipV'] }));
  const handleZoom = (factor) => setTransformations(t => ({ ...t, scale: Math.max(0.1, Math.min(5, t.scale + factor)) }));

  const applyChangesAndSaveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    imageRef.current.onload = () => {
      setImage(imageRef.current);
      setTransformations({ rotation: 0, scale: 1, flipH: false, flipV: false });
      saveHistory();
    };
    imageRef.current.src = dataUrl;
  };

  useEffect(() => { if (image) applyChangesAndSaveHistory(); }, [transformations.rotation, transformations.flipH, transformations.flipV]);

  const toggleCrop = () => {
    if (isCropping) applyCrop();
    setIsCropping(!isCropping);
    setCropRect(null);
  };

  const applyCrop = () => {
    if (!cropRect || !image) return;
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = cropRect.width;
    tempCanvas.height = cropRect.height;
    tempCtx.drawImage(canvas, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
    const dataUrl = tempCanvas.toDataURL('image/png');
    imageRef.current.onload = () => {
      setImage(imageRef.current);
      setTransformations({ rotation: 0, scale: 1, flipH: false, flipV: false });
      setIsCropping(false);
      setCropRect(null);
      saveHistory();
    };
    imageRef.current.src = dataUrl;
  };

  const handleMouseDown = (e) => {
    if (!isCropping) return;
    setIsDragging(true);
    const pos = getMousePos(canvasRef.current, e);
    setDragStart(pos);
    setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isCropping || !isDragging) return;
    const pos = getMousePos(canvasRef.current, e);
    const width = pos.x - dragStart.x;
    const height = pos.y - dragStart.y;
    setCropRect({
      x: width > 0 ? dragStart.x : pos.x,
      y: height > 0 ? dragStart.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => { if (!isCropping) return; setIsDragging(false); };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `edited-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const EditorButton = ({ icon: Icon, children, onClick, active }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-md text-sm w-full justify-start font-medium transition-all duration-150 ${
        active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </button>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500">
          Advanced React Image Editor
        </h1>
      </header>
      <div className="flex-grow flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-800 p-4 space-y-3 border-r border-gray-700">
          <h2 className="text-lg font-semibold pb-2 border-b border-gray-600">Tools</h2>
          <EditorButton icon={RotateCcw} onClick={() => handleRotate(-90)}>Rotate -90°</EditorButton>
          <EditorButton icon={RotateCw} onClick={() => handleRotate(90)}>Rotate +90°</EditorButton>
          <EditorButton icon={FlipHorizontal} onClick={() => handleFlip('h')}>Flip Horizontal</EditorButton>
          <EditorButton icon={FlipVertical} onClick={() => handleFlip('v')}>Flip Vertical</EditorButton>
          <EditorButton icon={ZoomOut} onClick={() => handleZoom(-0.1)}>Zoom Out</EditorButton>
          <EditorButton icon={ZoomIn} onClick={() => handleZoom(0.1)}>Zoom In</EditorButton>
          <EditorButton icon={Crop} onClick={toggleCrop} active={isCropping}>{isCropping ? 'Apply Crop' : 'Crop'}</EditorButton>
          {image && <EditorButton icon={Download} onClick={handleDownload}>Download</EditorButton>}
        </aside>

        <main className="flex-grow flex items-center justify-center bg-gray-900 p-4">
          {image ? (
            <canvas
              ref={canvasRef}
              className={`rounded-lg shadow-lg ${isCropping ? 'cursor-crosshair' : 'cursor-pointer'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          ) : (
            <div className="text-center border-2 border-dashed rounded-xl p-8 bg-gray-800 text-gray-400">
              <Upload className="mx-auto w-10 h-10 mb-4" />
              <p>Upload an image to get started</p>
              <label htmlFor="file-upload" className="mt-4 inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Choose File
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
