import { useEffect, useState, useCallback, type ReactElement } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types';
import { CurrencyConverterCompact } from '../components/CurrencyConverterCompact';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags, type DashboardCardId } from '../contexts/FeatureFlagsContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';
import {
  SummaryCards,
  MonthlyTrendsChartNew,
  TopSpendingCategoriesNew,
  BudgetStatusList,
  RecentTransactions,
  AccountBalances,
  DraggableCard
} from '../components/dashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { dashboardFeatures, cardOrder, reorderCards, cardWidths } = useFeatureFlags();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Date range: read from localStorage or default to last 6 months
  const [dateRange] = useState(() => {
    const saved = sessionStorage.getItem('dashboardDateRange');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default to last 6 months to show demo data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats(dateRange.startDate, dateRange.endDate);
      setStats(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, user?.defaultCurrency || 'NPR');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-white rounded-lg p-8 text-center max-w-md border border-gray-200">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    reorderCards(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderCard = (cardId: DashboardCardId) => {
    const cardWidth = cardWidths[cardId];
    const cardMap: Record<DashboardCardId, { component: ReactElement; enabled: boolean }> = {
      monthlyTrends: {
        component: <MonthlyTrendsChartNew trends={stats.monthlyTrends} />,
        enabled: dashboardFeatures.monthlyTrends,
      },
      topSpendingCategories: {
        component: <TopSpendingCategoriesNew categories={stats.topSpendingCategories} width={cardWidth} />,
        enabled: dashboardFeatures.topSpendingCategories,
      },
      currencyConverter: {
        component: <CurrencyConverterCompact />,
        enabled: dashboardFeatures.currencyConverter,
      },
      recentTransactions: {
        component: <RecentTransactions formatCurrency={formatCurrency} />,
        enabled: dashboardFeatures.recentTransactions,
      },
      accountBalances: {
        component: <AccountBalances formatCurrency={formatCurrency} />,
        enabled: dashboardFeatures.accountBalances,
      },
      budgetStatus: {
        component: <BudgetStatusList budgets={stats.budgetStatuses} formatCurrency={formatCurrency} />,
        enabled: dashboardFeatures.budgetStatus,
      },
    };

    const card = cardMap[cardId];
    if (!card || !card.enabled) return null;

    return card.component;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {dashboardFeatures.summaryCards && (
        <SummaryCards stats={stats} formatCurrency={formatCurrency} />
      )}

      {/* Draggable Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cardOrder.map((cardId, index) => {
          const cardComponent = renderCard(cardId);
          if (!cardComponent) return null;

          const cardWidth = cardWidths[cardId];
          const gridClass = cardWidth === 'full' ? 'lg:col-span-2' : 'lg:col-span-1';

          return (
            <div key={cardId} className={gridClass}>
              <DraggableCard
                id={cardId}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
              >
                {cardComponent}
              </DraggableCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
