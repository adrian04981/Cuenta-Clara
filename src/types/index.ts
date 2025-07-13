export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  category?: Category;
  description: string;
  date: Date;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  categoryId: string;
  category?: Category;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: string;
}
