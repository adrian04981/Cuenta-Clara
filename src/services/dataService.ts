import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget } from '../types';

// Servicio de datos que funciona tanto en móvil como en web
export class DataService {
  private readonly STORAGE_KEYS = {
    TRANSACTIONS: 'cuenta_clara_transactions',
    CATEGORIES: 'cuenta_clara_categories',
    BUDGETS: 'cuenta_clara_budgets',
    SETTINGS: 'cuenta_clara_settings',
  };

  // Inicializar el servicio
  async init(): Promise<void> {
    try {
      // Verificar si ya existen categorías por defecto
      const existingCategories = await this.getCategories();
      if (existingCategories.length === 0) {
        await this.initializeDefaultCategories();
      }
      console.log('DataService inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar DataService:', error);
      throw error;
    }
  }

  // Inicializar categorías por defecto
  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategories: Category[] = [
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

    await AsyncStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  // CRUD de Transacciones
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const id = this.generateId();
      const newTransaction: Transaction = { ...transaction, id };
      
      const transactions = await this.getTransactions();
      transactions.unshift(newTransaction); // Agregar al inicio para orden cronológico
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return id;
    } catch (error) {
      console.error('Error al agregar transacción:', error);
      throw error;
    }
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
      const transactions: Transaction[] = data ? JSON.parse(data) : [];
      
      // Convertir strings de fecha a objetos Date
      const parsedTransactions = transactions.map(t => ({
        ...t,
        date: new Date(t.date),
      }));

      // Ordenar por fecha (más recientes primero)
      parsedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Agregar información de categoría
      const categories = await this.getCategories();
      const enrichedTransactions = parsedTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return { ...transaction, category };
      });

      return limit ? enrichedTransactions.slice(0, limit) : enrichedTransactions;
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return [];
    }
  }

  async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transacción no encontrada');
      }

      transactions[index] = { ...transactions[index], ...updates };
      await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  }

  // CRUD de Categorías
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    try {
      const id = this.generateId();
      const newCategory: Category = { ...category, id };
      
      const categories = await this.getCategories();
      categories.push(newCategory);
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return id;
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      // Verificar que no sea una categoría por defecto
      const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      if (defaultIds.includes(id)) {
        throw new Error('No se puede eliminar una categoría por defecto');
      }

      const categories = await this.getCategories();
      const filteredCategories = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }

  // CRUD de Presupuestos
  async getBudgets(): Promise<Budget[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.BUDGETS);
      const budgets: Budget[] = data ? JSON.parse(data) : [];
      
      // Convertir strings de fecha a objetos Date
      return budgets.map(b => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      }));
    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      return [];
    }
  }

  async addBudget(budget: Omit<Budget, 'id'>): Promise<string> {
    try {
      const id = this.generateId();
      const newBudget: Budget = { ...budget, id };
      
      const budgets = await this.getBudgets();
      budgets.push(newBudget);
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      return id;
    } catch (error) {
      console.error('Error al agregar presupuesto:', error);
      throw error;
    }
  }

  // Estadísticas y reportes
  async getMonthlyStats(year: number, month: number): Promise<{ income: number; expense: number; balance: number }> {
    try {
      const transactions = await this.getTransactions();
      
      const monthTransactions = transactions.filter(t => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1;
        return transactionYear === year && transactionMonth === month;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expense,
        balance: income - expense,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas mensuales:', error);
      return { income: 0, expense: 0, balance: 0 };
    }
  }

  async getCategoryStats(type: 'income' | 'expense', year: number, month: number): Promise<Array<{ categoryId: string; categoryName: string; amount: number; percentage: number }>> {
    try {
      const transactions = await this.getTransactions();
      const categories = await this.getCategories();
      
      const monthTransactions = transactions.filter(t => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1;
        return transactionYear === year && transactionMonth === month && t.type === type;
      });

      const categoryTotals = new Map<string, number>();
      let totalAmount = 0;

      monthTransactions.forEach(t => {
        const current = categoryTotals.get(t.categoryId) || 0;
        categoryTotals.set(t.categoryId, current + t.amount);
        totalAmount += t.amount;
      });

      const stats = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Categoría desconocida',
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        };
      });

      return stats.sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      return [];
    }
  }

  // Exportar datos
  async exportData(): Promise<string> {
    try {
      const transactions = await this.getTransactions();
      const categories = await this.getCategories();
      const budgets = await this.getBudgets();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        platform: Platform.OS,
        data: {
          transactions,
          categories: categories.filter(c => !this.isDefaultCategory(c.id)),
          budgets,
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      throw error;
    }
  }

  // Importar datos
  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.version || !importData.data) {
        throw new Error('Formato de datos inválido');
      }

      const { transactions, categories, budgets } = importData.data;

      // Importar categorías (solo las no predeterminadas)
      if (categories && Array.isArray(categories)) {
        const existingCategories = await this.getCategories();
        const customCategories = categories.filter((c: Category) => !this.isDefaultCategory(c.id));
        const mergedCategories = [...existingCategories, ...customCategories];
        await AsyncStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(mergedCategories));
      }

      // Importar transacciones
      if (transactions && Array.isArray(transactions)) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }

      // Importar presupuestos
      if (budgets && Array.isArray(budgets)) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      }

      console.log('Datos importados correctamente');
    } catch (error) {
      console.error('Error al importar datos:', error);
      throw error;
    }
  }

  // Limpiar todos los datos
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.TRANSACTIONS,
        this.STORAGE_KEYS.CATEGORIES,
        this.STORAGE_KEYS.BUDGETS,
      ]);
      
      // Reinicializar categorías por defecto
      await this.initializeDefaultCategories();
      console.log('Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      throw error;
    }
  }

  // Utilidades privadas
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private isDefaultCategory(id: string): boolean {
    const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return defaultIds.includes(id);
  }
}

// Singleton del servicio de datos
export const dataService = new DataService();
