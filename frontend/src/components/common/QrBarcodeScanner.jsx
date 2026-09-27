import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QrBarcodeScanner({ onScan, onClose, title = "Scan ID Card QR / Book Barcode" }) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const scannerRef = useRef(null);
  const readerId = useRef(`reader-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let html5QrCode = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(readerId.current);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            setLastScanned(decodedText);
            // Visual confirmation before closing
            setTimeout(() => {
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                  onScan(decodedText);
                  onClose();
                }).catch(() => {
                  onScan(decodedText);
                  onClose();
                });
              } else {
                onScan(decodedText);
                onClose();
              }
            }, 400);
          },
          (errorMessage) => {
            // Ignore ongoing frame search errors
          }
        );
        setScanning(true);
      } catch (err) {
        console.error("Camera scanner error:", err);
        setError("Unable to access camera. Please allow camera permissions or enter the code manually.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId.current);
      }
      const result = await scannerRef.current.scanFile(file, true);
      setLastScanned(result);
      setTimeout(() => {
        onScan(result);
        onClose();
      }, 300);
    } catch (err) {
      setError("No readable QR code or barcode found in the uploaded image.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-600 rounded-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-400">Position ID Card QR or Book Barcode in view</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="p-6">
          {error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Camera Notice</span>
              </div>
              <p>{error}</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <div id={readerId.current} className="w-full min-h-[280px]"></div>
              
              {/* Scan Overlay Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-0.5 -ml-0.5 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-0.5 -mr-0.5 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-0.5 -ml-0.5 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-0.5 -mr-0.5 rounded-br"></div>
                </div>
              </div>
            </div>
          )}

          {lastScanned && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Scanned Code: {lastScanned}</span>
            </div>
          )}

          {/* Alternative File Scan */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 hover:text-emerald-700 font-semibold">
              <Upload className="w-4 h-4" />
              <span>Scan Image / Screenshot</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
