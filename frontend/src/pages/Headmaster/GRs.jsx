import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, CheckCircle2, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const HMGRs = () => {
  const { t } = useTranslation();
  const [grs, setGrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingSeen, setMarkingSeen] = useState({});

  // Fetch GRs on mount
  useEffect(() => {
    fetchGRs();
  }, []);

  const fetchGRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/grs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrs(response.data.grs || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch GRs');
      setLoading(false);
    }
  };

  const handleMarkAsSeen = async (grId) => {
    setMarkingSeen(prev => ({ ...prev, [grId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/grs/${grId}/seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setGrs(prev => prev.map(gr => 
        gr.id === grId 
          ? { ...gr, myStatus: { seen: true, seenAt: new Date().toISOString() } }
          : gr
      ));
      
      toast.success('Marked as seen');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as seen');
    } finally {
      setMarkingSeen(prev => ({ ...prev, [grId]: false }));
    }
  };

  const handleDownload = (gr) => {
    if (gr.fileUrl) {
      window.open(`${API_URL.replace('/api', '')}${gr.fileUrl}`, '_blank');
    } else {
      toast.info('No file available for download');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('gr.grTitle')}</h1>
        <p className="text-slate-500 mt-1">View and download Government Resolutions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
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
            grs.map((gr) => {
              const isSeen = gr.myStatus?.seen;
              return (
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
                          {!isSeen && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isSeen && (
                        <button 
                          onClick={() => handleMarkAsSeen(gr.id)}
                          disabled={markingSeen[gr.id]}
                          className="px-4 py-2 bg-navy-500 text-white text-sm font-medium rounded-lg hover:bg-navy-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {markingSeen[gr.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {t('gr.markAsSeen')}
                        </button>
                      )}
                      {isSeen && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Seen
                        </span>
                      )}
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HMGRs;
