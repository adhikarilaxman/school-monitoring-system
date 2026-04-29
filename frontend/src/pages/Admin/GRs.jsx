import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, Download, CheckCircle2, X, File, Eye, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminGRs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(location.state?.openUploadModal || false);
  const [grs, setGrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    circularNumber: '',
    description: ''
  });

  // Fetch GRs on mount
  useEffect(() => {
    fetchGRs();
  }, [searchQuery, statusFilter]);

  const fetchGRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`${API_URL}/grs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrs(response.data.grs || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch GRs');
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.circularNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploadLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('circularNumber', uploadForm.circularNumber);
      formData.append('description', uploadForm.description);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await axios.post(`${API_URL}/grs`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('GR uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ title: '', circularNumber: '', description: '' });
      setSelectedFile(null);
      fetchGRs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload GR');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = (gr) => {
    if (gr.fileUrl) {
      window.open(`${API_URL.replace('/api', '')}${gr.fileUrl}`, '_blank');
    } else {
      toast.info('No file available for download');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('gr.grTitle')}</h1>
          <p className="text-slate-500 mt-1">Manage and track Government Resolutions</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          {t('gr.uploadNew')}
        </button>
      </div>

      {/* GR List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search GRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-500" />
              <p className="mt-2 text-slate-500">Loading GRs...</p>
            </div>
          ) : grs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No GRs found</p>
            </div>
          ) : (
            grs.map((gr) => (
              <div key={gr.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{gr.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {t('gr.circularNumber')}: {gr.circularNumber}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{t('gr.uploadedOn')}: {new Date(gr.uploadedAt).toLocaleDateString()}</span>
                        {gr.fileUrl && <span className="text-green-600">● File attached</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${gr.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
                        <span className="font-medium capitalize">{gr.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {Object.values(gr.viewStatus || {}).filter(v => v.seen).length} / {Object.keys(gr.viewStatus || {}).length} seen
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        if (gr.fileUrl) {
                          window.open(`${API_URL.replace('/api', '')}${gr.fileUrl}`, '_blank');
                        } else {
                          toast.info('No file available to view');
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-navy-500 transition-colors"
                      title="View GR"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDownload(gr)}
                      className="p-2 text-slate-400 hover:text-navy-500 transition-colors"
                      title="Download GR"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{t('gr.uploadNew')}</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('gr.title')}</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Enter GR title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('gr.circularNumber')}</label>
                <input
                  type="text"
                  value={uploadForm.circularNumber}
                  onChange={(e) => setUploadForm({...uploadForm, circularNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g., GR-2024-005"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('gr.description')}</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 h-24 resize-none"
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('gr.uploadFile')}</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-navy-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <File className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {selectedFile ? selectedFile.name : t('gr.dragDrop') || 'Click or drag to upload file (PDF, DOC, DOCX, XLS, XLSX)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Max file size: 10MB</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadLoading}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('common.upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGRs;
