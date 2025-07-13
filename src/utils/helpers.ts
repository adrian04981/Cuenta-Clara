import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Categorías de gastos
  { id: '1', name: 'Alimentación', icon: '🍕', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Transporte', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Entretenimiento', icon: '🎬', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Salud', icon: '🏥', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Educación', icon: '📚', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Hogar', icon: '🏠', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Ropa', icon: '👕', color: '#FFB6C1', type: 'expense' },
  { id: '8', name: 'Otros Gastos', icon: '💳', color: '#FFA07A', type: 'expense' },
  
  // Categorías de ingresos
  { id: '9', name: 'Salario', icon: '💼', color: '#74B9FF', type: 'income' },
  { id: '10', name: 'Freelance', icon: '💻', color: '#00B894', type: 'income' },
  { id: '11', name: 'Inversiones', icon: '📈', color: '#FDCB6E', type: 'income' },
  { id: '12', name: 'Otros Ingresos', icon: '💰', color: '#6C5CE7', type: 'income' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
