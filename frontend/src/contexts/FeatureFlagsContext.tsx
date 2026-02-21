import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DashboardFeatureFlags {
  summaryCards: boolean;
  monthlyTrends: boolean;
  topSpendingCategories: boolean;
  currencyConverter: boolean;
  budgetStatus: boolean;
  recentTransactions: boolean;
  savingsGoals: boolean;
  accountBalances: boolean;
}

export interface NavigationFeatureFlags {
  search: boolean;
  recurring: boolean;
  importExport: boolean;
  categories: boolean;
  tags: boolean;
  budgets: boolean;
  reports: boolean;
}

export type DashboardCardId = 'monthlyTrends' | 'topSpendingCategories' | 'currencyConverter' | 'recentTransactions' | 'accountBalances' | 'budgetStatus';

export type CardWidth = 'half' | 'full';

interface FeatureFlagsContextType {
  dashboardFeatures: DashboardFeatureFlags;
  updateDashboardFeature: (feature: keyof DashboardFeatureFlags, enabled: boolean) => void;
  navigationFeatures: NavigationFeatureFlags;
  updateNavigationFeature: (feature: keyof NavigationFeatureFlags, enabled: boolean) => void;
  resetToDefaults: () => void;
  cardOrder: DashboardCardId[];
  reorderCards: (fromIndex: number, toIndex: number) => void;
  cardWidths: Record<DashboardCardId, CardWidth>;
  toggleCardWidth: (cardId: DashboardCardId) => void;
}

const DEFAULT_DASHBOARD_FEATURES: DashboardFeatureFlags = {
  summaryCards: true,
  monthlyTrends: true,
  topSpendingCategories: true,
  currencyConverter: true,
  budgetStatus: true,
  recentTransactions: true,
  savingsGoals: true,
  accountBalances: true,
};

const DEFAULT_NAVIGATION_FEATURES: NavigationFeatureFlags = {
  search: true,
  recurring: true,
  importExport: true,
  categories: true,
  tags: true,
  budgets: true,
  reports: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const STORAGE_KEY = 'finance-tracker-feature-flags';
const NAVIGATION_STORAGE_KEY = 'finance-tracker-navigation-flags';
const CARD_ORDER_KEY = 'finance-tracker-card-order';
const CARD_WIDTHS_KEY = 'finance-tracker-card-widths';

const DEFAULT_CARD_ORDER: DashboardCardId[] = [
  'monthlyTrends',
  'topSpendingCategories',
  'currencyConverter',
  'recentTransactions',
  'accountBalances',
  'budgetStatus',
];

const DEFAULT_CARD_WIDTHS: Record<DashboardCardId, CardWidth> = {
  monthlyTrends: 'full',
  topSpendingCategories: 'half',
  currencyConverter: 'half',
  recentTransactions: 'half',
  accountBalances: 'half',
  budgetStatus: 'full',
};

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [dashboardFeatures, setDashboardFeatures] = useState<DashboardFeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_DASHBOARD_FEATURES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
    return DEFAULT_DASHBOARD_FEATURES;
  });

  const [navigationFeatures, setNavigationFeatures] = useState<NavigationFeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_NAVIGATION_FEATURES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load navigation flags:', error);
    }
    return DEFAULT_NAVIGATION_FEATURES;
  });

  const [cardOrder, setCardOrder] = useState<DashboardCardId[]>(() => {
    try {
      const stored = localStorage.getItem(CARD_ORDER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load card order:', error);
    }
    return DEFAULT_CARD_ORDER;
  });

  const [cardWidths, setCardWidths] = useState<Record<DashboardCardId, CardWidth>>(() => {
    try {
      const stored = localStorage.getItem(CARD_WIDTHS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load card widths:', error);
    }
    return DEFAULT_CARD_WIDTHS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardFeatures));
      localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navigationFeatures));
      localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(cardOrder));
      localStorage.setItem(CARD_WIDTHS_KEY, JSON.stringify(cardWidths));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  }, [dashboardFeatures, navigationFeatures, cardOrder, cardWidths]);

  const updateDashboardFeature = (feature: keyof DashboardFeatureFlags, enabled: boolean) => {
    setDashboardFeatures(prev => ({
      ...prev,
      [feature]: enabled,
    }));
  };

  const updateNavigationFeature = (feature: keyof NavigationFeatureFlags, enabled: boolean) => {
    setNavigationFeatures(prev => ({
      ...prev,
      [feature]: enabled,
    }));
  };

  const resetToDefaults = () => {
    setDashboardFeatures(DEFAULT_DASHBOARD_FEATURES);
    setNavigationFeatures(DEFAULT_NAVIGATION_FEATURES);
    setCardOrder(DEFAULT_CARD_ORDER);
    setCardWidths(DEFAULT_CARD_WIDTHS);
  };

  const reorderCards = (fromIndex: number, toIndex: number) => {
    setCardOrder(prev => {
      const newOrder = [...prev];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
      return newOrder;
    });
  };

  const toggleCardWidth = (cardId: DashboardCardId) => {
    setCardWidths(prev => ({
      ...prev,
      [cardId]: prev[cardId] === 'half' ? 'full' : 'half',
    }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ 
      dashboardFeatures, 
      updateDashboardFeature, 
      navigationFeatures, 
      updateNavigationFeature, 
      resetToDefaults, 
      cardOrder, 
      reorderCards, 
      cardWidths, 
      toggleCardWidth 
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
