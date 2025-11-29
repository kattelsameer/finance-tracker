import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { ComingSoon } from './components/ComingSoon';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { RecurringTransactionsPage } from './pages/RecurringTransactionsPage';
import { ImportExportPage } from './pages/ImportExportPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import { Wallet, ArrowLeftRight, FolderTree, Tag, Target } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="accounts" element={
                <ComingSoon 
                  title="Accounts" 
                  description="Manage all your financial accounts in one place. Track balances, view transactions, and organize your finances."
                  icon={Wallet}
                  features={[
                    "Add bank accounts, credit cards, and cash accounts",
                    "Real-time balance tracking",
                    "Account grouping and organization",
                    "Transaction history per account"
                  ]}
                />
              } />
              <Route path="transactions" element={
                <ComingSoon 
                  title="Transactions" 
                  description="View, add, and manage all your financial transactions with powerful filtering and sorting options."
                  icon={ArrowLeftRight}
                  features={[
                    "Add income, expenses, and transfers",
                    "Categorize and tag transactions",
                    "Split transactions across categories",
                    "Attach receipts and notes"
                  ]}
                />
              } />
              <Route path="search" element={<AdvancedSearchPage />} />
              <Route path="recurring-transactions" element={<RecurringTransactionsPage />} />
              <Route path="import-export" element={<ImportExportPage />} />
              <Route path="categories" element={
                <ComingSoon 
                  title="Categories" 
                  description="Organize your transactions with custom categories. Create hierarchies and set budgets per category."
                  icon={FolderTree}
                  features={[
                    "Create custom income and expense categories",
                    "Hierarchical subcategories",
                    "Category icons and colors",
                    "Default system categories included"
                  ]}
                />
              } />
              <Route path="tags" element={
                <ComingSoon 
                  title="Tags" 
                  description="Add flexible tags to transactions for additional organization and reporting capabilities."
                  icon={Tag}
                  features={[
                    "Create unlimited custom tags",
                    "Apply multiple tags per transaction",
                    "Filter and search by tags",
                    "Tag-based reports and analytics"
                  ]}
                />
              } />
              <Route path="budgets" element={
                <ComingSoon 
                  title="Budgets" 
                  description="Set spending limits and track your progress. Get alerts when you're approaching your budget limits."
                  icon={Target}
                  features={[
                    "Monthly, weekly, and custom budget periods",
                    "Category-based budgets",
                    "Progress tracking with visual indicators",
                    "Budget alerts and notifications"
                  ]}
                />
              } />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notification-settings" element={<NotificationSettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
