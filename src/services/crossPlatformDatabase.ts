import { Platform } from 'react-native';

// Tipos para la abstracción de base de datos
export interface DatabaseAdapter {
  initDatabase(): Promise<void>;
  executeSql(query: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

// Implementación para React Native (móvil)
class SQLiteAdapter implements DatabaseAdapter {
  private db: any = null;

  async initDatabase(): Promise<void> {
    const SQLite = require('react-native-sqlite-storage');
    SQLite.DEBUG(true);
    SQLite.enablePromise(true);

    this.db = await SQLite.openDatabase({
      name: 'CuentaClara.db',
      version: '1.0',
      displayName: 'Cuenta Clara Database',
      size: 200000,
    });
  }

  async executeSql(query: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Base de datos no inicializada');
    return await this.db.executeSql(query, params);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Implementación para Web (usando localStorage como fallback)
class WebStorageAdapter implements DatabaseAdapter {
  private dbName = 'CuentaClara_WebDB';

  async initDatabase(): Promise<void> {
    // En web, inicializamos el almacenamiento si no existe
    if (!localStorage.getItem(this.dbName)) {
      localStorage.setItem(this.dbName, JSON.stringify({
        categories: [],
        transactions: [],
        budgets: [],
        settings: {}
      }));
    }
  }

  async executeSql(query: string, params: any[] = []): Promise<any> {
    // Simulamos SQLite con localStorage
    // Esta es una implementación simplificada
    const data = JSON.parse(localStorage.getItem(this.dbName) || '{}');
    
    // Aquí implementarías la lógica de parsing de SQL
    // Para simplificar, retornamos una estructura compatible
    return [{
      rows: {
        length: 0,
        item: (index: number) => ({}),
      }
    }];
  }

  async close(): Promise<void> {
    // En web no necesitamos cerrar conexión
    return Promise.resolve();
  }
}

// Factory para crear el adaptador correcto según la plataforma
export function createDatabaseAdapter(): DatabaseAdapter {
  if (Platform.OS === 'web') {
    return new WebStorageAdapter();
  } else {
    return new SQLiteAdapter();
  }
}

// Servicio de base de datos simplificado para compatibilidad web
export class CrossPlatformDatabaseService {
  private adapter: DatabaseAdapter;

  constructor() {
    this.adapter = createDatabaseAdapter();
  }

  async init(): Promise<void> {
    await this.adapter.initDatabase();
    
    if (Platform.OS !== 'web') {
      // Solo en móvil usamos SQLite real
      await this.createSQLiteTables();
    } else {
      // En web usamos una estructura de datos en localStorage
      await this.initWebStorage();
    }
  }

  private async createSQLiteTables(): Promise<void> {
    // Tablas SQLite para móvil
    await this.adapter.executeSql(`
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

    await this.adapter.executeSql(`
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

    await this.adapter.executeSql(`
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
  }

  private async initWebStorage(): Promise<void> {
    const dbName = 'CuentaClara_WebDB';
    const existingData = localStorage.getItem(dbName);
    
    if (!existingData) {
      const initialData = {
        categories: this.getDefaultCategories(),
        transactions: [],
        budgets: [],
        settings: {
          currency: 'MXN',
          theme: 'light'
        }
      };
      localStorage.setItem(dbName, JSON.stringify(initialData));
    }
  }

  private getDefaultCategories() {
    return [
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
  }

  async close(): Promise<void> {
    await this.adapter.close();
  }
}

export const crossPlatformDB = new CrossPlatformDatabaseService();
