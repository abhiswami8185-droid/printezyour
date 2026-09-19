import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  FolderOpen
} from 'lucide-react';
import { Product, ServiceItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export interface ImageManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    type: 'product' | 'service';
    id: string;
    name: string;
    category?: string;
    currentImage: string;
  } | null;
  onImageSaved: (newImageUrl: string) => void;
}

// Curated realistic sample assets for quick selection
const REALISTIC_SAMPLE_LIBRARY = [
  { label: 'Matte Visiting Cards', url: '/images/products/visiting-cards-matte.jpg', tag: 'Cards' },
  { label: 'Velvet Business Cards', url: '/images/products/visiting-cards-velvet.jpg', tag: 'Cards' },
  { label: 'Die-Cut Vinyl Stickers', url: '/images/products/stickers-diecut.jpg', tag: 'Stickers' },
  { label: 'Rollup Flex Banner', url: '/images/products/flex-banner.jpg', tag: 'Banners' },
  { label: 'Kraft Paper Bags', url: '/images/products/carry-bags-kraft.jpg', tag: 'Bags' },
  { label: 'Butter Paper Wrap', url: '/images/products/butter-paper.jpg', tag: 'Food Wrap' },
  { label: 'UV Sunboard Display', url: '/images/products/sunboard-display.jpg', tag: 'Signage' },
  { label: 'Corrugated Mailer Box', url: '/images/products/mailer-boxes.jpg', tag: 'Boxes' },
  { label: 'Promotional Gloss Flyers', url: '/images/products/flyers-brochures.jpg', tag: 'Flyers' },
  { label: 'Executive Metal Pen', url: '/images/products/metal-pen.jpg', tag: 'Pens' },
  { label: 'Staff PVC ID Card', url: '/images/products/id-card-lanyard.jpg', tag: 'ID Cards' },
  { label: 'Ceramic Sublimation Mug', url: '/images/products/ceramic-mug.jpg', tag: 'Mugs' },
  { label: 'Branded T-Shirt Apparel', url: '/images/products/apparel-tshirt.jpg', tag: 'Apparel' }
];

export const ImageManagementModal: React.FC<ImageManagementModalProps> = ({
  isOpen,
  onClose,
  item,
  onImageSaved
}) => {
  const { role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'library'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9'>('4:3');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Initialize state whenever item changes
  useEffect(() => {
    if (item && isOpen) {
      const current = item.currentImage || '';
      setPreviewUrl(current);
      setUrlInput(current.startsWith('http') ? current : '');
      setSelectedFile(null);
      setErrorMessage(null);
      setSuccessNotice(null);
      setZoomLevel(1);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

    if (!validTypes.includes(file.type) && (!ext || !validExts.includes(ext))) {
      setErrorMessage('Invalid file format. Please upload a JPG, PNG, WebP, or SVG image.');
      return;
    }

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    setSelectedFile(file);

    // Generate local preview
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    setErrorMessage(null);
    setPreviewUrl(urlInput.trim());
    setSelectedFile(null);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setPreviewUrl(sampleUrl);
    setUrlInput(sampleUrl);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!previewUrl && !selectedFile) {
      setErrorMessage('Please select or upload an image before saving.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let finalImageUrl = previewUrl;

      // 1. If a local file was chosen, upload it to the backend server
      if (selectedFile) {
        const uploadResult = await api.uploadArtwork(selectedFile);
        finalImageUrl = uploadResult.url;
      }

      // Add cache buster parameter if needed
      const cacheBustedUrl = finalImageUrl.includes('?')
        ? `${finalImageUrl}&t=${Date.now()}`
        : `${finalImageUrl}?t=${Date.now()}`;

      // 2. Persist to Product or Service record
      if (item.type === 'product') {
        await api.updateProductImage(item.id, cacheBustedUrl, role);
      } else {
        await api.updateServiceImage(item.id, cacheBustedUrl, role);
      }

      setSuccessNotice('Image updated successfully!');
      onImageSaved(cacheBustedUrl);

      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to save image:', err);
      setErrorMessage(err.message || 'Failed to save image. Please check your network and try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {item.type === 'product' ? 'Product Photo' : 'Service Photo'}
                </span>
                {item.category && (
                  <span className="text-[10px] text-slate-500 font-medium">{item.category}</span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Image Controls & Methods (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'upload'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'url'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Image URL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('library')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'library'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample Presets</span>
              </button>
            </div>

            {/* TAB 1: File Upload / Drag & Drop */}
            {activeMode === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                />

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-1">
                    Drag & drop product photo here, or <span className="text-blue-600 underline">browse</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports high-res JPG, PNG, WebP or SVG (Up to 10 MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{selectedFile.name}</span>
                      <span className="text-slate-500 text-[10px]">
                        ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(item.currentImage);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                      title="Remove selected file"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Direct URL */}
            {activeMode === 'url' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Direct Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="https://example.com/images/sample.jpg or /images/..."
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      onKeyDown={e => e.key === 'Enter' && handleApplyUrl()}
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Accepts HTTPS URLs or local public paths (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">/images/products/...</code>).
                </p>
              </div>
            )}

            {/* TAB 3: Sample Presets */}
            {activeMode === 'library' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 mb-1">
                  Realistic Category Sample Assets
                </div>
                <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-2">
                  {REALISTIC_SAMPLE_LIBRARY.map((sample, idx) => {
                    const isSelected = previewUrl === sample.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(sample.url)}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.label}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-slate-900 truncate">
                            {sample.label}
                          </div>
                          <span className="text-[9px] font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded-full">
                            {sample.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live Preview</span>
                </div>
                {/* Fit Mode Toggle */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFitMode('cover')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                      fitMode === 'cover' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitMode('contain')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                      fitMode === 'contain' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Contain
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1 mb-2.5">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Ratio:</span>
                {(['4:3', '1:1', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Preview Canvas */}
              <div
                className={`relative w-full rounded-xl border border-slate-300 bg-slate-900/5 overflow-hidden flex items-center justify-center transition-all ${
                  aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-4/3'
                }`}
              >
                {previewUrl && typeof previewUrl === 'string' && previewUrl.trim().length > 0 ? (
                  <img
                    src={previewUrl.trim()}
                    alt="Preview"
                    className={`w-full h-full transition-transform duration-200 ${
                      fitMode === 'cover' ? 'object-cover' : 'object-contain'
                    }`}
                    style={{ transform: `scale(${zoomLevel})` }}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setErrorMessage('Could not load image preview. Please verify URL or file format.');
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[11px]">No image selected</span>
                  </div>
                )}

                {/* Reset zoom floating badge */}
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs"
                  >
                    Reset ({zoomLevel}x)
                  </button>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                <span className="text-[10px] font-semibold">Inspect Detail:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                    className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono w-10 text-center font-bold">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                    className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Current vs New Status */}
            <div className="text-[10px] text-slate-400 space-y-0.5 bg-white p-2 rounded-lg border border-slate-200/80">
              <div className="truncate">
                <span className="font-semibold text-slate-600">Active URL: </span>
                <span className="font-mono text-slate-500">{previewUrl || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading || (!previewUrl && !selectedFile)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Applying Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
