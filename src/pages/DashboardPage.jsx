import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckSquare,
  DollarSign,
  AlertCircle,
  Plus,
  Users,
  CreditCard,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import dashboardService from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    totalCollected: 0,
    pendingReceivables: 0,
    overdueBalance: 0,
    totalClients: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
  };

  const upcomingProjects = data?.upcomingDeadlines?.projects || [];
  const upcomingTasks = data?.upcomingDeadlines?.tasks || [];
  const recentPayments = data?.recentPayments || [];
  const recentProjects = data?.recentProjects || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Freelancer'}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Here is your freelance business summary for today. You have{' '}
              <span className="font-semibold text-white">{metrics.activeProjects} active projects</span>{' '}
              and <span className="font-semibold text-white">{metrics.pendingTasks} tasks pending</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Collected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{metrics.totalCollected.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Lifetime collected earnings</span>
          </p>
        </div>

        {/* Active Projects */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{metrics.activeProjects}</p>
          <p className="mt-1 text-xs text-slate-500">
            Across {metrics.totalProjects} total commissioned
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{metrics.pendingTasks}</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            {metrics.inProgressTasks} currently in progress
          </p>
        </div>

        {/* Pending Receivables */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receivables
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{metrics.pendingReceivables.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.overdueBalance > 0 ? (
              <span className="text-rose-600 font-bold">
                {user?.currency || '$'}{metrics.overdueBalance.toLocaleString()} overdue
              </span>
            ) : (
              'No overdue invoices'
            )}
          </p>
        </div>
      </div>

      {/* Grid: Upcoming Deadlines Radar & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines Radar (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines (Next 7 Days)</h3>
                <p className="text-xs text-slate-500">Items requiring immediate attention and delivery</p>
              </div>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingProjects.length === 0 && upcomingTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-sm font-medium">All caught up! 🎉</p>
                <p className="text-xs mt-1">No urgent deliverables due in the next 7 days.</p>
              </div>
            ) : (
              <>
                {/* Upcoming Projects */}
                {upcomingProjects.map((p) => (
                  <div
                    key={`p-${p.id}`}
                    onClick={() => navigate('/projects')}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">Client: {p.client?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(p.deadline).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Upcoming Tasks */}
                {upcomingTasks.map((t) => (
                  <div
                    key={`t-${t.id}`}
                    onClick={() => navigate('/tasks')}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                        <p className="text-xs text-slate-500">Project: {t.project?.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Hub Navigation & Client Summary (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Quick Shortcuts
            </h3>
            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => navigate('/clients')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition text-left text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Clients Directory</span>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                  {metrics.totalClients} clients
                </span>
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition text-left text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span>Projects Workspace</span>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                  {metrics.totalProjects} projects
                </span>
              </button>

              <button
                onClick={() => navigate('/tasks')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition text-left text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                  <span>Tasks Kanban</span>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                  {metrics.totalTasks} tasks
                </span>
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition text-left text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Analytics & Reports</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
              <p className="font-bold">SESD Project Status</p>
              <p className="text-indigo-700 mt-0.5">
                Full-stack architecture running on React, Express & Prisma PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
            <p className="text-xs text-slate-500">Latest financial billing and payment statuses</p>
          </div>
          <Link
            to="/payments"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Go to Invoicing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No recent invoice transactions recorded.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5">Invoice #</th>
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs font-bold text-indigo-600">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{p.client?.name}</td>
                    <td className="py-3 font-bold text-slate-900">
                      {p.currency || '$'}{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
