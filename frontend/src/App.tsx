import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { BooksView } from './views/BooksView';
import { MembersView } from './views/MembersView';
import { TransactionsView } from './views/TransactionsView';
import { ToastProvider } from './context/ToastContext';

export const AppContent: React.FC = () => {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = (queryParams?.get('tab') as ActiveTab) || 'dashboard';
  const initialModal = queryParams?.get('modal');

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // Quick Action Triggers between components
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(initialModal === 'checkout');
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(initialModal === 'addBook');

  const handleOpenCheckout = () => {
    setActiveTab('transactions');
    setIsCheckoutModalOpen(true);
  };

  const handleOpenAddBook = () => {
    setActiveTab('books');
    setIsAddBookModalOpen(true);
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardView
          onNavigate={setActiveTab}
          onOpenCheckout={handleOpenCheckout}
          onOpenAddBook={handleOpenAddBook}
        />
      )}

      {activeTab === 'books' && (
        <BooksView
          isAddModalOpen={isAddBookModalOpen}
          setIsAddModalOpen={setIsAddBookModalOpen}
        />
      )}

      {activeTab === 'members' && <MembersView />}

      {activeTab === 'transactions' && (
        <TransactionsView
          isCheckoutModalOpen={isCheckoutModalOpen}
          setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        />
      )}
    </MainLayout>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;

