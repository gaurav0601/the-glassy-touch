'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ImageCropper — A client-side image cropper/fitter.
 * Supports drag-to-pan, pinch/scroll-to-zoom, and preset aspect ratios.
 *
 * Props:
 *   imageUrl (string)  — source image (data URL or HTTP URL)
 *   onCrop (fn)        — callback with cropped Blob
 *   onCancel (fn)      — callback to close
 *   aspectRatio (num)  — default aspect ratio (1 = square, 4/3, 16/9, or 0 = free)
 */
export default function ImageCropper({ imageUrl, onCrop, onCancel, aspectRatio: initialRatio = 1 }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(initialRatio);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const CROP_SIZE = 400; // px for the crop area

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
      // Auto-fit: zoom so image covers the crop area
      const cropW = aspectRatio > 0 ? CROP_SIZE : CROP_SIZE;
      const cropH = aspectRatio > 0 ? CROP_SIZE / aspectRatio : CROP_SIZE;
      const scaleX = cropW / img.width;
      const scaleY = cropH / img.height;
      setZoom(Math.max(scaleX, scaleY) * 1.05);
      setPan({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [imageUrl, aspectRatio]);

  // Draw
  useEffect(() => {
    if (!loaded || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    const cropW = aspectRatio > 0 ? CROP_SIZE : CROP_SIZE;
    const cropH = aspectRatio > 0 ? CROP_SIZE / aspectRatio : CROP_SIZE;
    canvas.width = CROP_SIZE + 80;
    canvas.height = (aspectRatio > 0 ? CROP_SIZE / aspectRatio : CROP_SIZE) + 80;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const drawW = img.width * zoom;
    const drawH = img.height * zoom;
    ctx.drawImage(img, cx - drawW / 2 + pan.x, cy - drawH / 2 + pan.y, drawW, drawH);

    // Dark overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    // Top
    ctx.fillRect(0, 0, canvas.width, cy - cropH / 2);
    // Bottom
    ctx.fillRect(0, cy + cropH / 2, canvas.width, canvas.height - (cy + cropH / 2));
    // Left
    ctx.fillRect(0, cy - cropH / 2, cx - cropW / 2, cropH);
    // Right
    ctx.fillRect(cx + cropW / 2, cy - cropH / 2, canvas.width - (cx + cropW / 2), cropH);

    // Crop border
    ctx.strokeStyle = '#d4a853';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cx - cropW / 2, cy - cropH / 2, cropW, cropH);
    ctx.setLineDash([]);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      // Vertical
      ctx.beginPath();
      ctx.moveTo(cx - cropW / 2 + (cropW / 3) * i, cy - cropH / 2);
      ctx.lineTo(cx - cropW / 2 + (cropW / 3) * i, cy + cropH / 2);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(cx - cropW / 2, cy - cropH / 2 + (cropH / 3) * i);
      ctx.lineTo(cx + cropW / 2, cy - cropH / 2 + (cropH / 3) * i);
      ctx.stroke();
    }
  }, [loaded, zoom, pan, aspectRatio]);

  // Mouse handlers
  const handleMouseDown = useCallback((e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  }, [dragging, dragStart]);

  // Scroll to zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.1, Math.min(5, prev + (e.deltaY > 0 ? -0.05 : 0.05))));
  }, []);

  // Crop and export
  const handleCrop = useCallback(async () => {
    if (!imgRef.current || !canvasRef.current) return;
    setProcessing(true);

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const cropW = aspectRatio > 0 ? CROP_SIZE : CROP_SIZE;
    const cropH = aspectRatio > 0 ? CROP_SIZE / aspectRatio : CROP_SIZE;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Calculate which part of the source image is in the crop area
    const drawW = img.width * zoom;
    const drawH = img.height * zoom;
    const imgX = cx - drawW / 2 + pan.x;
    const imgY = cy - drawH / 2 + pan.y;

    const srcX = ((cx - cropW / 2) - imgX) / zoom;
    const srcY = ((cy - cropH / 2) - imgY) / zoom;
    const srcW = cropW / zoom;
    const srcH = cropH / zoom;

    // Export at high quality (up to 1200px wide)
    const exportW = Math.min(1200, srcW);
    const exportH = (exportW / srcW) * srcH;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;
    const ectx = exportCanvas.getContext('2d');
    ectx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, exportW, exportH);

    exportCanvas.toBlob(
      (blob) => {
        setProcessing(false);
        if (blob) onCrop(blob);
      },
      'image/jpeg',
      0.88
    );
  }, [zoom, pan, aspectRatio, onCrop]);

  const presets = [
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:4', value: 3 / 4 },
    { label: '16:9', value: 16 / 9 },
    { label: 'Free', value: 0 },
  ];

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="cropper-header">
          <h3>✂️ Crop & Fit Image</h3>
          <button className="cropper-close" onClick={onCancel}>✕</button>
        </div>

        <div className="cropper-presets">
          {presets.map(p => (
            <button
              key={p.label}
              className={`cropper-preset-btn ${aspectRatio === p.value ? 'active' : ''}`}
              onClick={() => setAspectRatio(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div
          ref={containerRef}
          className="cropper-canvas-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
        >
          <canvas ref={canvasRef} style={{ maxWidth: '100%', cursor: dragging ? 'grabbing' : 'grab' }} />
          {!loaded && <div className="cropper-loading">Loading image...</div>}
        </div>

        <div className="cropper-zoom-control">
          <span>🔍</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <span>{Math.round(zoom * 100)}%</span>
        </div>

        <p className="cropper-hint">Drag to move • Scroll to zoom • Pick an aspect ratio above</p>

        <div className="cropper-actions">
          <button className="cropper-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="cropper-btn-apply" onClick={handleCrop} disabled={processing || !loaded}>
            {processing ? 'Processing...' : '✅ Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
