import React, { useState, useRef, useEffect } from 'react';
import { generateSchematic, Axis } from './utils/converter';

function App() {
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [height, setHeight] = useState<number>(32);
  const [axis, setAxis] = useState<Axis>(Axis.Z);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("Please select an image.");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgFile(file);
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      setStatus("Image loaded. Adjust height and convert.");
    }
  };

  // Preview Logic
  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return;

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const aspect = img.width / img.height;
      const targetHeight = height;
      const targetWidth = Math.round(targetHeight * aspect);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      setStatus(`Preview: ${targetWidth}x${targetHeight} blocks`);
    };
  }, [imgSrc, height]);

  const handleConvert = async () => {
    if (!imgSrc || !canvasRef.current) return;
    setIsProcessing(true);
    setStatus("Converting...");

    try {
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");

      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);

      const blob = generateSchematic(imgData.data, w, h, axis);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image_${w}x${h}.bloxdschem`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("Download started! Import into Bloxd.io.");
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">
          Bloxd Image Converter
        </h1>
        
        <div className="space-y-6">
          
          {/* File Input */}
          <div>
            <label className="block text-gray-400 mb-2 font-medium">1. Select Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-700 file:text-green-400
                hover:file:bg-gray-600 cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 mb-2 font-medium">2. Height (Blocks)</label>
              <input 
                type="number" 
                value={height}
                min={1}
                max={512}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 mb-2 font-medium">3. Orientation</label>
              <select 
                value={axis}
                onChange={(e) => setAxis(e.target.value as Axis)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value={Axis.Z}>Wall (Front View)</option>
                <option value={Axis.X}>Floor (Flat View)</option>
              </select>
            </div>
          </div>

          {/* Status Bar */}
          <div className={`p-3 rounded-lg font-mono text-sm text-center ${status.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-gray-900 text-yellow-300'}`}>
            {status}
          </div>

          {/* Action Button */}
          <button
            onClick={handleConvert}
            disabled={!imgFile || isProcessing}
            className={`w-full py-3.5 rounded-lg font-bold text-lg transition-all
              ${!imgFile || isProcessing 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/20 active:scale-[0.98]'
              }`}
          >
            {isProcessing ? 'Converting...' : 'Convert & Download'}
          </button>

          {/* Canvas Preview */}
          <div className="mt-6 flex justify-center bg-black/40 p-4 rounded-lg border border-gray-700 min-h-[100px] items-center">
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto border border-gray-600 shadow-md"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Note: 32+ block chunks supported. "Horizontal bar" artifacts fixed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;