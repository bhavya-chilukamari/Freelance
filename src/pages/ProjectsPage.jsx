import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Layers,
  ArrowRight,
  Target,
  Check,
} from 'lucide-react';
import projectService from '../services/project.service';
import clientService from '../services/client.service';
import milestoneService from '../services/milestone.service';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    budget: '',
    currency: user?.currency || 'USD',
    startDate: '',
    deadline: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Milestone Management Modal State
  const [activeMilestoneProject, setActiveMilestoneProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [milestoneFormError, setMilestoneFormError] = useState('');
  const [milestoneFormSuccess, setMilestoneFormSuccess] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const openMilestoneModal = async (project) => {
    setActiveMilestoneProject(project);
    setEditingMilestoneId(null);
    setMilestoneFormData({ title: '', description: '', dueDate: '' });
    setMilestoneFormError('');
    setMilestoneFormSuccess('');
    await fetchMilestones(project.id);
  };

  const closeMilestoneModal = () => {
    setActiveMilestoneProject(null);
    setMilestones([]);
    setEditingMilestoneId(null);
    setMilestoneFormData({ title: '', description: '', dueDate: '' });
    setMilestoneFormError('');
    setMilestoneFormSuccess('');
  };

  const fetchMilestones = async (projectId) => {
    try {
      setMilestonesLoading(true);
      const res = await milestoneService.getMilestones(projectId);
      if (res.success) {
        setMilestones(res.data.milestones || []);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setMilestonesLoading(false);
    }
  };

  const handleMilestoneFormSubmit = async (e) => {
    e.preventDefault();
    setMilestoneFormError('');
    setMilestoneFormSuccess('');

    if (!milestoneFormData.title.trim()) {
      setMilestoneFormError('Milestone title is required.');
      return;
    }

    try {
      setMilestoneSubmitting(true);
      if (editingMilestoneId) {
        await milestoneService.updateMilestone(editingMilestoneId, milestoneFormData);
        setMilestoneFormSuccess('Milestone updated successfully!');
      } else {
        await milestoneService.createMilestone(activeMilestoneProject.id, milestoneFormData);
        setMilestoneFormSuccess('Milestone created successfully!');
      }
      setMilestoneFormData({ title: '', description: '', dueDate: '' });
      setEditingMilestoneId(null);
      await fetchMilestones(activeMilestoneProject.id);
      await fetchProjects(); // Refreshes project cards & progress percentages!
    } catch (err) {
      setMilestoneFormError(err.response?.data?.message || 'Failed to save milestone.');
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      // Optimistic update in UI
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, status: m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
            : m
        )
      );
      await milestoneService.toggleMilestone(milestoneId);
      await fetchMilestones(activeMilestoneProject.id);
      await fetchProjects(); // Refreshes project progress calculation!
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
      if (activeMilestoneProject) fetchMilestones(activeMilestoneProject.id);
    }
  };

  const handleDeleteMilestone = async (milestoneId, title) => {
    if (!window.confirm(`Are you sure you want to delete milestone "${title}"?`)) {
      return;
    }
    try {
      await milestoneService.deleteMilestone(milestoneId);
      if (editingMilestoneId === milestoneId) {
        setEditingMilestoneId(null);
        setMilestoneFormData({ title: '', description: '', dueDate: '' });
      }
      await fetchMilestones(activeMilestoneProject.id);
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone.');
    }
  };

  const startEditMilestone = (m) => {
    setEditingMilestoneId(m.id);
    setMilestoneFormData({
      title: m.title,
      description: m.description || '',
      dueDate: m.dueDate ? m.dueDate.split('T')[0] : '',
    });
    setMilestoneFormError('');
    setMilestoneFormSuccess('');
  };

  const cancelEditMilestone = () => {
    setEditingMilestoneId(null);
    setMilestoneFormData({ title: '', description: '', dueDate: '' });
    setMilestoneFormError('');
    setMilestoneFormSuccess('');
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects({
        search,
        status: statusFilter,
        clientId: clientFilter,
      });
      if (res.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await clientService.getClients();
      if (res.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, clientFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      clientId: clients[0]?.id || '',
      description: '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      budget: '',
      currency: user?.currency || 'USD',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (project, e) => {
    e?.stopPropagation();
    setEditingProject(project);
    setFormData({
      title: project.title,
      clientId: project.clientId,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      budget: project.budget || '',
      currency: project.currency || user?.currency || 'USD',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.clientId) {
      setFormError('Project title and client selection are required.');
      return;
    }

    try {
      setModalLoading(true);
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project "${title}"? This will also remove associated tasks and milestones.`)) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  // KPIs
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ON_HOLD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Project Management</h2>
          <p className="text-sm text-slate-500">
            Track client delivery lifecycles, milestone progression, and deadlines.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Projects</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalProjects}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{inProgressProjects}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{completedProjects}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-700 uppercase tracking-wider">Pipeline Value</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Client Filter Dropdown */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-slate-200 text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No projects found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {clients.length === 0
              ? 'Please add a client before creating your first project.'
              : 'Create a new project to start scheduling milestones and tracking tasks.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 group"
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(
                        project.priority
                      )}`}
                    >
                      {project.priority}
                    </span>
                    <button
                      onClick={(e) => openEditModal(project, e)}
                      title="Edit Project"
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, project.title, e)}
                      title="Delete Project"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project Title & Client */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Client: <span className="text-slate-700 font-semibold">{project.client?.name}</span>
                    {project.client?.company && ` • ${project.client.company}`}
                  </p>
                </div>

                {project.description && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-indigo-600">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.progress === 100
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Manage Milestones Action Button */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMilestoneModal(project);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl transition"
                    title="View and manage project milestones"
                  >
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Manage Milestones ({project.milestoneCount || 0})</span>
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
                  <span>
                    {project.currency || user?.currency || '$'}
                    {parseFloat(project.budget || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px]" title="Associated Tasks">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.taskCount || 0} tasks</span>
                  </div>

                  {project.deadline && (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        new Date(project.deadline) < new Date() && project.status !== 'COMPLETED'
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-500'
                      }`}
                      title="Deadline"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E-commerce Web App Redesign"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Client *
                  </label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lifecycle Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="ON_HOLD">ON HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Budget ({user?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="3500.00"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Scope & Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Core deliverables, tech stack requirements, client expectations..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Milestones Modal */}
      {activeMilestoneProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeMilestoneProject.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage project milestones, deliverables, and completion status
                  </p>
                </div>
              </div>
              <button
                onClick={closeMilestoneModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Progress Summary Card */}
              {(() => {
                const totalM = milestones.length;
                const completedM = milestones.filter((m) => m.status === 'COMPLETED').length;
                const pct = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
                return (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-700">
                        Milestone Progress: {completedM} of {totalM} completed
                      </span>
                      <span className="text-indigo-600 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Add / Edit Milestone Form */}
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>{editingMilestoneId ? 'Edit Milestone' : 'Add New Milestone'}</span>
                  {editingMilestoneId && (
                    <button
                      type="button"
                      onClick={cancelEditMilestone}
                      className="text-xs text-slate-500 hover:text-slate-700 font-normal underline"
                    >
                      Cancel Editing
                    </button>
                  )}
                </h4>

                {milestoneFormError && (
                  <div className="p-3 mb-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{milestoneFormError}</span>
                  </div>
                )}

                {milestoneFormSuccess && (
                  <div className="p-3 mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{milestoneFormSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleMilestoneFormSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Milestone Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={milestoneFormData.title}
                        onChange={(e) =>
                          setMilestoneFormData({ ...milestoneFormData, title: e.target.value })
                        }
                        placeholder="e.g. Phase 1: Database Architecture & API"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={milestoneFormData.dueDate}
                        onChange={(e) =>
                          setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Description / Deliverables (Optional)
                    </label>
                    <textarea
                      rows="2"
                      value={milestoneFormData.description}
                      onChange={(e) =>
                        setMilestoneFormData({ ...milestoneFormData, description: e.target.value })
                      }
                      placeholder="Key deliverable criteria, acceptance requirements..."
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {editingMilestoneId && (
                      <button
                        type="button"
                        onClick={cancelEditMilestone}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={milestoneSubmitting}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
                    >
                      {milestoneSubmitting
                        ? 'Saving...'
                        : editingMilestoneId
                        ? 'Update Milestone'
                        : 'Add Milestone'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Project Milestones ({milestones.length})
                </h4>

                {milestonesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No milestones yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add deliverables above to track progress toward project completion.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {milestones.map((m) => {
                      const isCompleted = m.status === 'COMPLETED';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Toggle Button */}
                            <button
                              onClick={() => handleToggleMilestone(m.id)}
                              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                              className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border transition-colors shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-indigo-600 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h5
                                  className={`text-sm font-semibold truncate ${
                                    isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  {m.title}
                                </h5>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </div>

                              {m.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {m.description}
                                </p>
                              )}

                              {m.dueDate && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-3 shrink-0">
                            <button
                              onClick={() => startEditMilestone(m)}
                              title="Edit Milestone"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMilestone(m.id, m.title)}
                              title="Delete Milestone"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                onClick={closeMilestoneModal}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
