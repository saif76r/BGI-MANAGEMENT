import React, { useState } from 'react';
import { HardDrive, Search, FileText, Download, Plus, Trash2, ArrowUpRight, Folder, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { ResourceFile, User, UserRole } from '../types';
import { motion } from 'motion/react';

interface ResourceViewProps {
  resources: ResourceFile[];
  currentUser: User;
  onAddResource: (file: ResourceFile) => void;
  onDeleteResource: (id: string) => void;
}

export default function ResourceView({
  resources,
  currentUser,
  onAddResource,
  onDeleteResource
}: ResourceViewProps) {
  // Query state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | 'Guidelines' | 'Templates' | 'Minutes' | 'Finance' | 'Others'>('All');

  // Interactive upload loading simulations
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  // Drag over states
  const [dragOver, setDragOver] = useState(false);

  // New File state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileCat, setFileCat] = useState<'Guidelines' | 'Templates' | 'Minutes' | 'Finance' | 'Others'>('Guidelines');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [fileType, setFileType] = useState<'PDF' | 'DOC' | 'XLS' | 'PPT' | 'Image'>('PDF');
  const [minRole, setMinRole] = useState<UserRole>('Member');

  const isManager = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

  const triggerMockUpload = (uploadedName: string) => {
    if (!uploadedName) return;
    setIsUploading(true);
    setUploadPercent(10);

    const intv = setInterval(() => {
      setUploadPercent(prev => {
        if (prev >= 100) {
          clearInterval(intv);
          
          // Complete upload append
          const mockFile: ResourceFile = {
            id: `file-${Math.floor(100 + Math.random() * 900)}`,
            name: uploadedName.endsWith('.pdf') || uploadedName.endsWith('.doc') ? uploadedName : uploadedName + '.pdf',
            type: fileType,
            size: fileSize,
            category: fileCat,
            uploadedBy: currentUser.name,
            uploadedDate: new Date().toISOString().split('T')[0],
            downloadCount: 0,
            minRoleAccess: minRole
          };

          onAddResource(mockFile);
          setIsUploading(false);
          setShowAddModal(false);
          setFileName('');
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
    triggerMockUpload(fileName);
  };

  // Drag and drop events logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    // Extract dropped file metadata mock
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFileName(dropped.name);
      
      const sizeMB = (dropped.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      
      const ext = dropped.name.split('.').pop()?.toUpperCase();
      if (ext === 'PDF') setFileType('PDF');
      else if (ext === 'DOC' || ext === 'DOCX') setFileType('DOC');
      else if (ext === 'XLS' || ext === 'XLSX') setFileType('XLS');
      else if (ext === 'PPT' || ext === 'PPTX') setFileType('PPT');
      else setFileType('Image');

      triggerMockUpload(dropped.name);
    }
  };

  // Check role eligibility filter
  const isEligible = (fileMinRole: UserRole) => {
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Moderator') {
      return fileMinRole !== 'Admin';
    }
    return fileMinRole === 'Member';
  };

  const filteredResources = resources.filter(res => {
    const matchesQuery = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'All' || res.category === selectedCat;
    const isVisible = isEligible(res.minRoleAccess);
    
    return matchesQuery && matchesCat && isVisible;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">BGI Secure Shared Drive</h2>
          <p className="text-xs text-slate-400">Access official constitution guidelines, PPT slide decks, corporate letters, and meeting minutes.</p>
        </div>

        {isManager && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Permissions feedback banner */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          {isManager
            ? "Elevated Administrative Privileges detected. You can upload files, restrict folder permissions, and clean files."
            : "Read-Only Member access granted. You are eligible to search and stream documentation folders."}
        </span>
      </div>

      {/* Grid view of Category Directories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['All', 'Guidelines', 'Templates', 'Minutes', 'Finance', 'Others'] as const).map(cat => {
          const isSelected = selectedCat === cat;
          const folderSize = resources.filter(r => (cat === 'All' || r.category === cat) && isEligible(r.minRoleAccess)).length;

          return (
            <div
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[100px] hover:scale-[1.02] ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-550 border-cyan-500/30 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-start">
                {isSelected ? <FolderOpen className="w-6 h-6 text-cyan-400" /> : <Folder className="w-6 h-6 text-slate-500" />}
                <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-1.5 bg-slate-950 border border-slate-850 rounded">
                  {folderSize} files
                </span>
              </div>
              <span className="text-xs font-bold font-display tracking-tight text-slate-200 mt-2">{cat}</span>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames, category extensions..."
            className="w-full bg-slate-950 border border-slate-805 rounded-lg py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-505 text-xs font-mono"
          />
        </div>
        <p className="text-[10px] font-mono text-slate-500 shrink-0">
          Showing {filteredResources.length} matches of your eligible resources.
        </p>
      </div>

      {/* Main Files Directory listing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-850">
        {filteredResources.length > 0 ? (
          filteredResources.map(file => (
            <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-950/40 gap-4 transition-colors">
              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-center text-cyan-400 shrink-0 font-mono font-bold text-xs select-none">
                  {file.type}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-200 truncate max-w-sm">{file.name}</h4>
                  <div className="flex flex-wrap gap-2.5 text-[10px] font-mono text-slate-500">
                    <span className="text-cyan-400 uppercase">{file.category}</span>
                    <span>•</span>
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>Uploaded {file.uploadedDate}</span>
                    <span>•</span>
                    <span>Req: <span className="text-amber-500">{file.minRoleAccess}</span></span>
                  </div>
                </div>
              </div>

              {/* Action operations */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => alert(`Simulated downloading ${file.name} (${file.size}) perfectly. Check local assets folder.`)}
                  className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-mono flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download
                </button>

                {isManager && (
                  <button
                    onClick={() => { if(confirm(`Confirm deleting file from Shared drive: ${file.name}?`)) onDeleteResource(file.id); }}
                    className="p-2 text-slate-500 hover:text-red-400 rounded hover:bg-red-950/30 transition-colors"
                    title="Delete files"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 italic">
            There are no documents matching your search filter logs.
          </div>
        )}
      </div>

      {/* DRAG-AND-DROP SIMULATOR COMPONENT FOR QUICK LOADS */}
      {isManager && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver ? 'border-emerald-400 bg-emerald-950/15' : 'border-slate-800 hover:border-slate-705'
          }`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-white font-mono">Uploading vector document templates to Cloud Hub... {uploadPercent}%</p>
              <div className="w-[180px] bg-slate-950 h-1.5 rounded-full mx-auto overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full" style={{ width: `${uploadPercent}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-xs font-display font-medium text-slate-300">Drag & Drop Local PDF/DOC files here</h4>
              <p className="text-[10px] text-slate-500">
                You can drag physical document attachments directly into this board for rapid directory simulation appendings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD FORM DIALOG */}
      {showAddModal && isManager && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-white font-display font-medium text-lg">Define Document Asset</h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Name (with format prefix)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. BGI_Community_Bylaws.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-505 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Drive Category</label>
                  <select
                    value={fileCat}
                    onChange={(e) => setFileCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-505"
                  >
                    <option value="Guidelines">Guidelines</option>
                    <option value="Templates">Templates</option>
                    <option value="Minutes">Minutes</option>
                    <option value="Finance">Finance</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Doc Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOC">DOCX</option>
                    <option value="XLS">XLSX</option>
                    <option value="PPT">PPTX</option>
                    <option value="Image">IMG Graphic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">File Byte Weight</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. 2.4 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-lg p-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Min Safe Authority Access</label>
                  <select
                    value={minRole}
                    onChange={(e) => setMinRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  >
                    <option value="Member">Members (Public)</option>
                    <option value="Moderator">Moderators Only</option>
                    <option value="Admin">Admins Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Upload Sequence'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-850 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
