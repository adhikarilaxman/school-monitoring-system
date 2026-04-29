import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Download, Eye, FileText, Loader2, Plus, Send, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultFields = [
  { id: 'schoolName', label: 'School Name', type: 'select', required: true },
  { id: 'programImplemented', label: 'Program Implemented?', type: 'boolean', required: true },
  { id: 'implementationDate', label: 'Date', type: 'date', required: true },
  { id: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
  { id: 'photosUploaded', label: 'Photos Uploaded?', type: 'boolean', required: false },
  { id: 'remarks', label: 'Remarks', type: 'textarea', required: false },
];

const emptyField = () => ({
  id: `field_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  label: '',
  type: 'text',
  required: false,
});

const AdminReporting = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedConsolidated, setSelectedConsolidated] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [responsePreview, setResponsePreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    deadline: '',
    fields: defaultFields,
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchFormDetails(selectedFormId);
    }
  }, [selectedFormId]);

  const totals = useMemo(() => {
    return forms.reduce(
      (acc, form) => {
        acc.completed += form.completedResponses || 0;
        acc.pending += form.pendingResponses || 0;
        return acc;
      },
      { completed: 0, pending: 0 }
    );
  }, [forms]);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reports/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedForms = response.data.forms || [];
      setForms(fetchedForms);

      if (fetchedForms.length > 0) {
        setSelectedFormId((current) => current || fetchedForms[0].id);
      } else {
        setSelectedFormId(null);
        setSelectedForm(null);
        setSelectedStatus(null);
        setSelectedConsolidated(null);
      }
    } catch (error) {
      toast.error('Failed to load reporting overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDetails = async (formId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [formResponse, statusResponse, consolidatedResponse] = await Promise.all([
        axios.get(`${API_URL}/reports/${formId}`, { headers }),
        axios.get(`${API_URL}/reports/${formId}/status`, { headers }),
        axios.get(`${API_URL}/reports/${formId}/consolidated`, { headers }),
      ]);

      setSelectedForm(formResponse.data);
      setSelectedStatus(statusResponse.data);
      setSelectedConsolidated(consolidatedResponse.data);
    } catch (error) {
      toast.error('Failed to load form details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleFieldChange = (index, key, value) => {
    setCreateData((prev) => ({
      ...prev,
      fields: prev.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field
      ),
    }));
  };

  const addField = () => {
    setCreateData((prev) => ({ ...prev, fields: [...prev.fields, emptyField()] }));
  };

  const removeField = (index) => {
    setCreateData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  };

  const resetCreateForm = () => {
    setCreateData({
      title: '',
      description: '',
      deadline: '',
      fields: defaultFields,
    });
  };

  const handleCreateForm = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      const cleanedFields = createData.fields
        .map((field) => ({
          ...field,
          label: field.label.trim(),
          id: field.id.trim(),
        }))
        .filter((field) => field.label && field.id);

      await axios.post(
        `${API_URL}/reports`,
        {
          title: createData.title,
          description: createData.description,
          deadline: createData.deadline || null,
          fields: cleanedFields,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Form created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      fetchOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create form');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteForm = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reports/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Form deleted');
      fetchOverview();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleDownloadExcel = async (formId, title) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reports/${formId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel downloaded');
    } catch (error) {
      toast.error('Failed to download Excel');
    }
  };

  const handleOpenResponse = (schoolId) => {
    const schoolEntry = selectedConsolidated?.schools?.find((school) => school.id === schoolId);
    if (!schoolEntry?.response) {
      toast.error('Response not available');
      return;
    }
    setResponsePreview(schoolEntry);
  };

  const handleSendReminder = async (schoolId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/reports/${selectedForm.id}/remind/${schoolId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('reports.title')}</h1>
          <p className="mt-1 max-w-2xl text-slate-500">
            Collect implementation data from all 12 headmasters and export it as one report for higher authority.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-500 px-4 py-3 font-medium text-white transition-colors hover:bg-navy-600"
        >
          <Plus className="h-4 w-4" />
          {t('reports.createForm')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-indigo-100 p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-700">Active Forms</p>
          <p className="mt-2 text-4xl font-bold text-indigo-800">{forms.length}</p>
        </div>
        <div className="rounded-2xl bg-green-100 p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-green-700">Submitted</p>
          <p className="mt-2 text-4xl font-bold text-green-800">{totals.completed}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Pending</p>
          <p className="mt-2 text-4xl font-bold text-amber-800">{totals.pending}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Forms</h2>
            <span className="text-sm text-slate-500">{forms.length} total</span>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-500" />
            </div>
          ) : forms.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
              <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              No reporting forms yet.
            </div>
          ) : (
            <div className="space-y-3">
              {forms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setSelectedFormId(form.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    selectedFormId === form.id
                      ? 'border-navy-500 bg-navy-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{form.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {form.deadline ? new Date(form.deadline).toLocaleDateString() : 'No deadline'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy-700">
                      {form.completionRate}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-navy-500" style={{ width: `${form.completionRate}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{form.completedResponses} submitted</span>
                    <span>{form.pendingResponses} pending</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          {detailsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-500" />
              <p className="mt-2 text-slate-500">Loading form details...</p>
            </div>
          ) : !selectedForm || !selectedStatus || !selectedConsolidated ? (
            <div className="p-12 text-center text-slate-500">Select a form to view reporting status.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedForm.title}</h2>
                  <p className="mt-1 text-slate-500">{selectedForm.description}</p>
                  <p className="mt-3 text-sm text-slate-500">
                    {selectedConsolidated.completedResponses} of {selectedConsolidated.totalSchools} schools submitted
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDownloadExcel(selectedForm.id, selectedForm.title)}
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-500 px-4 py-2 font-medium text-white hover:bg-navy-600"
                  >
                    <Download className="h-4 w-4" />
                    {t('reports.downloadExcel')}
                  </button>
                  <button
                    onClick={() => handleDeleteForm(selectedForm.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Completion</p>
                  <p className="mt-1 text-3xl font-bold text-slate-800">{selectedConsolidated.completionRate}%</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-sm text-green-700">Completed</p>
                  <p className="mt-1 text-3xl font-bold text-green-800">{selectedStatus.stats.completed}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">Pending</p>
                  <p className="mt-1 text-3xl font-bold text-amber-800">{selectedStatus.stats.pending}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800">Submission Status</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">School</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Submitted At</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStatus.schools.map((school) => (
                        <tr key={school.schoolId}>
                          <td className="px-4 py-3 font-medium text-slate-800">{school.schoolName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                school.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {school.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                              {school.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {school.submittedAt ? new Date(school.submittedAt).toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {school.status === 'completed' ? (
                              <button
                                onClick={() => handleOpenResponse(school.schoolId)}
                                className="inline-flex items-center gap-2 text-navy-600"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendReminder(school.schoolId)}
                                className="inline-flex items-center gap-2 text-amber-700"
                              >
                                <Send className="h-4 w-4" />
                                Remind
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-navy-500 p-6 text-white">
                <h3 className="text-lg font-bold">Ready for Higher Authority</h3>
                <p className="mt-1 text-navy-200">
                  Use the Excel export once all headmasters submit. This gives Kendrapramukh a clean report for BEO or Education Officer review.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Create Reporting Form</h3>
                <p className="mt-1 text-sm text-slate-500">Build a form that every headmaster can fill like a simple Google Form.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateForm} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Form Title</label>
                  <input
                    value={createData.title}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={createData.description}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, description: e.target.value }))}
                    className="h-24 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Deadline</label>
                  <input
                    type="date"
                    value={createData.deadline}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">Fields</h4>
                  <button
                    type="button"
                    onClick={addField}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Add Field
                  </button>
                </div>
                {createData.fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.3fr,0.8fr,0.5fr,auto]">
                    <input
                      value={field.label}
                      onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                      placeholder="Field label"
                      className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Yes / No</option>
                      <option value="textarea">Long Text</option>
                      <option value="file">File Upload</option>
                      <option value="select">Select</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-navy-500 px-4 py-3 font-medium text-white disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {responsePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{responsePreview.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{responsePreview.headmaster}</p>
              </div>
              <button onClick={() => setResponsePreview(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {Object.entries(responsePreview.response).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</p>
                  <p className="mt-1 break-words text-slate-800">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReporting;
