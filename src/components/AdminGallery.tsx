import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Trash2, Loader2, Image as ImageIcon, Edit2, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryItem {
  id: string | number;
  title: string;
  image: string;
  year: string;
}

interface AdminGalleryProps {
  onUpdate?: () => void;
}

export const AdminGallery = ({ onUpdate }: AdminGalleryProps) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear() + '년');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Get unique titles for suggestions
  const uniqueTitles = Array.from(new Set(items.map(item => item.title))).filter(Boolean).sort();

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setItems(data);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to fetch gallery', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const oversizedFiles = files.filter(file => file.size > 500 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`일부 파일이 너무 큽니다 (최대 500MB). 제외하고 선택합니다: ${oversizedFiles.map(f => f.name).join(', ')}`);
    }
    
    const validFiles = files.filter(file => file.size <= 500 * 1024 * 1024);
    if (validFiles.length === 0) return;
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });
    formData.append('title', newTitle);
    formData.append('year', newYear);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchGallery();
        setShowUpload(false);
        setNewTitle('');
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        const errorData = await res.json();
        alert(`업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('업로드 중 네트워크 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch('/api/gallery/' + id, { method: 'DELETE' });
      if (res.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        setDeletingId(null);
        if (onUpdate) onUpdate();
      } else {
        const errorData = await res.json();
        alert(`삭제 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('삭제 중 네트워크 오류가 발생했습니다.');
    }
  };

  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const startEditing = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditYear(item.year);
  };

  const handleUpdate = async (id: string | number) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, year: editYear }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchGallery();
      } else {
        const errorData = await res.json();
        alert(`수정 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Update failed', err);
      alert('수정 중 네트워크 오류가 발생했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="text-indigo-600 w-6 h-6" /> 갤러리 관리 시스템
          </h3>
          <p className="text-slate-500">사진을 추가하거나 기존 사진의 정보를 수정할 수 있습니다.</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          {showUpload ? <X size={20} /> : <Plus size={20} />}
          {showUpload ? '닫기' : '새 사진 추가'}
        </button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <form onSubmit={handleUpload} className="bg-slate-50 p-8 rounded-2xl border border-indigo-100 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">사진 제목 (기존 제목 선택 또는 직접 입력)</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="예: 2026년 코딩 캠프 현장"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      list="existing-titles"
                      required
                    />
                    <datalist id="existing-titles">
                      {uniqueTitles.map((title, idx) => (
                        <option key={idx} value={title} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">연도</label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {['2026년', '2025년', '2024년', '2023년', '2022년 이전'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">사진 또는 동영상 파일 (여러 장 선택 가능)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                  </div>
                </div>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 min-h-[250px] transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                      : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  {previewUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full max-h-48 overflow-y-auto p-2" onClick={(e) => e.stopPropagation()}>
                      {previewUrls.map((url, idx) => {
                        const isVideo = selectedFiles[idx]?.type.startsWith('video/');
                        return (
                          <div key={idx} className="relative group/preview w-full aspect-square rounded-lg shadow-sm overflow-hidden bg-slate-100">
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <video src={url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <div className="text-white text-[10px] font-bold bg-indigo-600 px-2 py-1 rounded">VIDEO</div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full">
                                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-end justify-start p-1 bg-black/10">
                                  <div className="text-white text-[8px] font-bold bg-slate-600/80 px-1 rounded">IMG</div>
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Upload size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold text-slate-600">파일을 이 곳에 드래그하거나 클릭하세요</p>
                      <p className="text-xs mt-1">이미지 및 동영상 업로드 가능</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-200 pt-6">
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                  {uploading ? '업로드 중...' : `${selectedFiles.length}개의 파일 등록하기`}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              {isVideo(item.image) ? (
                <video src={item.image} className="w-full h-full object-cover" />
              ) : (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                {deletingId === item.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-3 py-1 bg-slate-600 text-white text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="제목 수정"
                  />
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {['2026년', '2025년', '2024년', '2023년', '2022년 이전'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      disabled={updatingId === item.id}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {updatingId === item.id ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.year}</span>
                    <button
                      onClick={() => startEditing(item)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="수정"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2 flex-1">{item.title}</h4>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && !loading && (
        <div className="py-20 text-center text-slate-400">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
          <p>등록된 사진이 없습니다.</p>
        </div>
      )}
    </div>
  );
};
