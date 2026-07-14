import React, { useState, useEffect } from "react";
import { Media } from "../types.js";
import { X, Search, Upload, Folder, Tag, AlertCircle, Check, FileDown } from "lucide-react";

interface MediaModalProps {
  onClose: () => void;
  onSelect: (url: string, filename?: string, size?: string) => void;
}

export function MediaModal({ onClose, onSelect }: MediaModalProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      let query = "";
      const params = [];
      if (folderFilter) params.push(`folder=${encodeURIComponent(folderFilter)}`);
      if (tagFilter) params.push(`tag=${encodeURIComponent(tagFilter)}`);
      if (params.length > 0) query = `?${params.join("&")}`;

      const res = await fetch(`/api/media${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to load media files");
      }

      const data = await res.json();
      setMediaList(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [folderFilter, tagFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadFolder);
      formData.append("tags", uploadTags);
      formData.append("altText", uploadAlt);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      // Refresh list
      await fetchMedia();
      
      // Reset upload inputs
      setUploadAlt("");
      setUploadTags("");
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  // Filter media locally based on search term
  const filteredMedia = mediaList.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.altText && item.altText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-150">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Media Library</h3>
            <p className="text-xs text-neutral-500">Upload or select visual assets & downloadable files</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4">
          
          {/* Left Sidebar: Upload & Quick Filters */}
          <div className="p-5 border-r border-neutral-150 bg-neutral-50 space-y-5 overflow-y-auto">
            
            {/* Upload Area */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Upload File</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  placeholder="Folder (e.g. general)"
                  className="w-full text-xs bg-white border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="w-full text-xs bg-white border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Alt Description"
                  className="w-full text-xs bg-white border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-brand"
                />
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-4 bg-white cursor-pointer hover:border-brand transition-colors text-center">
                <Upload className="w-5 h-5 text-neutral-400 mb-1.5" />
                <span className="text-xs font-semibold text-neutral-800">
                  {uploading ? "Uploading..." : "Select & Upload"}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">WebP, PNG, Zip</span>
                <input
                  type="file"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Filters</span>
              
              <div className="space-y-1.5">
                <button
                  onClick={() => setFolderFilter("")}
                  className={`w-full text-left text-xs font-medium px-2 py-1.5 rounded-lg flex items-center transition-colors ${!folderFilter ? "bg-brand text-white" : "text-neutral-600 hover:bg-neutral-200"}`}
                >
                  <Folder className="w-3.5 h-3.5 mr-1.5" /> All Folders
                </button>
                <button
                  onClick={() => setFolderFilter("general")}
                  className={`w-full text-left text-xs font-medium px-2 py-1.5 rounded-lg flex items-center transition-colors ${folderFilter === "general" ? "bg-brand text-white" : "text-neutral-600 hover:bg-neutral-200"}`}
                >
                  <Folder className="w-3.5 h-3.5 mr-1.5" /> General
                </button>
                <button
                  onClick={() => setFolderFilter("downloads")}
                  className={`w-full text-left text-xs font-medium px-2 py-1.5 rounded-lg flex items-center transition-colors ${folderFilter === "downloads" ? "bg-brand text-white" : "text-neutral-600 hover:bg-neutral-200"}`}
                >
                  <Folder className="w-3.5 h-3.5 mr-1.5" /> Downloads
                </button>
              </div>
            </div>

          </div>

          {/* Right Main Panel: Media Grid */}
          <div className="col-span-3 p-5 flex flex-col min-h-0">
            
            {/* Search Bar */}
            <div className="relative mb-4.5">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search media library..."
                className="w-full bg-neutral-100 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-150 rounded-lg flex items-center text-xs text-red-700">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}

            {/* Media Items List/Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                  <div className="animate-pulse">Loading media assets...</div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
                  <Folder className="w-12 h-12 text-neutral-200 mb-2" />
                  <p className="text-sm font-medium">No media found</p>
                  <p className="text-xs text-neutral-400 mt-1">Upload files on the left to populate your library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {filteredMedia.map((media) => {
                    const isImg = media.url.toLowerCase().match(/\.(webp|png|jpe?g|gif|svg)$/) || media.filename.endsWith(".webp");
                    
                    return (
                      <div
                        key={media.id}
                        onClick={() => onSelect(media.url, media.filename, "1.2 MB")}
                        className="group relative cursor-pointer border border-neutral-200 hover:border-brand bg-neutral-50 rounded-xl overflow-hidden aspect-video flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                      >
                        {/* Preview */}
                        <div className="flex-1 bg-neutral-200 overflow-hidden flex items-center justify-center">
                          {isImg ? (
                            <img
                              src={media.url}
                              alt={media.altText || ""}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-neutral-500 font-mono">
                              <FileDown className="w-8 h-8 text-neutral-400 mb-1" />
                              <span className="text-[10px] font-semibold">ZIP/FILE</span>
                            </div>
                          )}
                        </div>

                        {/* Title Overlay */}
                        <div className="p-2 bg-white border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-neutral-800 truncate pr-1">
                            {media.filename}
                          </span>
                          <span className="text-[8px] font-mono text-neutral-400 shrink-0 capitalize">
                            {media.folder || "general"}
                          </span>
                        </div>

                        {/* Direct Indicator */}
                        <div className="absolute top-2 right-2 bg-brand text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
