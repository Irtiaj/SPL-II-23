import React, { useState, useRef } from 'react';

/**
 * CleanupUpload
 * Props:
 *   onSubmit — async fn({ file, latitude, longitude }) — called when user submits
 *   loading  — bool, shows spinner on submit button
 */
const CleanupUpload = ({ onSubmit, loading }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selected);
    // Auto-capture location when a photo is selected
    captureLocation();
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your device');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError('Could not get location. Please enable GPS.');
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({ file, latitude: location?.latitude, longitude: location?.longitude });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload area */}
      {!preview ? (
        <label
          htmlFor="cleanup-photo-input"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <span className="text-5xl mb-3">📸</span>
          <p className="font-semibold text-gray-700">Take or upload a photo</p>
          <p className="text-sm text-gray-500 mt-1">Tap here to capture cleanup evidence</p>
          <input
            ref={fileInputRef}
            id="cleanup-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden border-2 border-green-300">
          <img src={preview} alt="Cleanup evidence preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-opacity-80"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <p className="text-white text-xs font-medium">📸 After-cleanup photo ready</p>
          </div>
        </div>
      )}

      {/* Location status */}
      <div className="flex items-center gap-2 text-sm px-1">
        {locationLoading && (
          <span className="text-blue-600">📡 Capturing GPS location…</span>
        )}
        {!locationLoading && location && (
          <span className="text-green-600">
            ✅ Location captured ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
          </span>
        )}
        {!locationLoading && !location && !locationError && (
          <span className="text-gray-400">📍 Location will be captured when you select a photo</span>
        )}
        {locationError && (
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⚠️ {locationError}</span>
            <button onClick={captureLocation} className="text-blue-600 text-xs underline">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all
          ${!file || loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-md'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting…
          </span>
        ) : (
          '✅ Submit Cleanup Evidence'
        )}
      </button>
    </div>
  );
};

export default CleanupUpload;
