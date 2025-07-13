import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Servicio de almacenamiento local
class LocalStorageService {
  static getTransactions() {
    const data = localStorage.getItem('cuentaClara_transactions');
    return data ? JSON.parse(data) : [];
  }

  static saveTransactions(transactions) {
    localStorage.setItem('cuentaClara_transactions', JSON.stringify(transactions));
  }

  static getCategories() {
    const data = localStorage.getItem('cuentaClara_categories');
    if (data) return JSON.parse(data);
    
    // Categorías por defecto
    const defaultCategories = {
      expense: [
        'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar',
        'Educación', 'Ropa', 'Servicios', 'Otros Gastos'
      ],
      income: [
        'Salario', 'Freelance', 'Inversiones', 'Ventas', 'Bonos',
        'Otros Ingresos'
      ]
    };
    this.saveCategories(defaultCategories);
    return defaultCategories;
  }

  static saveCategories(categories) {
    localStorage.setItem('cuentaClara_categories', JSON.stringify(categories));
  }

  static getSettings() {
    const data = localStorage.getItem('cuentaClara_settings');
    return data ? JSON.parse(data) : { 
      taxPercentage: 16,
      mode: 'basic' // 'basic' or 'professional'
    };
  }

  static saveSettings(settings) {
    localStorage.setItem('cuentaClara_settings', JSON.stringify(settings));
  }

  static exportData() {
    const data = {
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.transactions) this.saveTransactions(data.transactions);
      if (data.categories) this.saveCategories(data.categories);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Contexto global para las transacciones
const TransactionsContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions debe ser usado dentro de TransactionsProvider');
  }
  return context;
};

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(LocalStorageService.getCategories());
  const [settings, setSettings] = useState(LocalStorageService.getSettings());

  // Cargar transacciones al inicializar
  useEffect(() => {
    const saved = LocalStorageService.getTransactions();
    console.log('📊 Cargando transacciones desde localStorage:', saved);
    setTransactions(saved);
  }, []);

  // Función para agregar transacción
  const addTransaction = (transaction, targetMonth = null) => {
    // Si se especifica un mes objetivo, usar ese mes; si no, usar fecha actual
    let transactionDate;
    if (targetMonth) {
      // Crear fecha para el mes objetivo usando el día actual
      const [year, month] = targetMonth.split('-');
      const now = new Date();
      const currentDay = now.getDate();
      
      // Si el mes objetivo es el mes actual, usar fecha actual completa
      if (targetMonth === format(now, 'yyyy-MM')) {
        transactionDate = now;
      } else {
        // Para otros meses, usar el día actual pero del mes objetivo
        // Si el día actual no existe en ese mes, usar el último día del mes
        const targetDate = new Date(parseInt(year), parseInt(month) - 1, currentDay);
        if (targetDate.getMonth() === parseInt(month) - 1) {
          transactionDate = targetDate;
        } else {
          // El día no existe en el mes objetivo, usar el último día del mes
          transactionDate = new Date(parseInt(year), parseInt(month), 0);
        }
      }
    } else {
      transactionDate = new Date();
    }
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: transactionDate.toISOString()
    };
    
    console.log('💾 Guardando transacción:', {
      targetMonth,
      selectedDate: transactionDate,
      transaction: newTransaction
    });
    
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    LocalStorageService.saveTransactions(updated);
    return newTransaction;
  };

  // Función para eliminar transacción
  const deleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    LocalStorageService.saveTransactions(updated);
  };

  // Función para actualizar categorías
  const updateCategories = (newCategories) => {
    setCategories(newCategories);
    LocalStorageService.saveCategories(newCategories);
  };

  // Función para actualizar configuraciones
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    LocalStorageService.saveSettings(newSettings);
  };

  // Función para recargar todo desde localStorage (útil después de importar)
  const reloadData = () => {
    const savedTransactions = LocalStorageService.getTransactions();
    const savedCategories = LocalStorageService.getCategories();
    const savedSettings = LocalStorageService.getSettings();
    
    console.log('🔄 Recargando datos:');
    console.log('Transacciones:', savedTransactions);
    console.log('Categorías:', savedCategories);
    console.log('Configuraciones:', savedSettings);
    
    setTransactions(savedTransactions);
    setCategories(savedCategories);
    setSettings(savedSettings);
  };

  // Función temporal de debug para cargar transacciones de prueba
  const loadTestTransactions = () => {
    const testData = {
      "transactions": [
        {
          "amount": 142.63,
          "baseAmount": 122.96,
          "taxAmount": 19.67,
          "taxPercentage": 16,
          "description": "123",
          "type": "expense",
          "category": "Alimentación",
          "id": "1752374643619xgx3l8cg3",
          "date": "2025-07-13T02:44:03.619Z"
        },
        {
          "amount": 1427.96,
          "baseAmount": 1231,
          "taxAmount": 196.96,
          "taxPercentage": 16,
          "description": "1234",
          "type": "expense",
          "category": "Alimentación",
          "id": "17523746197262ynnwo5b4",
          "date": "2025-07-13T02:43:39.726Z"
        },
        {
          "amount": 142.68,
          "baseAmount": 123,
          "taxAmount": 19.68,
          "taxPercentage": 16,
          "description": "123",
          "type": "expense",
          "category": "Alimentación",
          "id": "17523746095699m2ctxvd2",
          "date": "2025-07-13T02:43:29.569Z"
        }
      ],
      "categories": {
        "expense": [
          "Alimentación",
          "Transporte",
          "Entretenimiento",
          "Salud",
          "Hogar",
          "Educación",
          "Ropa",
          "Servicios",
          "Otros Gastos"
        ],
        "income": [
          "Salario",
          "Freelance",
          "Inversiones",
          "Ventas",
          "Bonos",
          "Otros Ingresos"
        ]
      },
      "settings": {
        "taxPercentage": 16,
        "mode": "basic"
      }
    };
    
    console.log('🧪 Cargando transacciones de prueba...');
    LocalStorageService.saveTransactions(testData.transactions);
    LocalStorageService.saveCategories(testData.categories);
    LocalStorageService.saveSettings(testData.settings);
    reloadData();
  };

  // Exponer función de debug globalmente
  useEffect(() => {
    window.loadTestTransactions = loadTestTransactions;
    window.reloadData = reloadData;
    window.debugTransactions = () => {
      console.log('🔍 Debug Estado Actual:');
      console.log('Transacciones en contexto:', transactions);
      console.log('Transacciones en localStorage:', LocalStorageService.getTransactions());
    };
  }, [transactions]);

  const value = {
    transactions,
    categories,
    settings,
    addTransaction,
    deleteTransaction,
    updateCategories,
    updateSettings,
    reloadData
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

// Componente Sidebar
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Finanzas Mensual', icon: '📊', description: 'Vista mensual de ingresos y gastos' },
    { path: '/history', label: 'Historial', icon: '📈', description: 'Gráficas y análisis histórico' },
    { path: '/categories', label: 'Categorías', icon: '🏷️', description: 'Gestión de tipos de transacciones' },
    { path: '/settings', label: 'Configuración', icon: '⚙️', description: 'Backup y configuraciones' }
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && window.innerWidth <= 768 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        backgroundColor: '#1e293b',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'left 0.3s ease',
        zIndex: 1000,
        overflowY: 'auto',
        pointerEvents: isOpen ? 'auto' : 'none'
      }}>
        {/* Header del sidebar */}
        <div style={{
          padding: '25px 20px',
          borderBottom: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              color: '#fff',
              fontWeight: 'bold'
            }}>
              💰 Cuenta Clara
            </h1>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ 
            margin: 0, 
            color: '#94a3b8', 
            fontSize: '0.85rem',
            fontWeight: '400'
          }}>
            Gestión de Finanzas Personales
          </p>
        </div>
        
        {/* Navigation items */}
        <nav style={{ padding: '20px 0' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth <= 768 && toggleSidebar()}
                style={{
                  display: 'block',
                  padding: '16px 20px',
                  color: isActive ? '#fff' : '#cbd5e1',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  borderRight: isActive ? '4px solid #60a5fa' : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#334155';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#cbd5e1';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                  <span style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: isActive ? '600' : '500'
                  }}>
                    {item.label}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: isActive ? '#e2e8f0' : '#64748b',
                  marginLeft: '32px',
                  lineHeight: '1.3'
                }}>
                  {item.description}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          borderTop: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.75rem'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>💡 Datos guardados localmente</p>
            <p style={{ margin: 0 }}>v1.0 - Cuenta Clara</p>
          </div>
        </div>
      </aside>
    </>
  );
};

// Componente Header superior
const TopHeader = ({ toggleSidebar }) => {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <button
        onClick={toggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '6px',
          color: '#475569',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f1f5f9';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        ☰
      </button>
      <div style={{
        marginLeft: '15px',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1e293b'
      }}>
        Cuenta Clara
      </div>
    </header>
  );
};

// Componente para formulario básico (sin impuestos)
const BasicAmountInput = ({ amount, setAmount }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #e3f2fd',
      marginBottom: '0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💰 Monto Total
        </h4>
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b',
          backgroundColor: '#f1f5f9',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          Modo Básico
        </div>
      </div>
      
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontSize: '0.85rem', 
          fontWeight: '600',
          color: '#374151'
        }}>
          💵 Monto Total *
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          style={{
            width: '100%',
            padding: '15px 20px',
            border: `3px solid ${!amount ? '#e2e8f0' : parseFloat(amount) <= 0 ? '#f59e0b' : '#10b981'}`,
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            backgroundColor: 'white',
            color: '#1e293b',
            transition: 'border-color 0.2s ease',
            outline: 'none',
            textAlign: 'center'
          }}
          onFocus={(e) => {
            if (!amount || parseFloat(amount) > 0) {
              e.target.style.borderColor = '#3b82f6';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = !amount ? '#e2e8f0' : parseFloat(amount) <= 0 ? '#f59e0b' : '#10b981';
          }}
        />
      </div>

      {/* Helper text */}
      <div style={{
        marginTop: '12px',
        fontSize: '0.8rem',
        color: '#64748b',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        💡 Ingresa el monto total de tu {amount ? 'transacción' : 'ingreso o gasto'}
      </div>
    </div>
  );
};

// Componente para calcular impuestos
const TaxCalculator = ({ baseAmount, setBaseAmount, taxAmount, setTaxAmount, taxPercentage, setTaxPercentage }) => {
  const [lastUpdated, setLastUpdated] = useState('base');

  const handleBaseChange = (value) => {
    setBaseAmount(value);
    const calculated = value * (taxPercentage / 100);
    setTaxAmount(calculated.toFixed(2));
    setLastUpdated('base');
  };

  const handleTaxChange = (value) => {
    setTaxAmount(value);
    const calculated = value / (taxPercentage / 100);
    setBaseAmount(calculated.toFixed(2));
    setLastUpdated('tax');
  };

  const handleTotalChange = (value) => {
    const base = value / (1 + taxPercentage / 100);
    const tax = value - base;
    setBaseAmount(base.toFixed(2));
    setTaxAmount(tax.toFixed(2));
    setLastUpdated('total');
  };

  const totalAmount = parseFloat(baseAmount || 0) + parseFloat(taxAmount || 0);

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #e3f2fd',
      marginBottom: '0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🧮 Calculadora de Impuestos
        </h4>
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b',
          backgroundColor: '#f1f5f9',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          Total: ${totalAmount.toFixed(2)}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            💵 Precio Base *
          </label>
          <input
            type="number"
            step="0.01"
            value={baseAmount}
            onChange={(e) => handleBaseChange(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `2px solid ${!baseAmount ? '#e2e8f0' : parseFloat(baseAmount) <= 0 ? '#f59e0b' : '#10b981'}`,
              borderRadius: '8px',
              fontSize: '15px',
              backgroundColor: 'white',
              color: '#1e293b',
              fontWeight: '500',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              if (!baseAmount || parseFloat(baseAmount) > 0) {
                e.target.style.borderColor = '#3b82f6';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = !baseAmount ? '#e2e8f0' : parseFloat(baseAmount) <= 0 ? '#f59e0b' : '#10b981';
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📊 Impuesto (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              backgroundColor: 'white',
              color: '#1e293b',
              fontWeight: '500',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            🏷️ Valor Impuesto
          </label>
          <input
            type="number"
            step="0.01"
            value={taxAmount}
            onChange={(e) => handleTaxChange(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              backgroundColor: 'white',
              color: '#1e293b',
              fontWeight: '500',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            💰 Total Final
          </label>
          <input
            type="number"
            step="0.01"
            value={totalAmount.toFixed(2)}
            onChange={(e) => handleTotalChange(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '3px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#dbeafe';
              e.target.style.borderColor = '#2563eb';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#eff6ff';
              e.target.style.borderColor = '#3b82f6';
            }}
          />
        </div>
      </div>

      {/* Quick calculation helpers */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[0, 5, 10, 15, 19, 21].map(percent => (
          <button
            key={percent}
            onClick={() => setTaxPercentage(percent.toString())}
            style={{
              padding: '6px 12px',
              border: taxPercentage == percent ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '16px',
              backgroundColor: taxPercentage == percent ? '#eff6ff' : 'white',
              color: taxPercentage == percent ? '#1e40af' : '#6b7280',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (taxPercentage != percent) {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (taxPercentage != percent) {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          >
            {percent}%
          </button>
        ))}
      </div>

      {/* Helper text */}
      <div style={{
        marginTop: '12px',
        fontSize: '0.8rem',
        color: '#64748b',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        💡 Puedes modificar cualquier campo y los demás se calcularán automáticamente
      </div>
    </div>
  );
};

// Página principal - Finanzas Mensual
const MonthlyFinances = () => {
  const { transactions, categories, settings, addTransaction, deleteTransaction } = useTransactions();
  
  // Form states
  const [amount, setAmount] = useState(''); // Para modo básico
  const [baseAmount, setBaseAmount] = useState(''); // Para modo profesional
  const [taxAmount, setTaxAmount] = useState('0');
  const [taxPercentage, setTaxPercentage] = useState(settings.taxPercentage);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    console.log('📅 Mes actual detectado:', currentMonth);
    return currentMonth;
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si está en modo profesional
  const isProfessionalMode = settings.mode === 'professional';

  useEffect(() => {
    if (categories[type] && categories[type].length > 0) {
      setCategory(categories[type][0]);
    }
  }, [type, categories]);

  // Debug: Log transactions when they change
  useEffect(() => {
    console.log('📊 MonthlyFinances - Transacciones recibidas:', transactions.length);
    console.log('📊 MonthlyFinances - Transacciones:', transactions);
  }, [transactions]);

  const handleAddTransaction = () => {
    // Validaciones según el modo
    const isValid = isProfessionalMode 
      ? (baseAmount && parseFloat(baseAmount) > 0 && description && description.length >= 3 && category)
      : (amount && parseFloat(amount) > 0 && description && description.length >= 3 && category);
    
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    
    // Small delay to show visual feedback
    setTimeout(() => {
      let finalAmount, transactionData;
      
      if (isProfessionalMode) {
        // Modo profesional: usar cálculo de impuestos
        finalAmount = parseFloat(baseAmount) + parseFloat(taxAmount);
        transactionData = {
          amount: finalAmount,
          baseAmount: parseFloat(baseAmount),
          taxAmount: parseFloat(taxAmount),
          taxPercentage: parseFloat(taxPercentage),
          description,
          type,
          category
        };
      } else {
        // Modo básico: usar monto directo
        finalAmount = parseFloat(amount);
        transactionData = {
          amount: finalAmount,
          baseAmount: finalAmount, // En modo básico, base = total
          taxAmount: 0, // Sin impuestos en modo básico
          taxPercentage: 0,
          description,
          type,
          category
        };
      }

      const newTransaction = addTransaction(transactionData, selectedMonth);
      
      console.log('✅ Transacción agregada al mes:', selectedMonth, newTransaction);
      
      // Show success message
      setSuccessMessage(`✅ ${type === 'income' ? 'Ingreso' : 'Gasto'} registrado exitosamente: $${finalAmount.toFixed(2)}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Reset form
      if (isProfessionalMode) {
        setBaseAmount('');
        setTaxAmount('0');
      } else {
        setAmount('');
      }
      setDescription('');
      setIsSubmitting(false);
    }, 500);
  };

  // Filter transactions by selected month
  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));
  
  console.log('🔍 DEBUG MonthlyFinances - selectedMonth:', selectedMonth);
  console.log('🔍 DEBUG MonthlyFinances - monthStart:', monthStart);
  console.log('🔍 DEBUG MonthlyFinances - monthEnd:', monthEnd);
  console.log('🔍 DEBUG MonthlyFinances - total transactions:', transactions.length);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const isInRange = isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    console.log(`🔍 DEBUG Transaction ${t.id} (${t.date}): ${isInRange ? 'INCLUIDA' : 'EXCLUIDA'}`);
    return isInRange;
  });
  
  console.log('🔍 DEBUG MonthlyFinances - filtered transactions:', monthlyTransactions.length);

  const monthlyStats = monthlyTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
        acc.incomeTax += t.taxAmount || 0;
      } else {
        acc.expense += t.amount;
        acc.expenseTax += t.taxAmount || 0;
      }
      return acc;
    },
    { income: 0, expense: 0, incomeTax: 0, expenseTax: 0 }
  );

  const balance = monthlyStats.income - monthlyStats.expense;

  return (
    <div style={{ 
      padding: '25px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f8fafc'
    }}>
      {/* Page header */}
      <div style={{
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          📊 Finanzas Mensual
        </h1>
        <p style={{
          margin: 0,
          color: '#64748b',
          fontSize: '1rem'
        }}>
          Gestiona tus ingresos y gastos del mes actual
        </p>
      </div>
      {/* Month selector */}
      <div style={{ 
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📅 Mes a visualizar:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          />
          
          {/* Botón para ir al mes actual */}
          <button
            onClick={() => {
              const currentMonth = format(new Date(), 'yyyy-MM');
              setSelectedMonth(currentMonth);
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🏠 Mes Actual
          </button>
          
          {/* Indicador del mes actual */}
          {selectedMonth === format(new Date(), 'yyyy-MM') ? (
            <span style={{
              padding: '6px 12px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ✅ Mes Actual
            </span>
          ) : (
            <span style={{
              padding: '6px 12px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📅 {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: es })}
            </span>
          )}
        </div>
      </div>

      {/* Monthly summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💚</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', opacity: 0.9 }}>
            Ingresos Totales
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700' }}>
            ${monthlyStats.income.toFixed(2)}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            📋 Impuestos incluidos: ${monthlyStats.incomeTax.toFixed(2)}
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(239, 68, 68, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💸</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', opacity: 0.9 }}>
            Gastos Totales
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700' }}>
            ${monthlyStats.expense.toFixed(2)}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            📋 Impuestos incluidos: ${monthlyStats.expenseTax.toFixed(2)}
          </p>
        </div>
        
        <div style={{
          background: balance >= 0 
            ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: balance >= 0 
            ? '0 4px 6px rgba(59, 130, 246, 0.25)' 
            : '0 4px 6px rgba(245, 158, 11, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            {balance >= 0 ? '⚖️' : '⚠️'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600', opacity: 0.9 }}>
            Balance Final
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700' }}>
            ${Math.abs(balance).toFixed(2)}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            {balance >= 0 ? '📈 Superávit este mes' : '📉 Déficit este mes'}
          </p>
        </div>
      </div>

      {/* Add transaction form */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '25px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Form Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <div>
            <h2 style={{ 
              marginTop: 0, 
              margin: '0 0 5px 0',
              color: '#1e293b', 
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ➕ Nueva Transacción
            </h2>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              Completa todos los campos para registrar tu {type === 'income' ? 'ingreso' : 'gasto'}
            </p>
          </div>
          <div style={{
            padding: '8px 16px',
            backgroundColor: type === 'income' ? '#dcfce7' : '#fee2e2',
            color: type === 'income' ? '#166534' : '#991b1b',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            {type === 'income' ? '💰 Ingreso' : '💸 Gasto'}
          </div>
        </div>

        {/* Step 1: Type and Category */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#374151',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>1</span>
            Tipo y Categoría
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '15px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Tipo de transacción *
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  ':focus': {
                    borderColor: '#3b82f6',
                    outline: 'none'
                  }
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="expense">💸 Gasto</option>
                <option value="income">💰 Ingreso</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Categoría *
              </label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                {categories[type]?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Amount */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#374151',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>2</span>
            {isProfessionalMode ? 'Monto y Cálculo de Impuestos' : 'Monto Total'}
            
            {/* Indicador de modo */}
            <span style={{
              padding: '4px 8px',
              backgroundColor: isProfessionalMode ? '#fef3c7' : '#dcfce7',
              color: isProfessionalMode ? '#92400e' : '#166534',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              {isProfessionalMode ? '🎓 Profesional' : '🔰 Básico'}
            </span>
          </h3>
          
          {isProfessionalMode ? (
            <TaxCalculator
              baseAmount={baseAmount}
              setBaseAmount={setBaseAmount}
              taxAmount={taxAmount}
              setTaxAmount={setTaxAmount}
              taxPercentage={taxPercentage}
              setTaxPercentage={setTaxPercentage}
            />
          ) : (
            <BasicAmountInput
              amount={amount}
              setAmount={setAmount}
            />
          )}
          
          {/* Amount validation feedback */}
          {((isProfessionalMode && baseAmount) || (!isProfessionalMode && amount)) && (
            (() => {
              const currentAmount = isProfessionalMode ? parseFloat(baseAmount) : parseFloat(amount);
              const isValid = currentAmount > 0;
              const totalAmount = isProfessionalMode 
                ? currentAmount + parseFloat(taxAmount || 0)
                : currentAmount;
              
              return isValid ? (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  color: '#166534',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✅ Monto válido: ${totalAmount.toFixed(2)}
                </div>
              ) : (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ⚠️ El monto debe ser mayor a cero
                </div>
              );
            })()
          )}
        </div>

        {/* Step 3: Description */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#374151',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>3</span>
            Descripción
          </h3>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              Descripción de la transacción *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Ej: ${type === 'income' ? 'Salario mensual, Venta de producto' : 'Compra de comida, Pago de servicios'}`}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${!description ? '#e2e8f0' : description.length < 3 ? '#f59e0b' : '#10b981'}`,
                borderRadius: '10px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#1e293b',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!description || description.length >= 3) {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = !description ? '#e2e8f0' : description.length < 3 ? '#f59e0b' : '#10b981';
              }}
            />
            
            {/* Description validation feedback */}
            <div style={{ 
              marginTop: '8px',
              fontSize: '0.8rem',
              color: !description ? '#6b7280' : description.length < 3 ? '#f59e0b' : '#10b981'
            }}>
              {!description 
                ? '💡 Ingresa una descripción clara para identificar fácilmente esta transacción'
                : description.length < 3 
                  ? '⚠️ La descripción debe tener al menos 3 caracteres'
                  : '✅ Descripción válida'
              }
            </div>
          </div>
        </div>

        {/* Submit button with enhanced validation */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px'
        }}>
          <button
            onClick={handleAddTransaction}
            disabled={(() => {
              const hasValidAmount = isProfessionalMode 
                ? (baseAmount && parseFloat(baseAmount) > 0)
                : (amount && parseFloat(amount) > 0);
              return !hasValidAmount || !description || description.length < 3 || isSubmitting;
            })()}
            style={{
              backgroundColor: (() => {
                const hasValidAmount = isProfessionalMode 
                  ? (baseAmount && parseFloat(baseAmount) > 0)
                  : (amount && parseFloat(amount) > 0);
                const isValid = hasValidAmount && description && description.length >= 3 && !isSubmitting;
                return isValid 
                  ? (type === 'income' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)')
                  : '#d1d5db';
              })(),
              background: (() => {
                const hasValidAmount = isProfessionalMode 
                  ? (baseAmount && parseFloat(baseAmount) > 0)
                  : (amount && parseFloat(amount) > 0);
                const isValid = hasValidAmount && description && description.length >= 3 && !isSubmitting;
                return isValid 
                  ? (type === 'income' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)')
                  : '#d1d5db';
              })(),
              color: 'white',
              padding: '16px 32px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: (() => {
                const hasValidAmount = isProfessionalMode 
                  ? (baseAmount && parseFloat(baseAmount) > 0)
                  : (amount && parseFloat(amount) > 0);
                const isValid = hasValidAmount && description && description.length >= 3 && !isSubmitting;
                return isValid ? 'pointer' : 'not-allowed';
              })(),
              width: '100%',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: (() => {
                const hasValidAmount = isProfessionalMode 
                  ? (baseAmount && parseFloat(baseAmount) > 0)
                  : (amount && parseFloat(amount) > 0);
                const isValid = hasValidAmount && description && description.length >= 3 && !isSubmitting;
                return isValid ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none';
              })(),
              transform: isSubmitting ? 'scale(0.98)' : 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = isSubmitting ? 'scale(0.98)' : 'translateY(-2px)';
                e.target.style.boxShadow = type === 'income' 
                  ? '0 6px 20px rgba(16, 185, 129, 0.35)'
                  : '0 6px 20px rgba(59, 130, 246, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = isSubmitting ? 'scale(0.98)' : 'translateY(0)';
              e.target.style.boxShadow = (!baseAmount || parseFloat(baseAmount) <= 0 || !description || description.length < 3 || isSubmitting) 
                ? 'none' 
                : type === 'income' 
                  ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                  : '0 4px 12px rgba(59, 130, 246, 0.25)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>
              {isSubmitting ? '⏳' : type === 'income' ? '💰' : '💸'}
            </span>
            {isSubmitting
              ? 'Guardando transacción...'
              : (() => {
                  const hasValidAmount = isProfessionalMode 
                    ? (baseAmount && parseFloat(baseAmount) > 0)
                    : (amount && parseFloat(amount) > 0);
                  const isValid = hasValidAmount && description && description.length >= 3;
                  
                  if (!isValid) {
                    return 'Completa todos los campos para continuar';
                  }
                  
                  const totalAmount = isProfessionalMode 
                    ? (parseFloat(baseAmount) + parseFloat(taxAmount || 0))
                    : parseFloat(amount);
                  
                  const monthName = format(new Date(selectedMonth + '-01'), 'MMMM', { locale: es });
                  const isCurrentMonth = selectedMonth === format(new Date(), 'yyyy-MM');
                  
                  if (isCurrentMonth) {
                    return `Agregar ${type === 'income' ? 'Ingreso' : 'Gasto'} de $${totalAmount.toFixed(2)}`;
                  } else {
                    return `Agregar ${type === 'income' ? 'Ingreso' : 'Gasto'} de $${totalAmount.toFixed(2)} (${monthName})`;
                  }
                })()
            }
          </button>
          
          {/* Month indicator */}
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: selectedMonth === format(new Date(), 'yyyy-MM') ? '#f0fdf4' : '#fef3c7',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: selectedMonth === format(new Date(), 'yyyy-MM') ? '#166534' : '#92400e',
            fontWeight: '600',
            textAlign: 'center',
            border: `2px solid ${selectedMonth === format(new Date(), 'yyyy-MM') ? '#bbf7d0' : '#fcd34d'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {selectedMonth === format(new Date(), 'yyyy-MM') ? (
              <>
                ✅ Esta transacción se guardará en el mes actual
              </>
            ) : (
              <>
                📅 Esta transacción se guardará en {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: es })}
              </>
            )}
          </div>
          
          {/* Quick tips */}
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#64748b'
          }}>
            💡 <strong>Tip:</strong> Asegúrate de seleccionar la categoría correcta y usar una descripción clara para facilitar el seguimiento de tus finanzas.
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '16px 20px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #bbf7d0',
          borderRadius: '12px',
          color: '#166534',
          fontSize: '1rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎉</span>
          {successMessage}
        </div>
      )}

      {/* Transactions list */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            📋 Transacciones de {format(new Date(selectedMonth), 'MMMM yyyy', { locale: es })}
          </h2>
        </div>
        
        {monthlyTransactions.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>📊</p>
            <p style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>No hay transacciones este mes</p>
            <p>¡Agrega tu primera transacción arriba!</p>
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {monthlyTransactions.map(transaction => (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#4CAF50' : '#f44336'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    {transaction.taxAmount > 0 && (
                      <span style={{
                        fontSize: '0.8rem',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Imp: ${transaction.taxAmount.toFixed(2)} ({transaction.taxPercentage}%)
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666', fontSize: '1rem', marginBottom: '4px' }}>
                    {transaction.description}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.85rem' }}>
                    {transaction.category} • {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Página de Historial
const HistoryPage = () => {
  const { transactions, categories } = useTransactions();
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = format(new Date(currentYear, 0, 1), 'yyyy-MM-dd');
    const endOfYear = format(new Date(currentYear, 11, 31), 'yyyy-MM-dd');
    
    console.log('📅 Rango de fechas por defecto:', { start: startOfYear, end: endOfYear });
    
    return {
      start: startOfYear,
      end: endOfYear
    };
  });
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Debug: Log transactions when they change
  useEffect(() => {
    console.log('📈 HistoryPage - Transacciones recibidas:', transactions.length);
    console.log('📈 HistoryPage - Transacciones:', transactions);
  }, [transactions]);

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const dateMatch = isWithinInterval(transactionDate, { start: startDate, end: endDate });
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
    
    return dateMatch && typeMatch && categoryMatch;
  });

  // Datos para gráficas
  const monthlyData = {};
  filteredTransactions.forEach(transaction => {
    const month = format(new Date(transaction.date), 'yyyy-MM');
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expense: 0 };
    }
    monthlyData[month][transaction.type] += transaction.amount;
  });

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Datos por categoría
  const categoryData = {};
  filteredTransactions.forEach(transaction => {
    if (!categoryData[transaction.category]) {
      categoryData[transaction.category] = { name: transaction.category, value: 0, type: transaction.type };
    }
    categoryData[transaction.category].value += transaction.amount;
  });

  const pieData = Object.values(categoryData);
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // Estadísticas generales
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalTax = filteredTransactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);

  return (
    <div style={{ 
      padding: '25px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f8fafc'
    }}>
      {/* Page header */}
      <div style={{
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          📈 Historial y Análisis
        </h1>
        <p style={{
          margin: 0,
          color: '#64748b',
          fontSize: '1rem'
        }}>
          Visualiza tus patrones financieros con gráficas y estadísticas
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1.2rem', fontWeight: '600' }}>
          🔍 Filtros de Búsqueda
        </h3>
        
        {/* Botones de rango rápido */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem', fontWeight: '600' }}>
            ⚡ Rangos Rápidos:
          </h4>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                setDateRange({
                  start: format(new Date(currentYear, 0, 1), 'yyyy-MM-dd'),
                  end: format(new Date(currentYear, 11, 31), 'yyyy-MM-dd')
                });
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📅 Todo el Año {new Date().getFullYear()}
            </button>
            
            <button
              onClick={() => {
                const now = new Date();
                const startOfCurrentMonth = format(startOfMonth(now), 'yyyy-MM-dd');
                const endOfCurrentMonth = format(endOfMonth(now), 'yyyy-MM-dd');
                setDateRange({
                  start: startOfCurrentMonth,
                  end: endOfCurrentMonth
                });
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📆 Este Mes
            </button>
            
            <button
              onClick={() => {
                const now = new Date();
                const startOfLastMonth = format(startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1)), 'yyyy-MM-dd');
                const endOfLastMonth = format(endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1)), 'yyyy-MM-dd');
                setDateRange({
                  start: startOfLastMonth,
                  end: endOfLastMonth
                });
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📆 Mes Pasado
            </button>
            
            <button
              onClick={() => {
                const now = new Date();
                const last30Days = format(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                setDateRange({
                  start: last30Days,
                  end: format(now, 'yyyy-MM-dd')
                });
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📊 Últimos 30 Días
            </button>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              📅 Fecha Inicio:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              📅 Fecha Fin:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              💰 Tipo:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              🏷️ Categoría:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todas</option>
              {[...categories.income, ...categories.expense].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💚</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', opacity: 0.9 }}>Total Ingresos</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
            ${totalIncome.toFixed(2)}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(239, 68, 68, 0.25)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💸</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', opacity: 0.9 }}>Total Gastos</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
            ${totalExpense.toFixed(2)}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', opacity: 0.9 }}>Total Impuestos</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
            ${totalTax.toFixed(2)}
          </p>
        </div>

        <div style={{
          background: (totalIncome - totalExpense) >= 0 
            ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: (totalIncome - totalExpense) >= 0 
            ? '0 4px 6px rgba(59, 130, 246, 0.25)' 
            : '0 4px 6px rgba(245, 158, 11, 0.25)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
            {(totalIncome - totalExpense) >= 0 ? '⚖️' : '⚠️'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', opacity: 0.9 }}>Balance Total</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
            ${Math.abs(totalIncome - totalExpense).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráficas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {/* Gráfica de líneas mensual */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1.3rem', fontWeight: '600' }}>
            📈 Tendencia Mensual
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No hay datos para mostrar en el rango seleccionado</p>
            </div>
          )}
        </div>

        {/* Gráfica de pie por categorías */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1.3rem', fontWeight: '600' }}>
            🥧 Distribución por Categorías
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No hay datos para mostrar en el rango seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de transacciones filtradas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '25px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, color: '#374151', fontSize: '1.3rem', fontWeight: '600' }}>
            📋 Transacciones Filtradas ({filteredTransactions.length})
          </h2>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            color: '#64748b' 
          }}>
            <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>🔍</p>
            <p style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>No se encontraron transacciones</p>
            <p>Ajusta los filtros para ver más resultados</p>
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredTransactions.map(transaction => (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 25px',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    {transaction.taxAmount > 0 && (
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        Imp: ${transaction.taxAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#374151', fontSize: '1rem', marginBottom: '4px', fontWeight: '500' }}>
                    {transaction.description}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {transaction.category} • {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// Página de Categorías
const CategoriesPage = () => {
  const { categories, updateCategories } = useTransactions();
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [editingCategory, setEditingCategory] = useState(null);

  const addCategory = () => {
    if (!newCategory.name.trim()) return;

    const updated = {
      ...categories,
      [newCategory.type]: [...categories[newCategory.type], newCategory.name.trim()]
    };

    updateCategories(updated);
    setNewCategory({ name: '', type: 'expense' });
  };

  const deleteCategory = (type, categoryName) => {
    const updated = {
      ...categories,
      [type]: categories[type].filter(cat => cat !== categoryName)
    };

    updateCategories(updated);
  };

  const editCategory = (type, oldName, newName) => {
    if (!newName.trim()) return;

    const updated = {
      ...categories,
      [type]: categories[type].map(cat => cat === oldName ? newName.trim() : cat)
    };

    updateCategories(updated);
    setEditingCategory(null);
  };

  const resetToDefault = () => {
    if (confirm('¿Estás seguro de que quieres restaurar las categorías por defecto? Se perderán las categorías personalizadas.')) {
      const defaultCategories = {
        expense: [
          'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar',
          'Educación', 'Ropa', 'Servicios', 'Otros Gastos'
        ],
        income: [
          'Salario', 'Freelance', 'Inversiones', 'Ventas', 'Bonos',
          'Otros Ingresos'
        ]
      };
      updateCategories(defaultCategories);
    }
  };

  return (
    <div style={{ 
      padding: '25px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f8fafc'
    }}>
      {/* Page header */}
      <div style={{
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          🏷️ Gestión de Categorías
        </h1>
        <p style={{
          margin: 0,
          color: '#64748b',
          fontSize: '1rem'
        }}>
          Administra los tipos de ingresos y gastos de tu aplicación
        </p>
      </div>

      {/* Agregar nueva categoría */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1.2rem', fontWeight: '600' }}>
          ➕ Agregar Nueva Categoría
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: '15px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Tipo:
            </label>
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
              style={{
                padding: '10px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="expense">💸 Gasto</option>
              <option value="income">💰 Ingreso</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Nombre de la Categoría:
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Comida rápida, Consultoría, etc."
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
          </div>

          <button
            onClick={addCategory}
            disabled={!newCategory.name.trim()}
            style={{
              backgroundColor: !newCategory.name.trim() ? '#e5e7eb' : '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !newCategory.name.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            ➕ Agregar
          </button>

          <button
            onClick={resetToDefault}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            🔄 Restaurar
          </button>
        </div>
      </div>

      {/* Lista de categorías */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '25px'
      }}>
        {/* Categorías de Gastos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca'
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#991b1b', 
              fontSize: '1.3rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              💸 Categorías de Gastos ({categories.expense.length})
            </h3>
          </div>
          
          <div style={{ padding: '15px' }}>
            {categories.expense.map((category, index) => (
              <div
                key={category}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  margin: '5px 0',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fecaca'
                }}
              >
                {editingCategory?.type === 'expense' && editingCategory?.name === category ? (
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <input
                      type="text"
                      defaultValue={category}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editCategory('expense', category, e.target.value);
                        }
                      }}
                      onBlur={(e) => editCategory('expense', category, e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ 
                    color: '#991b1b', 
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}>
                    {category}
                  </span>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingCategory({ type: 'expense', name: category })}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteCategory('expense', category)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías de Ingresos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0'
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#166534', 
              fontSize: '1.3rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              💰 Categorías de Ingresos ({categories.income.length})
            </h3>
          </div>
          
          <div style={{ padding: '15px' }}>
            {categories.income.map((category, index) => (
              <div
                key={category}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  margin: '5px 0',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}
              >
                {editingCategory?.type === 'income' && editingCategory?.name === category ? (
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <input
                      type="text"
                      defaultValue={category}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editCategory('income', category, e.target.value);
                        }
                      }}
                      onBlur={(e) => editCategory('income', category, e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ 
                    color: '#166534', 
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}>
                    {category}
                  </span>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingCategory({ type: 'income', name: category })}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => deleteCategory('income', category)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '25px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontWeight: '600' }}>
          💡 Información sobre las Categorías
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
          <li>Las categorías son flexibles y no están vinculadas por llaves foráneas</li>
          <li>Puedes editar o eliminar categorías personalizadas en cualquier momento</li>
          <li>Al eliminar una categoría, las transacciones existentes mantienen el nombre original</li>
          <li>Usa "Restaurar" para volver a las categorías predeterminadas</li>
        </ul>
      </div>
    </div>
  );
};
// Página de Configuración
const SettingsPage = () => {
  const { settings, updateSettings: updateContextSettings, reloadData } = useTransactions();
  const [importFile, setImportFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const updateSettings = (newSettings) => {
    updateContextSettings(newSettings);
    showMessage('Configuración guardada exitosamente', 'success');
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const exportData = () => {
    try {
      const data = LocalStorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cuenta-clara-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showMessage('Backup exportado exitosamente', 'success');
    } catch (error) {
      showMessage('Error al exportar backup: ' + error.message, 'error');
    }
  };

  const importData = () => {
    if (!importFile) {
      showMessage('Por favor selecciona un archivo para importar', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = LocalStorageService.importData(e.target.result);
        if (success) {
          showMessage('Datos importados exitosamente.', 'success');
          // Recargar los datos en el contexto
          reloadData();
        } else {
          showMessage('Error al importar los datos. Verifica el formato del archivo.', 'error');
        }
      } catch (error) {
        showMessage('Error al leer el archivo: ' + error.message, 'error');
      }
    };
    reader.readAsText(importFile);
  };

  const clearAllData = () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      if (confirm('🚨 ÚLTIMA CONFIRMACIÓN: Se eliminarán todas las transacciones, categorías personalizadas y configuraciones. ¿Continuar?')) {
        localStorage.clear();
        showMessage('Todos los datos han sido eliminados.', 'success');
        // Recargar los datos en el contexto
        reloadData();
      }
    }
  };

  const getStorageInfo = () => {
    const transactions = LocalStorageService.getTransactions();
    const categories = LocalStorageService.getCategories();
    
    return {
      transactionsCount: transactions.length,
      categoriesCount: categories.income.length + categories.expense.length,
      oldestTransaction: transactions.length > 0 
        ? format(new Date(Math.min(...transactions.map(t => new Date(t.date)))), 'dd/MM/yyyy')
        : 'N/A',
      newestTransaction: transactions.length > 0
        ? format(new Date(Math.max(...transactions.map(t => new Date(t.date)))), 'dd/MM/yyyy')
        : 'N/A'
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div style={{ 
      padding: '25px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f8fafc'
    }}>
      {/* Page header */}
      <div style={{
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          ⚙️ Configuración
        </h1>
        <p style={{
          margin: 0,
          color: '#64748b',
          fontSize: '1rem'
        }}>
          Administra las configuraciones y respaldos de tu aplicación
        </p>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div style={{
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b'
        }}>
          <strong>{message.type === 'success' ? '✅' : '❌'}</strong> {message.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '25px'
      }}>
        {/* Configuraciones Generales */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#374151', 
            fontSize: '1.3rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎛️ Configuraciones Generales
          </h3>
          
          {/* Switch de Modo */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '1rem'
            }}>
              🎯 Modo de Operación:
            </label>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div
                onClick={() => updateSettings({ ...settings, mode: 'basic' })}
                style={{
                  flex: 1,
                  padding: '20px',
                  border: `3px solid ${settings.mode === 'basic' ? '#10b981' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  backgroundColor: settings.mode === 'basic' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (settings.mode !== 'basic') {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (settings.mode !== 'basic') {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '8px'
                }}>
                  🔰
                </div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: settings.mode === 'basic' ? '#059669' : '#374151',
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  Modo Básico
                </h4>
                <p style={{
                  margin: 0,
                  color: settings.mode === 'basic' ? '#047857' : '#6b7280',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  Solo ingresa el monto total. <br/>
                  <strong>Ideal para uso personal simple</strong>
                </p>
                {settings.mode === 'basic' && (
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    ✅ ACTIVO
                  </div>
                )}
              </div>
              
              <div
                onClick={() => updateSettings({ ...settings, mode: 'professional' })}
                style={{
                  flex: 1,
                  padding: '20px',
                  border: `3px solid ${settings.mode === 'professional' ? '#f59e0b' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  backgroundColor: settings.mode === 'professional' ? '#fffbeb' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (settings.mode !== 'professional') {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (settings.mode !== 'professional') {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '8px'
                }}>
                  🎓
                </div>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: settings.mode === 'professional' ? '#d97706' : '#374151',
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  Modo Profesional
                </h4>
                <p style={{
                  margin: 0,
                  color: settings.mode === 'professional' ? '#b45309' : '#6b7280',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  Cálculo detallado con impuestos. <br/>
                  <strong>Para contabilidad empresarial</strong>
                </p>
                {settings.mode === 'professional' && (
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    ✅ ACTIVO
                  </div>
                )}
              </div>
            </div>
            
            {/* Explicación del modo actual */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: settings.mode === 'basic' ? '#dcfce7' : '#fef3c7',
              border: `1px solid ${settings.mode === 'basic' ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: settings.mode === 'basic' ? '#166534' : '#92400e'
            }}>
              <strong>
                {settings.mode === 'basic' ? '🔰 Modo Básico Activo:' : '🎓 Modo Profesional Activo:'}
              </strong>
              {' '}
              {settings.mode === 'basic' 
                ? 'El formulario de transacciones mostrará solo un campo de monto total, sin cálculos de impuestos.'
                : 'El formulario incluirá la calculadora de impuestos con campos separados para base, impuesto y total.'
              }
            </div>
          </div>
          
          {/* Configuración de impuestos (solo en modo profesional) */}
          {settings.mode === 'professional' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                📊 Porcentaje de Impuesto por Defecto:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxPercentage}
                  onChange={(e) => updateSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '120px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                <span style={{ color: '#64748b', fontSize: '14px' }}>%</span>
                <span style={{ 
                  color: '#10b981', 
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  ✅ Se guarda automáticamente
                </span>
              </div>
            </div>
          )}
          
        </div>

        {/* Información del Sistema */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#374151', 
            fontSize: '1.3rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📈 Información del Sistema
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Total de Transacciones:</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>{storageInfo.transactionsCount}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Total de Categorías:</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>{storageInfo.categoriesCount}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Primera Transacción:</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>{storageInfo.oldestTransaction}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Última Transacción:</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>{storageInfo.newestTransaction}</span>
            </div>
          </div>
        </div>

        {/* Backup y Restauración */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#374151', 
            fontSize: '1.3rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💾 Backup y Restauración
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#4b5563', fontSize: '1rem' }}>
              📤 Exportar Datos
            </h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>
              Descarga un archivo JSON con todas tus transacciones, categorías y configuraciones
            </p>
            <button
              onClick={exportData}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              📥 Descargar Backup
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#4b5563', fontSize: '1rem' }}>
              📥 Importar Datos
            </h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>
              Sube un archivo de backup para restaurar tus datos
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files[0])}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={importData}
              disabled={!importFile}
              style={{
                backgroundColor: !importFile ? '#e5e7eb' : '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !importFile ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              📤 Importar Backup
            </button>
          </div>
        </div>

        {/* Zona Peligrosa */}
        <div style={{
          backgroundColor: '#fef2f2',
          padding: '25px',
          borderRadius: '12px',
          border: '2px solid #fecaca'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#991b1b', 
            fontSize: '1.3rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚠️ Zona Peligrosa
          </h3>
          
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#7f1d1d', fontSize: '1rem' }}>
              🗑️ Eliminar Todos los Datos
            </h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#7f1d1d' }}>
              Esta acción eliminará permanentemente todas las transacciones, categorías personalizadas y configuraciones. <strong>No se puede deshacer.</strong>
            </p>
            <button
              onClick={clearAllData}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🚨 Eliminar Todos los Datos
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '25px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1e40af', fontWeight: '600' }}>
          💡 Información sobre Backups
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          <div>
            <h5 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>📤 Exportar:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '0.9rem' }}>
              <li>Crea un archivo JSON con todos tus datos</li>
              <li>Incluye transacciones, categorías y configuraciones</li>
              <li>Compatible con cualquier dispositivo</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>📥 Importar:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '0.9rem' }}>
              <li>Restaura datos desde un archivo de backup</li>
              <li>Sobrescribe los datos actuales</li>
              <li>Recarga la página después de importar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// App principal
const CuentaClaraApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Cerrar sidebar al cambiar el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Asegurar que el scroll funcione correctamente
  useEffect(() => {
    // Resetear estilos que puedan interferir con el scroll
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    return () => {
      // Cleanup si es necesario
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  return (
    <TransactionsProvider>
      <Router>
        <div style={{ 
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'auto',
          position: 'relative'
        }}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <TopHeader toggleSidebar={toggleSidebar} />
          
          {/* Main content */}
          <main style={{
            marginLeft: 0,
            marginTop: '60px',
            minHeight: 'calc(100vh - 60px)',
            paddingBottom: '20px',
            overflow: 'auto',
            position: 'relative'
          }}>
            <Routes>
              <Route path="/" element={<MonthlyFinances />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TransactionsProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<CuentaClaraApp />);
} else {
  console.error('No se encontró el elemento root');
}
