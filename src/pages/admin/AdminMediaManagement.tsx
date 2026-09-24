import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Play,
  Volume2,
  VolumeX,
  Star,
  Plus,
  Search,
  Filter,
  Save,
  Check,
  Sparkles,
  Layers,
  FolderOpen
} from 'lucide-react';
import { MediaItem, Product, ServiceItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/assets';

interface AdminMediaManagementProps {
  products: Product[];
  services: ServiceItem[];
  onProductsUpdated?: () => void;
  onServicesUpdated?: () => void;
}

export const AdminMediaManagement: React.FC<AdminMediaManagementProps> = ({
  products,
  services,
  onProductsUpdated,
  onServicesUpdated
}) => {
  const { hasPermission } = useAuth();

  // Active top tab
  const [activeTab, setActiveTab] = useState<'showcase' | 'products' | 'services'>('showcase');

  // Permissions
  const canUpload = hasPermission('media.upload');
  const canEdit = hasPermission('media.edit');
  const canDelete = hasPermission('media.delete');
  const canReorder = hasPermission('media.reorder');

  // --------------------------------------------------------------------------
  // TAB A: HOME SHOWCASE STATE
  // --------------------------------------------------------------------------
  const [showcaseMedia, setShowcaseMedia] = useState<MediaItem[]>([]);
  const [loadingShowcase, setLoadingShowcase] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);

  // Replace file state
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  // Lightbox Preview
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [previewMuted, setPreviewMuted] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaItem | null>(null);

  // Drag and drop ordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // File input refs
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch showcase items
  const fetchShowcaseMedia = async () => {
    setLoadingShowcase(true);
    try {
      const items = await api.getMedia({ section: 'home_showcase' });
      setShowcaseMedia(Array.isArray(items) ? items : []);
      setHasUnsavedOrder(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load showcase media');
    } finally {
      setLoadingShowcase(false);
    }
  };

  useEffect(() => {
    fetchShowcaseMedia();
  }, []);

  // Multi-upload handler
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(`Uploading ${files.length} file(s)...`);

    try {
      const fileList: File[] = Array.from(files);
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'];

      // Client validation
      for (const file of fileList) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedExts.includes(ext)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please upload JPG, PNG, WEBP, MP4, or WEBM.`);
        }
        if (file.size > 100 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 100MB limit.`);
        }
      }

      const uploadedItems = await api.uploadMedia(fileList, 'home_showcase');
      setSuccessMessage(`Successfully uploaded ${uploadedItems.length} media file(s).`);
      fetchShowcaseMedia();
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = '';
      }
    }
  };

  // Toggle active status
  const handleToggleActive = async (item: MediaItem) => {
    if (!canEdit) return;
    try {
      const newStatus = !item.active;
      await api.updateMedia(item.id, { active: newStatus });
      setShowcaseMedia(prev =>
        prev.map(m => (m.id === item.id ? { ...m, active: newStatus } : m))
      );
      setSuccessMessage(`Showcase item "${item.title}" is now ${newStatus ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update item status');
    }
  };

  // Replace media file
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingItemId) return;

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await api.replaceMedia(replacingItemId, file);
      setShowcaseMedia(prev => prev.map(m => (m.id === replacingItemId ? updated : m)));
      setSuccessMessage(`File replaced successfully for "${updated.title}".`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to replace file');
    } finally {
      setUploading(false);
      setReplacingItemId(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Delete media item
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem || !canDelete) return;
    try {
      await api.deleteMedia(deleteConfirmItem.id);
      setShowcaseMedia(prev => prev.filter(m => m.id !== deleteConfirmItem.id));
      setSuccessMessage(`Showcase item "${deleteConfirmItem.title}" deleted.`);
      setDeleteConfirmItem(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete media item');
    }
  };

  // Reorder buttons (Move Up / Down)
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (!canReorder) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= showcaseMedia.length) return;

    const list = [...showcaseMedia];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setShowcaseMedia(list);
    setHasUnsavedOrder(true);
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    if (!canReorder) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !canReorder) return;

    const list = [...showcaseMedia];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setShowcaseMedia(list);
    setHasUnsavedOrder(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save ordering to backend
  const handleSaveOrder = async () => {
    if (!canReorder) return;
    setUploading(true);
    setErrorMessage(null);
    try {
      const orderedIds = showcaseMedia.map(m => m.id);
      const updatedList = await api.reorderMedia(orderedIds);
      setShowcaseMedia(updatedList);
      setHasUnsavedOrder(false);
      setSuccessMessage('Showcase display ordering saved successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save ordering');
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB B: PRODUCT IMAGES MANAGEMENT
  // --------------------------------------------------------------------------
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productModalSuccess, setProductModalSuccess] = useState<string | null>(null);
  const [productModalError, setProductModalError] = useState<string | null>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const productCategories = Array.from(new Set(products.map(p => p.category)));

  // Update product primary image
  const handleSetPrimaryProductImage = async (product: Product, imgUrl: string) => {
    try {
      const updated = await api.updateProductMedia(product.id, 'set_primary', { imageUrl: imgUrl });
      setSelectedProduct(updated);
      onProductsUpdated?.();
      setProductModalSuccess('Primary product image updated!');
    } catch (err: any) {
      setProductModalError(err.message || 'Failed to set primary image');
    }
  };

  // Remove image from product
  const handleRemoveProductImage = async (product: Product, imgUrl: string) => {
    try {
      const updated = await api.updateProductMedia(product.id, 'remove_image', { imageUrl: imgUrl });
      setSelectedProduct(updated);
      onProductsUpdated?.();
      setProductModalSuccess('Image removed from product.');
    } catch (err: any) {
      setProductModalError(err.message || 'Failed to remove image');
    }
  };

  // Upload new image to product (can add to gallery or set as primary)
  const handleUploadProductImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    product: Product,
    asPrimary: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProductImageUploading(true);
    setProductModalError(null);
    setProductModalSuccess(null);

    try {
      const uploaded = await api.uploadFile(file);
      const action = asPrimary ? 'replace_image' : 'add_gallery';
      const payload = asPrimary
        ? { oldImageUrl: product.image, newImageUrl: uploaded.url }
        : { imageUrls: [uploaded.url] };

      const updated = await api.updateProductMedia(product.id, action, payload);
      setSelectedProduct(updated);
      onProductsUpdated?.();
      setProductModalSuccess(asPrimary ? 'New primary image uploaded!' : 'Image added to gallery!');
    } catch (err: any) {
      setProductModalError(err.message || 'Failed to upload product image');
    } finally {
      setProductImageUploading(false);
      if (productImageInputRef.current) productImageInputRef.current.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // TAB C: SERVICE IMAGES MANAGEMENT
  // --------------------------------------------------------------------------
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const [serviceModalSuccess, setServiceModalSuccess] = useState<string | null>(null);
  const [serviceModalError, setServiceModalError] = useState<string | null>(null);
  const serviceImageInputRef = useRef<HTMLInputElement>(null);

  const filteredServices = services.filter(s => {
    return (
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  });

  const handleUploadServiceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    service: ServiceItem
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setServiceImageUploading(true);
    setServiceModalError(null);
    setServiceModalSuccess(null);

    try {
      const uploaded = await api.uploadFile(file);
      const updated = await api.updateServiceImage(service.id, uploaded.url);
      setSelectedService(updated);
      onServicesUpdated?.();
      setServiceModalSuccess(`Service image updated for "${updated.name}".`);
    } catch (err: any) {
      setServiceModalError(err.message || 'Failed to update service image');
    } finally {
      setServiceImageUploading(false);
      if (serviceImageInputRef.current) serviceImageInputRef.current.value = '';
    }
  };

  const handleRemoveServiceImage = async (service: ServiceItem) => {
    setServiceImageUploading(true);
    try {
      const updated = await api.updateServiceImage(service.id, '');
      setSelectedService(updated);
      onServicesUpdated?.();
      setServiceModalSuccess('Service image reset to default.');
    } catch (err: any) {
      setServiceModalError(err.message || 'Failed to reset service image');
    } finally {
      setServiceImageUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
        className="hidden"
        onChange={handleFilesSelected}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Media & Visual Asset Control
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Media Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Centralized hub for managing the Home Page photo/video continuous showcase, commercial product photography, and service portfolio visuals.
          </p>
        </div>

        {/* Global Action Notifications */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {hasUnsavedOrder && activeTab === 'showcase' && (
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-pulse transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Reordered Display</span>
            </button>
          )}

          {activeTab === 'showcase' && canUpload && (
            <button
              type="button"
              onClick={() => multiFileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photos / Videos</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Toast Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:text-rose-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span className="font-semibold">{uploadProgress}</span>
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('showcase')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'showcase'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>A. Home Showcase</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {showcaseMedia.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'products'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>B. Product Images</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>C. Service Images</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {services.length}
          </span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB A: HOME SHOWCASE MEDIA                                          */}
      {/* =================================================================== */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Showcase Items
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {showcaseMedia.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Active On Public Home
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                {showcaseMedia.filter(m => m.active).length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Print Photos
              </span>
              <div className="text-xl sm:text-2xl font-black text-pink-600 mt-0.5">
                {showcaseMedia.filter(m => m.type === 'image').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Press Video Reels
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-600 mt-0.5">
                {showcaseMedia.filter(m => m.type === 'video').length}
              </div>
            </div>
          </div>

          {/* Upload Dropzone Banner */}
          {canUpload && (
            <div
              onClick={() => multiFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Click or Drop Media Files Here to Upload for Home Showcase
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Supports multiple uploads of real photos and video reels. Formats: <strong>JPG, PNG, WEBP, MP4, WEBM</strong> (up to 100MB per file).
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                <Plus className="w-3.5 h-3.5" /> Select Files from Computer
              </div>
            </div>
          )}

          {/* Media Items List / Grid */}
          {loadingShowcase ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading showcase media assets...
            </div>
          ) : showcaseMedia.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Showcase Media Uploaded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the upload box above to upload 15–20 selected photos and videos of your printing work. Active items will automatically appear on the public Home page in a smooth auto-scrolling carousel.
              </p>
              {canUpload && (
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload First Batch of Media</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Tip: Drag items by the handle or use Up/Down arrows to reorder. Remember to click &quot;Save Ordering&quot;.
                </span>
                <span className="font-medium">Total: {showcaseMedia.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {showcaseMedia.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={canReorder}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={e => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-2xl border ${
                      item.active ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
                    } overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-16/10 bg-slate-900 overflow-hidden group">
                      {item.type === 'video' ? (
                        <div className="w-full h-full relative">
                          <video
                            src={getAssetUrl(item.url)}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Film className="w-3 h-3" /> VIDEO
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          <img
                            src={getAssetUrl(item.url)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-pink-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> PHOTO
                          </span>
                        </div>
                      )}

                      {/* Display Order Badge */}
                      <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                        #{index + 1}
                      </span>

                      {/* Hover Overlay Button to View Full Size */}
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                      >
                        <Eye className="w-4 h-4" /> Preview Full Screen
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {item.title}
                          </h4>
                        </div>
                        {item.caption && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {item.caption}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : ''} · {item.mimeType}
                        </div>
                      </div>

                      {/* Controls Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          disabled={!canEdit}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            item.active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {item.active ? '● Active' : '○ Inactive'}
                        </button>

                        {/* Order & Management Buttons */}
                        <div className="flex items-center gap-1">
                          {canReorder && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                                title="Move Earlier"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'down')}
                                disabled={index === showcaseMedia.length - 1}
                                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                                title="Move Later"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <div
                                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                            </>
                          )}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setReplacingItemId(item.id);
                                replaceFileInputRef.current?.click();
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 transition-colors"
                              title="Replace Media File"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB B: PRODUCT IMAGES MANAGEMENT                                    */}
      {/* =================================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
              >
                <option value="all">All Categories ({products.length})</option>
                {productCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const primaryImg = (product.images && product.images[0]) || product.image || '/images/products/visiting-cards-matte.jpg';
              const galleryImages = (product.images && product.images.length > 0) ? product.images : [primaryImg];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Primary Image Display */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden group">
                    <img
                      src={getAssetUrl(primaryImg)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src = getAssetUrl('/images/products/visiting-cards-matte.jpg');
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {product.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                    >
                      <ImageIcon className="w-4 h-4" /> Manage Product Images
                    </button>
                  </div>

                  {/* Body & Gallery Preview */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Gallery Thumbnails */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                        <span>Gallery ({galleryImages.length})</span>
                        <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => setSelectedProduct(product)}>
                          Edit &rarr;
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {galleryImages.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            className={`w-11 h-11 rounded-lg overflow-hidden border shrink-0 relative ${
                              img === primaryImg ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200'
                            }`}
                          >
                            <img
                              src={getAssetUrl(img)}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            {img === primaryImg && (
                              <div className="absolute top-0 right-0 bg-blue-600 text-white p-0.5 rounded-bl">
                                <Star className="w-2.5 h-2.5 fill-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Manage & Replace Images</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB C: SERVICE IMAGES MANAGEMENT                                    */}
      {/* =================================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                placeholder="Search services by title or category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total Services: {filteredServices.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => {
              const currentImg = service.image || service.imageUrl || '/images/services/visiting-cards.jpg';

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden group">
                    <img
                      src={getAssetUrl(currentImg)}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src = getAssetUrl('/images/services/visiting-cards.jpg');
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {service.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                    >
                      <RefreshCw className="w-4 h-4" /> Replace Service Image
                    </button>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {service.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {service.description || service.shortDesc || ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Upload / Replace Visual</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: PRODUCT IMAGE MANAGER                                        */}
      {/* =================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Product Image Management
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setProductModalError(null);
                  setProductModalSuccess(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productModalSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{productModalSuccess}</span>
              </div>
            )}

            {productModalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{productModalError}</span>
              </div>
            )}

            {/* Current Primary Image */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Primary Featured Image (Displayed on Public Catalog & Detail Page)
              </span>
              <div className="relative aspect-16/9 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 max-h-60">
                <img
                  src={getAssetUrl((selectedProduct.images && selectedProduct.images[0]) || selectedProduct.image || '/images/products/visiting-cards-matte.jpg')}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Gallery Images List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                All Gallery Images ({selectedProduct.images?.length || 1})
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {((selectedProduct.images && selectedProduct.images.length > 0)
                  ? selectedProduct.images
                  : [selectedProduct.image || '/images/products/visiting-cards-matte.jpg']
                ).map((img, idx) => {
                  const isPrimary = idx === 0 || img === selectedProduct.image;
                  return (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-xl overflow-hidden border group ${
                        isPrimary ? 'border-blue-600 ring-2 ring-blue-500/40' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={getAssetUrl(img)}
                        alt="Product visual"
                        className="w-full h-full object-cover"
                      />
                      {isPrimary && (
                        <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          PRIMARY
                        </span>
                      )}

                      {/* Action buttons on hover */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-1">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryProductImage(selectedProduct, img)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded w-full text-center transition-colors"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(selectedProduct, img)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-1 rounded w-full text-center transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="pt-2 border-t flex flex-col sm:flex-row items-center gap-2">
              <input
                ref={productImageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => handleUploadProductImage(e, selectedProduct, false)}
              />
              <button
                type="button"
                disabled={productImageUploading}
                onClick={() => productImageInputRef.current?.click()}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {productImageUploading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Upload New Gallery Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: SERVICE IMAGE MANAGER                                        */}
      {/* =================================================================== */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Service Visual Management
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedService.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setServiceModalError(null);
                  setServiceModalSuccess(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serviceModalSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{serviceModalSuccess}</span>
              </div>
            )}

            {serviceModalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{serviceModalError}</span>
              </div>
            )}

            <div className="relative aspect-16/9 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={getAssetUrl(selectedService.image || selectedService.imageUrl || '/images/services/visiting-cards.jpg')}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
            </div>

            <input
              ref={serviceImageInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={e => handleUploadServiceImage(e, selectedService)}
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={serviceImageUploading}
                onClick={() => serviceImageInputRef.current?.click()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {serviceImageUploading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Upload New Service Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleRemoveServiceImage(selectedService)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DELETE CONFIRMATION                                          */}
      {/* =================================================================== */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Showcase Media?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete &quot;<strong>{deleteConfirmItem.title}</strong>&quot; from the Home showcase carousel? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: FULLSCREEN LIGHTBOX PREVIEW                                  */}
      {/* =================================================================== */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300">
                  {previewItem.type}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-sm">
                  {previewItem.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[70vh]">
              {previewItem.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={getAssetUrl(previewItem.url)}
                    autoPlay
                    controls
                    playsInline
                    loop
                    muted={previewMuted}
                    className="max-h-[68vh] max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewMuted(!previewMuted)}
                    className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg border border-slate-700/80 backdrop-blur-md"
                  >
                    {previewMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              ) : (
                <img
                  src={getAssetUrl(previewItem.url)}
                  alt={previewItem.title}
                  className="max-h-[68vh] max-w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
