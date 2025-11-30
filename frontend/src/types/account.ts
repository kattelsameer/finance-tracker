export interface AccountType {
  id: number;
  typeCode: string;
  typeName: string;
  isLiability: boolean;
  displayOrder: number;
}

export interface Account {
  id: number;
  accountType: AccountType;
  accountName: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode: string;
  icon: string;
  isActive: boolean;
  includeInNetWorth: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  accountTypeId: number;
  accountName: string;
  currency: string;
  initialBalance: number;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode: string;
  icon: string;
  includeInNetWorth: boolean;
  notes?: string;
}

export interface UpdateAccountRequest {
  accountTypeId?: number;
  accountName?: string;
  currency?: string;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode?: string;
  icon?: string;
  includeInNetWorth?: boolean;
  notes?: string;
}
