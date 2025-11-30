import { Wallet } from 'lucide-react';
import type { AccountBreakdown } from '../../types';

interface AccountBreakdownTableProps {
  accounts: AccountBreakdown[];
  formatCurrency: (amount: number) => string;
}

export function AccountBreakdownTable({ accounts, formatCurrency }: AccountBreakdownTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Account Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <tr key={account.accountId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{account.accountName}</td>
                <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">{formatCurrency(account.income)}</td>
                <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">{formatCurrency(account.expenses)}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <span className={`font-medium ${account.netAmount >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                    {formatCurrency(account.netAmount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{account.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
