const dataStore = require('../models/dataStore');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const parseFields = (fields) => {
  if (Array.isArray(fields)) {
    return fields;
  }

  if (typeof fields === 'string') {
    const parsed = JSON.parse(fields);
    return Array.isArray(parsed) ? parsed : [];
  }

  return [];
};

const parseResponses = (responses) => {
  if (!responses) {
    return {};
  }

  if (typeof responses === 'string') {
    const parsed = JSON.parse(responses);
    return parsed && typeof parsed === 'object' ? parsed : {};
  }

  return typeof responses === 'object' ? responses : {};
};

// Get all report forms
const getAllForms = (req, res) => {
  try {
    const { status } = req.query;
    let forms = [...dataStore.reportForms];

    // Filter by status
    if (status) {
      forms = forms.filter(f => f.status === status);
    }

    // For headmasters - add submission status
    if (req.user.role === 'headmaster') {
      forms = forms.map(form => ({
        ...form,
        myResponse: form.responses?.[req.user.schoolId] || null,
        isSubmitted: !!form.responses?.[req.user.schoolId],
        status: form.responses?.[req.user.schoolId]?.status || 'pending'
      }));
    }

    // Sort by creation date (newest first)
    forms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ forms, count: forms.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch forms', error: error.message });
  }
};

// Get single form by ID
const getFormById = (req, res) => {
  try {
    const { id } = req.params;
    const form = dataStore.getFormById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    let response = { ...form };

    // For headmasters, include their response
    if (req.user.role === 'headmaster') {
      response.myResponse = form.responses?.[req.user.schoolId] || null;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch form', error: error.message });
  }
};

// Create new report form (Admin only)
const createForm = (req, res) => {
  try {
    const { title, description, deadline, fields } = req.body;
    const parsedFields = parseFields(fields);
    
    if (!title || parsedFields.length === 0) {
      return res.status(400).json({ message: 'Title and at least one field are required' });
    }

    const newForm = {
      id: `form_${uuidv4().split('-')[0]}`,
      title,
      description: description || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      deadline: deadline || null,
      status: 'active',
      fields: parsedFields,
      responses: {}
    };

    dataStore.reportForms.push(newForm);

    // Create notifications for all headmasters
    dataStore.schools.forEach(school => {
      dataStore.addNotification({
        userId: school.headmasterId,
        type: 'form',
        title: 'New Report Form Available',
        message: `${title} - Please submit before deadline`,
        relatedId: newForm.id,
        relatedType: 'form'
      });
    });

    res.status(201).json({
      message: 'Form created successfully',
      form: newForm
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create form', error: error.message });
  }
};

// Submit form response (Headmaster only)
const submitForm = (req, res) => {
  try {
    const { id } = req.params;
    const responseData = parseResponses(req.body.responses || req.body);

    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const form = dataStore.getFormById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Process uploaded files
    const uploadedFiles = req.files?.map(file => `/uploads/reports/${file.filename}`) || [];

    // Add response
    if (!form.responses) {
      form.responses = {};
    }

    form.responses[req.user.schoolId] = {
      ...responseData,
      schoolName: req.user.schoolName,
      submittedAt: new Date().toISOString(),
      status: 'completed',
      attachments: uploadedFiles
    };

    // Notify admin
    dataStore.addNotification({
      userId: 'admin_1',
      type: 'form_submission',
      title: 'Form Submission Received',
      message: `${req.user.schoolName} submitted ${form.title}`,
      relatedId: form.id,
      relatedType: 'form'
    });

    res.json({
      message: 'Form submitted successfully',
      response: form.responses[req.user.schoolId]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit form', error: error.message });
  }
};

// Get form submission status
const getFormStatus = (req, res) => {
  try {
    const { id } = req.params;
    const form = dataStore.getFormById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const schoolStatus = dataStore.schools.map(school => ({
      schoolId: school.id,
      schoolName: school.name,
      headmasterId: school.headmasterId,
      headmasterName: school.headmasterName,
      status: form.responses?.[school.id]?.status || 'pending',
      submittedAt: form.responses?.[school.id]?.submittedAt || null
    }));

    const stats = {
      total: dataStore.schools.length,
      completed: schoolStatus.filter(s => s.status === 'completed').length,
      pending: schoolStatus.filter(s => s.status === 'pending').length
    };

    res.json({
      formId: form.id,
      formTitle: form.title,
      stats,
      schools: schoolStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch form status', error: error.message });
  }
};

// Generate and download Excel report
const downloadExcel = (req, res) => {
  try {
    const { id } = req.params;
    const form = dataStore.getFormById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Prepare data for Excel
    const excelData = dataStore.schools.map(school => {
      const response = form.responses?.[school.id];
      
      const row = {
        'School Name': school.name,
        'UDISE Code': school.udise,
        'Headmaster': school.headmasterName,
        'Status': response?.status || 'Pending',
        'Submission Date': response?.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : '-'
      };

      // Add form fields as columns
      form.fields.forEach(field => {
        const value = response?.[field.id];
        if (field.type === 'boolean') {
          row[field.label] = value ? 'Yes' : value === false ? 'No' : '-';
        } else if (field.type === 'file') {
          row[field.label] = value && value.length > 0 ? 'Attached' : '-';
        } else {
          row[field.label] = value || '-';
        }
      });

      return row;
    });

    // Create workbook
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // School Name
      { wch: 15 }, // UDISE
      { wch: 20 }, // Headmaster
      { wch: 12 }, // Status
      { wch: 15 }, // Submission Date
      ...form.fields.map(() => ({ wch: 20 }))
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Form Responses');

    // Generate filename
    const filename = `report_${form.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = path.join(__dirname, '..', '..', 'uploads', 'reports', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    xlsx.writeFile(wb, filepath);

    // Send file
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Failed to download file' });
      }
      
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    console.error('Excel generation error:', error);
    res.status(500).json({ message: 'Failed to generate Excel', error: error.message });
  }
};

// Get consolidated report data (for preview)
const getConsolidatedReport = (req, res) => {
  try {
    const { id } = req.params;
    const form = dataStore.getFormById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Calculate completion rate
    const totalSchools = dataStore.schools.length;
    const completedResponses = Object.keys(form.responses || {}).length;
    const completionRate = Math.round((completedResponses / totalSchools) * 100);

    // Aggregate data
    const aggregated = {
      formId: form.id,
      formTitle: form.title,
      totalSchools,
      completedResponses,
      pendingResponses: totalSchools - completedResponses,
      completionRate,
      schools: dataStore.schools.map(school => ({
        id: school.id,
        name: school.name,
        udise: school.udise,
        headmaster: school.headmasterName,
        submitted: !!form.responses?.[school.id],
        response: form.responses?.[school.id] || null
      }))
    };

    res.json(aggregated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch consolidated report', error: error.message });
  }
};

// Get all forms report (Admin overview)
const getFormsOverview = (req, res) => {
  try {
    const overview = dataStore.reportForms.map(form => {
      const completed = Object.keys(form.responses || {}).length;
      return {
        id: form.id,
        title: form.title,
        status: form.status,
        deadline: form.deadline,
        createdAt: form.createdAt,
        totalSchools: dataStore.schools.length,
        completedResponses: completed,
        pendingResponses: dataStore.schools.length - completed,
        completionRate: Math.round((completed / dataStore.schools.length) * 100)
      };
    });

    res.json({ forms: overview, total: overview.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch forms overview', error: error.message });
  }
};

// Delete form (Admin only)
const deleteForm = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.reportForms.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Form not found' });
    }

    dataStore.reportForms.splice(index, 1);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete form', error: error.message });
  }
};

const sendReminder = (req, res) => {
  try {
    const { id, schoolId } = req.params;
    const form = dataStore.getFormById(id);
    const school = dataStore.getSchoolById(schoolId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    dataStore.addNotification({
      userId: school.headmasterId,
      type: 'form_reminder',
      title: 'Form Reminder',
      message: `Reminder: please submit ${form.title} before the deadline.`,
      relatedId: form.id,
      relatedType: 'form'
    });

    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send reminder', error: error.message });
  }
};

module.exports = {
  getAllForms,
  getFormById,
  createForm,
  submitForm,
  getFormStatus,
  downloadExcel,
  getConsolidatedReport,
  getFormsOverview,
  deleteForm,
  sendReminder
};
