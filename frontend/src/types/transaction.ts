export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId?: number;
  categoryName?: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  transactionDate: string;
  description: string;
  notes?: string;
  referenceNumber?: string;
  isRecurring: boolean;
  recurringTransactionId?: number;
  transferToAccountId?: number;
  transferToAccountName?: string;
  transferTransactionId?: number;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  tagName: string;
  colorCode: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId?: number;
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  transactionDate: string;
  description: string;
  notes?: string;
  referenceNumber?: string;
  transferToAccountId?: number;
  tagIds?: number[];
}

export interface UpdateTransactionRequest {
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  amount?: number;
  currency?: string;
  transactionDate?: string;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  tagIds?: number[];
}

export interface TransactionFilter {
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  page?: number;
  size?: number;
}

export interface TransactionSearchRequest {
  query: string;
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean;
  searchTerm?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface TransactionSearchResponse {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface SavedSearch {
  id: number;
  searchName: string;
  searchCriteria: string; // JSON string
  isDefault: boolean;
  createdAt: string;
}

export interface CreateSavedSearchRequest {
  searchName: string;
  searchCriteria: string; // JSON string
  isDefault?: boolean;
}

export interface CreateTagRequest {
  tagName: string;
  colorCode: string;
}

export interface UpdateTagRequest {
  tagName?: string;
  colorCode?: string;
}
