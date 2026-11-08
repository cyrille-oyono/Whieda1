import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { VisitsView } from './views/VisitsView';
import { PosView } from './views/PosView';
import { ProductsView } from './views/ProductsView';
import { PartnersView } from './views/PartnersView';
import { MedicalView } from './views/MedicalView';
import { SupplierOrdersView } from './views/SupplierOrdersView';
import { UsersView } from './views/UsersView';
import { SupabaseArchitectureView } from './views/SupabaseArchitectureView';
import { ShowcaseView } from './views/ShowcaseView';
import { FinancialAuditView } from './views/FinancialAuditView';
import { AuditLogView } from './views/AuditLogView';
import { LoginModal } from './views/LoginModal';

function MainLayout() {
  const { currentUser, isTabAllowedForRole, roles } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('showcase');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fallback role permissions
  const rolePermissions: Record<NavTab, string[]> = {
    showcase: ['visitor', 'receptionist', 'doctor', 'cashier', 'accountant', 'admin'],
    products: ['receptionist', 'doctor', 'cashier', 'accountant', 'admin'],
    visits: ['receptionist', 'admin'],
    medical: ['doctor', 'admin'],
    pos: ['cashier', 'accountant', 'admin'],
    suppliers: ['accountant', 'admin'],
    overview: ['accountant', 'admin'],
    partners: ['accountant', 'admin'],
    users: ['admin'],
    audit: ['admin'], // STRICTEMENT RESTREINT À L'ADMIN
    database: ['admin'],
  };

  const getDefaultTabForRole = (role: string): NavTab => {
    if (role === 'admin') return 'showcase';
    const roleDef = roles.find(r => r.id === role);
    if (roleDef && roleDef.allowedTabs.length > 0) {
      return (roleDef.allowedTabs[0] as NavTab) || 'showcase';
    }
    switch (role) {
      case 'visitor':
        return 'showcase';
      case 'receptionist':
        return 'showcase';
      case 'doctor':
        return 'showcase';
      case 'cashier':
        return 'pos';
      case 'accountant':
        return 'overview';
      case 'admin':
      default:
        return 'showcase';
    }
  };

  const isAllowed = 
    currentUser.role === 'admin' || 
    isTabAllowedForRole(currentUser.role, activeTab) || 
    rolePermissions[activeTab]?.includes(currentUser.role);

  const currentTab = isAllowed ? activeTab : getDefaultTabForRole(currentUser.role);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* Workspace container: Sidebar + Main Area */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar activeTab={currentTab} onTabChange={setActiveTab} />

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'showcase' && <ShowcaseView onNavigate={setActiveTab} />}
          {currentTab === 'overview' && <FinancialAuditView onNavigateToAudit={() => setActiveTab('audit')} />}
          {currentTab === 'audit' && <AuditLogView />}
          {currentTab === 'visits' && <VisitsView />}
          {currentTab === 'pos' && <PosView />}
          {currentTab === 'products' && <ProductsView />}
          {currentTab === 'partners' && <PartnersView />}
          {currentTab === 'medical' && <MedicalView />}
          {currentTab === 'suppliers' && <SupplierOrdersView />}
          {currentTab === 'users' && <UsersView />}
          {currentTab === 'database' && <SupabaseArchitectureView />}
        </main>
      </div>

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
