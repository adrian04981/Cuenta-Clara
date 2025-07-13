import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';
import { Transaction, Category, Budget } from '../types';

// Configuración de SQLite
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'CuentaClara.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAYNAME = 'Cuenta Clara Database';
const DATABASE_SIZE = 200000;

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        version: DATABASE_VERSION,
        displayName: DATABASE_DISPLAYNAME,
        size: DATABASE_SIZE,
      });

      await this.createTables();
      await this.insertDefaultCategories();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    // Tabla de categorías
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de transacciones
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Tabla de presupuestos
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Tabla de configuración de la app
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tablas creadas correctamente');
  }

  private async insertDefaultCategories(): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    // Verificar si ya existen categorías por defecto
    const result = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM categories WHERE is_default = 1'
    );
    
    if (result[0].rows.item(0).count > 0) {
      console.log('Categorías por defecto ya existen');
      return;
    }

    const defaultCategories = [
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

    for (const category of defaultCategories) {
      await this.db.executeSql(
        'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, 1)',
        [category.id, category.name, category.icon, category.color, category.type]
      );
    }

    console.log('Categorías por defecto insertadas');
  }

  // CRUD de Transacciones
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    await this.db.executeSql(
      'INSERT INTO transactions (id, amount, description, category_id, type, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, transaction.amount, transaction.description, transaction.categoryId, transaction.type, transaction.date.toISOString()]
    );

    return id;
  }

  async getTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const result = await this.db.executeSql(query);
    const transactions: Transaction[] = [];

    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      transactions.push({
        id: row.id,
        amount: row.amount,
        description: row.description,
        categoryId: row.category_id,
        type: row.type as 'income' | 'expense',
        date: new Date(row.date),
        category: {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon,
          color: row.category_color,
          type: row.type as 'income' | 'expense',
        },
      });
    }

    return transactions;
  }

  async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id'>>): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const fields: string[] = [];
    const values: any[] = [];

    if (transaction.amount !== undefined) {
      fields.push('amount = ?');
      values.push(transaction.amount);
    }
    if (transaction.description !== undefined) {
      fields.push('description = ?');
      values.push(transaction.description);
    }
    if (transaction.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(transaction.categoryId);
    }
    if (transaction.type !== undefined) {
      fields.push('type = ?');
      values.push(transaction.type);
    }
    if (transaction.date !== undefined) {
      fields.push('date = ?');
      values.push(transaction.date.toISOString());
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.executeSql(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) throw new Error('Base de datos no inicializada');
    await this.db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
  }

  // CRUD de Categorías
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const result = await this.db.executeSql(
      'SELECT * FROM categories ORDER BY is_default DESC, name ASC'
    );
    
    const categories: Category[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      categories.push({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        type: row.type as 'income' | 'expense',
      });
    }

    return categories;
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    await this.db.executeSql(
      'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, 0)',
      [id, category.name, category.icon, category.color, category.type]
    );

    return id;
  }

  // Estadísticas y reportes
  async getMonthlyStats(year: number, month: number): Promise<{ income: number; expense: number }> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await this.db.executeSql(
      `SELECT 
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE date >= ? AND date <= ?
      GROUP BY type`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    let income = 0;
    let expense = 0;

    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      if (row.type === 'income') {
        income = row.total;
      } else if (row.type === 'expense') {
        expense = row.total;
      }
    }

    return { income, expense };
  }

  // Backup y exportación
  async exportData(): Promise<string> {
    if (!this.db) throw new Error('Base de datos no inicializada');

    const transactions = await this.getTransactions();
    const categories = await this.getCategories();

    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      categories: categories.filter(cat => !this.isDefaultCategory(cat.id)),
    };

    return JSON.stringify(data, null, 2);
  }

  private isDefaultCategory(id: string): boolean {
    const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return defaultIds.includes(id);
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
