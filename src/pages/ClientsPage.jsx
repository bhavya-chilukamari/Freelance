import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import clientService from '../services/client.service';
import { useAuth } from '../context/AuthContext';

export const ClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    notes: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected client for detail drawer
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientService.getClients({ search, status: statusFilter });
      if (res.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClients();
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      status: 'ACTIVE',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (client, e) => {
    e?.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status,
      notes: client.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email) {
      setFormError('Client name and email are required.');
      return;
    }

    try {
      setModalLoading(true);
      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData);
      } else {
        await clientService.createClient(formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save client.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await clientService.deleteClient(id);
      fetchClients();
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client.');
    }
  };

  // KPI Calculations
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const totalLeads = clients.filter((c) => c.status === 'LEAD').length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients CRM</h2>
          <p className="text-sm text-slate-500">
            Manage your client accounts, contact information, and business relationships.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Clients</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalClients}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Active Clients</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeClients}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pipeline Leads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalLeads}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {user?.currency || '$'}{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, company, or email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'LEAD', 'INACTIVE'].map((status) => (
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

      {/* Clients Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No clients found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {search
                ? `No clients match the search query "${search}".`
                : 'Get started by adding your first client to create projects and send invoices.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Add First Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Total Billed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {client.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          client.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : client.status === 'LEAD'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {client._count?.projects || 0}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {user?.currency || '$'}
                      {(client.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => openEditModal(client, e)}
                          title="Edit Client"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(client.id, client.name, e)}
                          title="Delete Client"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
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

      {/* Client Detail Slide-Over Modal / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedClient.name}</h3>
                  <p className="text-xs text-slate-500">{selectedClient.company || 'Individual Client'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedClient.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lifecycle Status</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {selectedClient.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lifetime Revenue</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    {user?.currency || '$'}{(selectedClient.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedClient.address && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</p>
                  <p className="text-sm text-slate-700 mt-1">{selectedClient.address}</p>
                </div>
              )}

              {selectedClient.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes & Brief</p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    openEditModal(selectedClient, e);
                    setSelectedClient(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                >
                  Edit Client Info
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingClient ? 'Edit Client Details' : 'Add New Client'}
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sarah Connor"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Cyberdyne Systems"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@cyberdyne.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                    <option value="ACTIVE">ACTIVE (Current Client)</option>
                    <option value="LEAD">LEAD (Prospective)</option>
                    <option value="INACTIVE">INACTIVE (Past / Dormant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Los Angeles, CA"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internal Notes & Relationship Context
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key contacts, preferred payment terms, NDA notes..."
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
                  {modalLoading ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
