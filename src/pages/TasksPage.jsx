import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  X,
  Layers,
  AlertCircle,
  Briefcase,
  Columns,
  List,
  Target,
} from 'lucide-react';
import taskService from '../services/task.service';
import projectService from '../services/project.service';
import milestoneService from '../services/milestone.service';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'border-slate-300 bg-slate-50' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-indigo-300 bg-indigo-50/30' },
  { key: 'REVIEW', label: 'In Review', color: 'border-amber-300 bg-amber-50/30' },
  { key: 'DONE', label: 'Completed', color: 'border-emerald-300 bg-emerald-50/30' },
];

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projectMilestones, setProjectMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    milestoneId: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedHours: '',
    actualHours: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        search,
        projectId: projectFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchProjectMilestones = async (projectId) => {
    if (!projectId) {
      setProjectMilestones([]);
      return;
    }
    try {
      setMilestonesLoading(true);
      const res = await milestoneService.getMilestones(projectId);
      if (res.success) {
        setProjectMilestones(res.data.milestones || []);
      } else {
        setProjectMilestones([]);
      }
    } catch (err) {
      console.error('Failed to fetch milestones for project:', err);
      setProjectMilestones([]);
    } finally {
      setMilestonesLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [projectFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const openCreateModal = (defaultStatus = 'TODO') => {
    const initialProjectId = projects[0]?.id || '';
    setEditingTask(null);
    setFormData({
      title: '',
      projectId: initialProjectId,
      milestoneId: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
      dueDate: '',
      estimatedHours: '',
      actualHours: '',
    });
    setFormError('');
    setIsModalOpen(true);
    if (initialProjectId) {
      fetchProjectMilestones(initialProjectId);
    } else {
      setProjectMilestones([]);
    }
  };

  const openEditModal = (task, e) => {
    e?.stopPropagation();
    setEditingTask(task);
    setFormData({
      title: task.title,
      projectId: task.projectId,
      milestoneId: task.milestoneId || '',
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || '',
    });
    setFormError('');
    setIsModalOpen(true);
    if (task.projectId) {
      fetchProjectMilestones(task.projectId);
    } else {
      setProjectMilestones([]);
    }
  };

  const handleProjectChange = (newProjectId) => {
    setFormData((prev) => ({
      ...prev,
      projectId: newProjectId,
      milestoneId: '', // Reset milestone association when project changes
    }));
    if (newProjectId) {
      fetchProjectMilestones(newProjectId);
    } else {
      setProjectMilestones([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.projectId) {
      setFormError('Task title and project selection are required.');
      return;
    }

    try {
      setModalLoading(true);
      const payload = {
        ...formData,
        milestoneId: formData.milestoneId || null,
      };
      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
      } else {
        await taskService.createTask(payload);
      }
      setIsModalOpen(false);
      fetchTasks();
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus, e) => {
    e?.stopPropagation();
    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateStatus(taskId, newStatus);
      fetchProjects();
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks();
    }
  };

  const advanceStatus = (task, e) => {
    e?.stopPropagation();
    const order = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = order.indexOf(task.status);
    if (currentIndex < order.length - 1) {
      handleStatusChange(task.id, order[currentIndex + 1], e);
    }
  };

  const regressStatus = (task, e) => {
    e?.stopPropagation();
    const order = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = order.indexOf(task.status);
    if (currentIndex > 0) {
      handleStatusChange(task.id, order[currentIndex - 1], e);
    }
  };

  const handleDelete = async (id, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;

    try {
      await taskService.deleteTask(id);
      fetchTasks();
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

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

  // KPIs
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Task Management</h2>
          <p className="text-sm text-slate-500">
            Organize daily work items, track hours, and execute project deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => openCreateModal('TODO')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Work Items</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{inProgressTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Under Review</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{reviewTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{doneTasks}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="flex items-center justify-center w-5 h-5 text-[11px] font-bold text-slate-600 bg-white rounded-full border border-slate-200 shadow-xs">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreateModal(col.key)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white transition"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3 pt-3 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-3 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">No tasks in {col.label.toLowerCase()}</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-4 space-y-3 group"
                      >
                        {/* Priority & Actions */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => openEditModal(task, e)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(task.id, task.title, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Project & Milestone Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 max-w-full">
                            <Briefcase className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate font-medium text-slate-700">
                              {task.project?.title}
                            </span>
                          </div>
                          {task.milestone && (
                            <div
                              className="flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-200/60 max-w-full"
                              title={`Milestone: ${task.milestone.title}`}
                            >
                              <Target className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="truncate max-w-[120px] font-medium">
                                {task.milestone.title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Meta: Due Date & Status Flow Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          {task.dueDate ? (
                            <div
                              className={`flex items-center gap-1 text-[11px] ${
                                new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                                  ? 'text-rose-600 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300">No deadline</span>
                          )}

                          {/* Quick workflow advances */}
                          <div className="flex items-center gap-1">
                            {task.status !== 'TODO' && (
                              <button
                                onClick={(e) => regressStatus(task, e)}
                                title="Move back"
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {task.status !== 'DONE' && (
                              <button
                                onClick={(e) => advanceStatus(task, e)}
                                title="Advance status"
                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded font-semibold"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Hours (Est / Act)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {task.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      <div className="font-medium text-slate-800">{task.project?.title}</div>
                      {task.milestone && (
                        <div
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 mt-1"
                          title={`Milestone: ${task.milestone.title}`}
                        >
                          <Target className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[140px] font-medium">
                            {task.milestone.title}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-50 border border-slate-200"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">In Review</option>
                        <option value="DONE">Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {task.estimatedHours || 0}h / {task.actualHours || 0}h
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => openEditModal(task, e)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(task.id, task.title, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
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
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Design responsive landing page hero"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Associated Project *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Milestone (Optional)</span>
                    {milestonesLoading && (
                      <span className="text-[10px] text-indigo-600 font-normal">Loading...</span>
                    )}
                  </label>
                  <select
                    value={formData.milestoneId}
                    onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
                    disabled={!formData.projectId || milestonesLoading}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">No Milestone</option>
                    {projectMilestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.status === 'COMPLETED' || m.completed ? '✓ (Completed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Workflow Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">In Review</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    placeholder="4.0"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Actual Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actualHours}
                    onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
                    placeholder="3.5"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Task Scope / Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Acceptance criteria, assets links, checklist notes..."
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
                  {modalLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
