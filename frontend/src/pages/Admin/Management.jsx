import { useState, useEffect } from 'react';
import {
  Users,
  School,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Shield,
  GraduationCap,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'user' or 'school'
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'headmaster',
    designation: '',
    zone: '',
    schoolId: ''
  });

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    udise: '',
    address: '',
    contact: '',
    email: '',
    headmasterName: '',
    headmasterContact: '',
    established: '',
    type: 'Primary',
    facilities: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'users') {
        const response = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(response.data.users || []);
      } else {
        const response = await axios.get(`${API_URL}/admin/schools`, { headers });
        setSchools(response.data.schools || []);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'user') {
      setUserForm(item ? {
        name: item.name || '',
        email: item.email || '',
        password: '',
        role: item.role || 'headmaster',
        designation: item.designation || '',
        zone: item.zone || '',
        schoolId: item.schoolId || ''
      } : {
        name: '', email: '', password: '', role: 'headmaster', designation: '', zone: '', schoolId: ''
      });
    } else {
      setSchoolForm(item ? {
        name: item.name || '',
        udise: item.udise || '',
        address: item.address || '',
        contact: item.contact || '',
        email: item.email || '',
        headmasterName: item.headmasterName || '',
        headmasterContact: item.headmasterContact || '',
        established: item.established || '',
        type: item.type || 'Primary',
        facilities: (item.facilities || []).join(', ')
      } : {
        name: '', udise: '', address: '', contact: '', email: '',
        headmasterName: '', headmasterContact: '', established: '',
        type: 'Primary', facilities: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSubmitting(false);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || (!editingItem && !userForm.password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingItem) {
        await axios.put(`${API_URL}/admin/users/${editingItem.id}`, userForm, { headers });
        toast.success('User updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/users`, userForm, { headers });
        toast.success('User created successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSchool = async (e) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.udise) {
      toast.error('School name and UDISE code are required');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...schoolForm,
        facilities: schoolForm.facilities.split(',').map(f => f.trim()).filter(f => f),
        established: parseInt(schoolForm.established) || new Date().getFullYear()
      };

      if (editingItem) {
        await axios.put(`${API_URL}/admin/schools/${editingItem.id}`, payload, { headers });
        toast.success('School updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/schools`, payload, { headers });
        toast.success('School created successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/admin/${type}/${id}`, { headers });
      toast.success(`${type === 'users' ? 'User' : 'School'} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSchools = schools.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.udise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
          <p className="text-slate-500 mt-1">Manage users, schools, and system access</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'schools', label: 'Schools', icon: School }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-navy-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <button
          onClick={() => openModal(activeTab === 'users' ? 'user' : 'school')}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'users' ? 'User' : 'School'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-500" />
          <p className="mt-2 text-slate-500">Loading...</p>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">School</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                          <span className="text-navy-600 font-bold text-sm">{user.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'kendrapramukh'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'kendrapramukh' ? <Shield className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        {user.role === 'kendrapramukh' ? 'Admin' : 'Headmaster'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.designation || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.schoolName || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('user', user)}
                          className="p-2 text-slate-400 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('users', user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">School</th>
                  <th className="px-6 py-4">UDISE</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Headmaster</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map(school => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{school.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {school.address || 'No address'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{school.udise}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                        {school.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{school.headmasterName || 'Not assigned'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('school', school)}
                          className="p-2 text-slate-400 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('schools', school.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSchools.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No schools found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-slate-800">
                {editingItem ? `Edit ${modalType === 'user' ? 'User' : 'School'}` : `Add New ${modalType === 'user' ? 'User' : 'School'}`}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'user' ? (
              <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password {editingItem ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    {...(!editingItem && { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="headmaster">Headmaster</option>
                    <option value="kendrapramukh">Admin (Kendrapramukh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={userForm.designation}
                    onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Zone</label>
                  <input
                    type="text"
                    value={userForm.zone}
                    onChange={(e) => setUserForm({ ...userForm, zone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">School</label>
                  <select
                    value={userForm.schoolId}
                    onChange={(e) => setUserForm({ ...userForm, schoolId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">None</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {editingItem ? 'Update' : 'Create'} User
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitSchool} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">School Name *</label>
                  <input
                    type="text"
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">UDISE Code *</label>
                  <input
                    type="text"
                    value={schoolForm.udise}
                    onChange={(e) => setSchoolForm({ ...schoolForm, udise: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact</label>
                    <input
                      type="text"
                      value={schoolForm.contact}
                      onChange={(e) => setSchoolForm({ ...schoolForm, contact: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={schoolForm.email}
                      onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Headmaster Name</label>
                    <input
                      type="text"
                      value={schoolForm.headmasterName}
                      onChange={(e) => setSchoolForm({ ...schoolForm, headmasterName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Headmaster Contact</label>
                    <input
                      type="text"
                      value={schoolForm.headmasterContact}
                      onChange={(e) => setSchoolForm({ ...schoolForm, headmasterContact: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Established Year</label>
                    <input
                      type="number"
                      value={schoolForm.established}
                      onChange={(e) => setSchoolForm({ ...schoolForm, established: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select
                      value={schoolForm.type}
                      onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Higher Secondary">Higher Secondary</option>
                      <option value="International">International</option>
                      <option value="Technical">Technical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Facilities (comma-separated)</label>
                  <input
                    type="text"
                    value={schoolForm.facilities}
                    onChange={(e) => setSchoolForm({ ...schoolForm, facilities: e.target.value })}
                    placeholder="Library, Computer Lab, Playground"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {editingItem ? 'Update' : 'Create'} School
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
