import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Loader2, Send, Upload, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeInitialResponses = (form, schoolName) =>
  (form.fields || []).reduce((acc, field) => {
    if (field.id === 'schoolName') {
      acc[field.id] = schoolName || '';
      return acc;
    }

    if (field.type === 'boolean') {
      acc[field.id] = '';
      return acc;
    }

    acc[field.id] = '';
    return acc;
  }, {});

const HMReporting = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [responses, setResponses] = useState({});
  const [filesByField, setFilesByField] = useState({});

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    const formId = searchParams.get('formId');
    if (!formId || forms.length === 0) {
      return;
    }

    const matchedForm = forms.find((form) => form.id === formId);
    if (matchedForm) {
      openForm(matchedForm);
    }
  }, [forms, searchParams]);

  const pendingCount = useMemo(
    () => forms.filter((form) => !form.isSubmitted).length,
    [forms]
  );

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForms(response.data.forms || []);
    } catch (error) {
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (form) => {
    setSubmitModal(form);
    setResponses(normalizeInitialResponses(form, user?.schoolName));
    setFilesByField({});
  };

  const closeModal = () => {
    setSubmitModal(null);
    setResponses({});
    setFilesByField({});
  };

  const handleResponseChange = (fieldId, value) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFilesByField((prev) => ({ ...prev, [fieldId]: selectedFiles }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!submitModal) {
      return;
    }

    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      const attachments = Object.values(filesByField).flat();
      const finalResponses = {
        ...responses,
        schoolName: user?.schoolName || responses.schoolName,
      };

      payload.append('responses', JSON.stringify(finalResponses));
      attachments.forEach((file) => payload.append('attachments', file));

      await axios.post(`${API_URL}/reports/${submitModal.id}/submit`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Form submitted successfully');
      closeModal();
      fetchForms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderField = (field) => {
    const value = responses[field.id] ?? '';

    if (field.id === 'schoolName') {
      return (
        <input
          value={user?.schoolName || value}
          readOnly
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleResponseChange(field.id, e.target.value)}
          required={field.required}
          className="h-28 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      );
    }

    if (field.type === 'boolean') {
      return (
        <select
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => handleResponseChange(field.id, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
          required={field.required}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (field.type === 'file') {
      const selectedFiles = filesByField[field.id] || [];
      return (
        <label className="block rounded-xl border-2 border-dashed border-slate-300 p-5 text-center transition-colors hover:border-navy-500">
          <input
            type="file"
            multiple
            onChange={(e) => handleFileChange(field.id, e)}
            className="hidden"
          />
          <Upload className="mx-auto mb-2 h-7 w-7 text-slate-400" />
          <p className="text-sm text-slate-500">
            {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Upload photos or PDF'}
          </p>
        </label>
      );
    }

    return (
      <input
        type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
        value={value}
        onChange={(e) => handleResponseChange(field.id, field.type === 'number' ? e.target.value : e.target.value)}
        required={field.required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('reports.title')}</h1>
          <p className="mt-1 text-slate-500">Fill the forms shared by Kendrapramukh for cluster reporting.</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</p>
          <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-500" />
          <p className="mt-2 text-slate-500">Loading forms...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-card">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-slate-500">No forms available right now.</p>
            </div>
          ) : (
            forms.map((form) => (
              <div key={form.id} className="rounded-2xl bg-white p-6 shadow-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${form.isSubmitted ? 'bg-green-100' : 'bg-navy-100'}`}>
                      <FileText className={`h-6 w-6 ${form.isSubmitted ? 'text-green-600' : 'text-navy-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{form.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{form.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Due {form.deadline ? new Date(form.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span>{form.fields?.length || 0} fields</span>
                      </div>
                    </div>
                  </div>
                  {form.isSubmitted ? (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => openForm(form)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-500 px-4 py-2 font-medium text-white transition-colors hover:bg-navy-600"
                    >
                      <Send className="h-4 w-4" />
                      {t('reports.fillForm')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="font-bold text-slate-800">{submitModal.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{submitModal.description}</p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {(submitModal.fields || []).map((field) => (
                <div key={field.id}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {field.label} {field.required ? '*' : ''}
                  </label>
                  {renderField(field)}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 rounded-xl bg-navy-500 px-4 py-3 font-medium text-white disabled:opacity-50"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HMReporting;
