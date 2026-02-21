import { Wallet, Building2, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { accountService } from '../../services/account.service';
import type { Account } from '../../types';

interface AccountBalancesProps {
  formatCurrency: (amount: number) => string;
}

export function AccountBalances({ formatCurrency }: Readonly<AccountBalancesProps>) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return <TrendingUp className="h-4 w-4" />;
      case 'CREDIT':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-600';
      case 'CREDIT':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[420px] transition-all duration-300 hover:shadow-md">
      <div className="px-6 py-4 bg-teal-600 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-md">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Account Balances</h3>
            <p className="text-sm text-teal-100">Total: {formatCurrency(totalBalance)}</p>
          </div>
        </div>
        <Link
          to="/accounts"
          className="text-white hover:text-teal-100 transition-colors"
          title="View all accounts"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
      </div>
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1 relative">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-teal-600 mx-auto"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No accounts yet</p>
            <p className="text-sm text-gray-500">Create an account to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getAccountColor(account.accountType.typeCode)}`}>
                    {getAccountIcon(account.accountType.typeCode)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                    <p className="text-xs text-gray-500 capitalize">{account.accountType.typeName.toLowerCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
