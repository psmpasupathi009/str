"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  maxImages?: number;
  onChange: (images: string[]) => void;
  folder?: string;
  userEmail?: string;
}

export default function ImageUpload({
  images,
  maxImages = 5,
  onChange,
  folder = "products",
  userEmail,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).slice(0, remainingSlots).map(async (file, index) => {
        setUploadingIndex(images.length + index);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            "x-user-email": userEmail || "",
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      setUploadingIndex(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleReplaceImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        headers: {
          "x-user-email": userEmail || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      const newImages = [...images];
      newImages[index] = data.url;
      onChange(newImages);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-600 font-light mb-2">
        Product Images ({images.length}/{maxImages})
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Existing Images */}
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <div className="relative aspect-square border border-green-200 rounded overflow-hidden bg-slate-100">
              {uploadingIndex === index ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-slate-200';
                        placeholder.innerHTML = '<span class="text-slate-400 text-xs">Image Error</span>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer p-2 bg-white rounded hover:bg-slate-100">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleReplaceImage(index, e)}
                        disabled={uploading}
                      />
                      <ImageIcon className="w-4 h-4 text-slate-700" />
                    </label>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
            {index === 0 && (
              <span className="absolute -top-2 -left-2 px-2 py-0.5 text-xs bg-green-600 text-white rounded">
                Main
              </span>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && (
          <label className="relative aspect-square border-2 border-dashed border-green-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
            {uploading && uploadingIndex === null ? (
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-xs text-slate-600 font-light text-center px-2">
                  Add Image{maxImages - images.length > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-slate-400 font-light mt-1">
                  {maxImages - images.length} left
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={maxImages - images.length > 1}
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-xs text-slate-500 font-light">
          First image will be used as the main product image. Click on an image to replace it.
        </p>
      )}
    </div>
  );
}
