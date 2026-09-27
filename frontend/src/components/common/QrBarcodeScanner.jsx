import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, Upload, AlertCircle, CheckCircle2, SwitchCamera, Video } from 'lucide-react';

export default function QrBarcodeScanner({ onScan, onClose, title = "Scan ID Card QR / Book Barcode" }) {
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef(null);
  const readerId = useRef(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);

  // Parse scanned text to extract reg_number or clean barcode
  const parseScannedData = (text) => {
    if (!text) return '';
    const trimmed = text.trim();
    // 1. If JSON format (e.g. {"reg_number": "2022/ICT/125"})
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.reg_number || parsed.id || parsed.username || trimmed;
      } catch (e) {
        // Fall through
      }
    }
    // 2. If prefixed with ID: or REG:
    if (trimmed.toLowerCase().startsWith('id:') || trimmed.toLowerCase().startsWith('reg:')) {
      return trimmed.split(':')[1].trim();
    }
    return trimmed;
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop issue:", err);
      }
    }
  };

  const startCamera = async (cameraSource) => {
    await stopCamera();
    setIsInitializing(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode(readerId.current);
      scannerRef.current = html5QrCode;

      // Notice: Do NOT force aspectRatio: 1.0!
      // Allowing native video aspect ratio prevents the Windows split-camera / double-view bug.
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(180, Math.floor(minDim * 0.72));
          return { width: size, height: size };
        },
      };

      await html5QrCode.start(
        cameraSource,
        config,
        (decodedText) => {
          const parsed = parseScannedData(decodedText);
          setLastScanned(parsed);
          setTimeout(() => {
            stopCamera().then(() => {
              onScan(parsed);
              onClose();
            });
          }, 350);
        },
        () => {
          // ignore scan frame misses
        }
      );
      setIsInitializing(false);
    } catch (err) {
      console.error("Camera start error:", err);
      setError("Cannot access webcam. Please check browser camera permissions or select another camera device.");
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Html5Qrcode.getCameras().then((devices) => {
      if (!isMounted) return;
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer rear/environment camera on phones, or first device on laptops
        const preferred = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        ) || devices[0];
        
        setSelectedCameraId(preferred.id);
        startCamera(preferred.id);
      } else {
        // If device enumeration is blocked, fallback to user facing
        startCamera({ facingMode: "user" });
      }
    }).catch(() => {
      // Fallback directly
      startCamera({ facingMode: "user" });
    });

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    startCamera(newId);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId.current);
      }
      const result = await scannerRef.current.scanFile(file, true);
      const parsed = parseScannedData(result);
      setLastScanned(parsed);
      setTimeout(() => {
        stopCamera().then(() => {
          onScan(parsed);
          onClose();
        });
      }, 300);
    } catch (err) {
      setError("No readable QR code or barcode found in the uploaded image.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-400">Position ID card QR or book barcode in frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Selector (If multiple cameras detected) */}
        {cameras.length > 1 && (
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 font-medium">
              <SwitchCamera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera:</span>
            </div>
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="bg-slate-900 text-white rounded-lg px-2.5 py-1 text-xs border border-slate-700 focus:outline-none"
            >
              {cameras.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Viewport */}
        <div className="p-6">
          {error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs mb-4">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Camera Notice</span>
              </div>
              <p>{error}</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              {/* html5-qrcode mount point */}
              <div 
                id={readerId.current} 
                className="w-full min-h-[300px] flex items-center justify-center [&_video]:w-full [&_video]:h-auto [&_video]:max-h-[380px] [&_video]:object-contain [&_video]:mx-auto"
              ></div>
              
              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white space-y-2 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                  <span className="text-xs text-slate-400">Initializing camera feed...</span>
                </div>
              )}

              {/* Scan Overlay Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br"></div>
                </div>
              </div>
            </div>
          )}

          {lastScanned && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Decoded ID: {lastScanned}</span>
            </div>
          )}

          {/* Fallback Option */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 hover:text-emerald-700 font-semibold">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload ID Card Image / Photo</span>
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
