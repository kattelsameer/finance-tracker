import { 
  Edit3, 
  Trash2, 
  EyeOff,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Banknote,
  Car,
  Home,
  Building2,
  CircleDollarSign,
  Landmark,
  type LucideIcon
} from 'lucide-react';
import type { Account } from '../../types';
import { SecondaryCurrencyBadge } from '../ui/SecondaryCurrencyBadge';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  banknote: Banknote,
  car: Car,
  home: Home,
  building: Building2,
  'circle-dollar-sign': CircleDollarSign,
  landmark: Landmark,
};

function getAccountIcon(iconName: string | undefined, colorCode: string) {
  const IconComponent = iconName ? ICON_MAP[iconName.toLowerCase()] : null;
  
  if (IconComponent) {
    return <IconComponent className="h-6 w-6" style={{ color: colorCode }} />;
  }
  
  // Fallback to wallet icon if not found
  return <Wallet className="h-6 w-6" style={{ color: colorCode }} />;
}

interface AccountListProps {
  accounts: Account[];
  formatCurrency: (amount: number, currency?: string) => string;
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  showInactive: boolean;
}

export function AccountList({ accounts, formatCurrency, onEdit, onDelete, showInactive }: Readonly<AccountListProps>) {
  const activeAccounts = showInactive ? accounts : accounts.filter(a => a.isActive);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {activeAccounts.map((account) => (
        <div
          key={account.id}
          data-testid="account-item"
          className="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-all"
          style={{ borderColor: account.colorCode }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${account.colorCode}20` }}
              >
                {getAccountIcon(account.icon, account.colorCode)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{account.accountName}</h3>
                <p className="text-sm text-gray-500">{account.accountType?.typeName}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(account)}
                aria-label="Edit"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                aria-label="Delete"
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex-shrink-0">Balance</span>
              <div className="flex items-center gap-1.5 ml-auto min-w-0">
                <span className="text-xl font-bold truncate" style={{ color: account.colorCode }}>
                  {formatCurrency(account.currentBalance, account.currency)}
                </span>
                <SecondaryCurrencyBadge
                  amount={account.currentBalance}
                  primaryCurrency={account.currency}
                  className="flex-shrink-0"
                />
              </div>
            </div>
            {account.institutionName && (
              <p className="text-xs text-gray-500">{account.institutionName}</p>
            )}
            {!account.isActive && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <EyeOff className="h-3 w-3" />
                Inactive
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
