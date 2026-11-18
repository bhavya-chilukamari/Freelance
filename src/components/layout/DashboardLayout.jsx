import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/clients': 'Client Management',
  '/projects': 'Projects & Deliverables',
  '/tasks': 'Task Execution Board',
  '/payments': 'Invoices & Financials',
  '/reports': 'Reports & Analytics',
  '/settings': 'Account & Business Settings',
};

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'Workspace';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:overflow-visible print:h-auto">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={currentTitle} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible print:h-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

