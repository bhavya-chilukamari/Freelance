import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';
import reportService from '../services/report.service';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

export const ReportsPage = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await reportService.getReports();
        if (res.success) {
          setReportData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const revenueTrends = reportData?.revenueTrends || [];
  const projectDistribution = reportData?.projectDistribution || [];
  const topClients = reportData?.topClients || [];
  const summary = reportData?.summary || {
    totalEarnings: 0,
    avgProjectBudget: 0,
    totalProjects: 0,
    totalClients: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Strategic business intelligence, financial trends, and client revenue concentration.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{summary.totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Paid invoices total</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Project Value
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{summary.avgProjectBudget.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Across all client projects</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Client Base
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalClients}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total registered clients</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalProjects}</p>
          <p className="text-xs text-slate-400 mt-0.5">Lifetime commissions</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Revenue Trend (Last 6 Months)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Monthly Gross ({user?.currency || '$'})</span>
          </div>

          <div className="h-72 mt-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : revenueTrends.length === 0 || revenueTrends.every((m) => m.revenue === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                <span>No paid revenue recorded yet in this window.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [`${user?.currency || '$'}${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Status Breakdown Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Project Status Distribution</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Volume</span>
          </div>

          <div className="h-72 mt-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projectDistribution.every((p) => p.count === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <span>No projects to visualize yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectDistribution.filter((p) => p.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients by Revenue Ranking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Client Revenue Concentration</h3>
            <p className="text-xs text-slate-500">
              Ranking of your top revenue-generating clients
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No revenue recorded yet to calculate client rankings.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-3">Rank</th>
                  <th className="py-3">Client Name</th>
                  <th className="py-3">Company</th>
                  <th className="py-3">Total Billed</th>
                  <th className="py-3">% of Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topClients.map((c, index) => {
                  const share =
                    summary.totalEarnings > 0
                      ? Math.round((c.totalRevenue / summary.totalEarnings) * 100)
                      : 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-400 text-xs">#{index + 1}</td>
                      <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3 text-slate-500 text-xs">{c.company}</td>
                      <td className="py-3 font-bold text-slate-900">
                        {user?.currency || '$'}{c.totalRevenue.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
