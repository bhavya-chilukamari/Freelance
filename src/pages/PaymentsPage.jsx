import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Edit2,
  Trash2,
  X,
  Building,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import paymentService from '../services/payment.service';
import clientService from '../services/client.service';
import projectService from '../services/project.service';
import { useAuth } from '../context/AuthContext';

export const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);

  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    invoiceNumber: '',
    title: '',
    amount: '',
    currency: user?.currency || 'USD',
    status: 'SENT',
    paymentMethod: 'BANK_TRANSFER',
    dueDate: '',
    notes: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments({
        search,
        status: statusFilter,
        clientId: clientFilter,
      });
      if (res.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        clientService.getClients(),
        projectService.getProjects(),
      ]);
      if (clientsRes.success) setClients(clientsRes.data.clients || []);
      if (projectsRes.success) setProjects(projectsRes.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, clientFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const openCreateModal = () => {
    setEditingPayment(null);
    const count = payments.length;
    const defaultInvoiceNum = `INV-${String(count + 1).padStart(4, '0')}`;

    // Default due date: 14 days from now
    const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    setFormData({
      clientId: clients[0]?.id || '',
      projectId: '',
      invoiceNumber: defaultInvoiceNum,
      title: 'Milestone Deliverable / Professional Services',
      amount: '',
      currency: user?.currency || 'USD',
      status: 'SENT',
      paymentMethod: 'BANK_TRANSFER',
      dueDate: defaultDueDate,
      notes: 'Payment is due within 14 days. Thank you for your business!',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (payment, e) => {
    e?.stopPropagation();
    setEditingPayment(payment);
    setFormData({
      clientId: payment.clientId,
      projectId: payment.projectId || '',
      invoiceNumber: payment.invoiceNumber,
      title: payment.title,
      amount: payment.amount,
      currency: payment.currency || user?.currency || 'USD',
      status: payment.status,
      paymentMethod: payment.paymentMethod || 'BANK_TRANSFER',
      dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : '',
      notes: payment.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.clientId || !formData.title || !formData.amount || !formData.dueDate) {
      setFormError('Please fill out all required invoice fields.');
      return;
    }

    try {
      setModalLoading(true);
      if (editingPayment) {
        await paymentService.updatePayment(editingPayment.id, formData);
      } else {
        await paymentService.createPayment(formData);
      }
      setIsModalOpen(false);
      fetchPayments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save invoice.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkAsPaid = async (id, e) => {
    e?.stopPropagation();
    try {
      await paymentService.updateStatus(id, 'PAID');
      fetchPayments();
    } catch (err) {
      alert('Failed to update payment status.');
    }
  };

  const handleDelete = async (id, invoiceNumber, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;

    try {
      await paymentService.deletePayment(id);
      fetchPayments();
      if (previewPayment?.id === id) setPreviewPayment(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete payment.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // KPIs
  const totalInvoiced = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalReceivables = payments
    .filter((p) => p.status === 'SENT')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalOverdue = payments
    .filter((p) => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <>
      <div className="space-y-6 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoices & Financials</h2>
          <p className="text-sm text-slate-500">
            Track business cash flow, generate client invoices, and record payments.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Invoiced</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalInvoiced.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Collected (Paid)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Pending Receivables</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalReceivables.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Overdue Balance</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalOverdue.toLocaleString()}
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
            placeholder="Search invoices by number or title..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'PAID', 'SENT', 'OVERDUE', 'DRAFT'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No invoices found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {clients.length === 0
                ? 'Add your first client to start creating professional invoices.'
                : 'Create an invoice to bill your clients and track incoming payments.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setPreviewPayment(p)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>
                        <p>{p.client?.name}</p>
                        {p.client?.company && (
                          <p className="text-[11px] text-slate-400 font-normal">{p.client.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.project?.title || <span className="text-slate-400 italic">Standalone</span>}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(p.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.currency || user?.currency || '$'}
                      {parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'PAID' && (
                          <button
                            onClick={(e) => handleMarkAsPaid(p.id, e)}
                            title="Mark as Paid"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPayment(p);
                          }}
                          title="Print / View Invoice"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => openEditModal(p, e)}
                          title="Edit"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(p.id, p.invoiceNumber, e)}
                          title="Delete"
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
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
        )}
      </div>
    </div>

    {/* Print-Ready Invoice Preview Modal */}
      {previewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:w-full print:max-w-none print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0">
            {/* Modal Controls Header (Hidden during actual browser print) */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
              <span className="text-sm font-semibold">Invoice Preview – {previewPayment.invoiceNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewPayment(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div
              id="printable-invoice"
              className="p-8 sm:p-12 space-y-8 bg-white print:p-0 print:m-0 print:space-y-6"
            >
              {/* Invoice Top Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    INVOICE
                  </h2>
                  <p className="text-sm font-mono font-bold text-indigo-600 mt-0.5">
                    {previewPayment.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold text-slate-900">
                    {user?.businessName || user?.fullName || 'Freelance Studio'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                  {user?.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
                  {user?.taxId && <p className="text-xs text-slate-500">Tax ID: {user.taxId}</p>}
                </div>
              </div>

              {/* Billed To & Dates */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider">BILLED TO:</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{previewPayment.client?.name}</p>
                  {previewPayment.client?.company && (
                    <p className="text-slate-600">{previewPayment.client.company}</p>
                  )}
                  <p className="text-slate-600">{previewPayment.client?.email}</p>
                  {previewPayment.client?.address && (
                    <p className="text-slate-600 mt-0.5">{previewPayment.client.address}</p>
                  )}
                </div>
                <div className="text-right space-y-1.5">
                  <div>
                    <span className="text-slate-400">Issue Date: </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(previewPayment.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date: </span>
                    <span className="font-bold text-rose-600">
                      {new Date(previewPayment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                        previewPayment.status
                      )}`}
                    >
                      {previewPayment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-700 uppercase">
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="py-4">
                        <p className="font-semibold text-slate-900">{previewPayment.title}</p>
                        {previewPayment.project && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Project: {previewPayment.project.title}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-right font-bold text-slate-900">
                        {previewPayment.currency || '$'}{parseFloat(previewPayment.amount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>
                      {previewPayment.currency || '$'}{parseFloat(previewPayment.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Due:</span>
                    <span className="text-base text-indigo-600">
                      {previewPayment.currency || '$'}{parseFloat(previewPayment.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions / Notes */}
              {previewPayment.notes && (
                <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
                  <p className="font-bold text-slate-700 uppercase tracking-wider mb-1">Notes & Terms:</p>
                  <p className="whitespace-pre-wrap">{previewPayment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingPayment ? 'Edit Invoice' : 'Create New Invoice'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

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
                    <option value="">Select client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Associated Project (Optional)
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None / Standalone Invoice</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                    <option value="STRIPE">Stripe / Credit Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CASH">Cash / Direct</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="UI/UX Prototype Delivery"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1500.00"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SENT">SENT</option>
                    <option value="PAID">PAID</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Instructions & Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Wire transfer instructions, routing numbers, terms..."
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
                  {modalLoading ? 'Saving...' : editingPayment ? 'Update Invoice' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentsPage;
