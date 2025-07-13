import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const CuentaClaraWeb = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Alimentación');

  const categories = {
    expense: ['Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Otros Ingresos']
  };

  const addTransaction = () => {
    if (!amount || !description) return;

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description,
      type,
      date: new Date(),
      category
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2196F3',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>💰 Cuenta Clara</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Gestión de Finanzas Personales
        </p>
      </div>

      {/* Resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Ingresos</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Gastos</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${totalExpense.toFixed(2)}
          </p>
        </div>
        <div style={{
          backgroundColor: balance >= 0 ? '#2196F3' : '#FF9800',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Balance</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Agregar Transacción</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tipo:
          </label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Categoría:
          </label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            {categories[type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Monto:
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Descripción:
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la transacción"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          onClick={addTransaction}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Agregar Transacción
        </button>
      </div>

      {/* Lista de transacciones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, padding: '20px 20px 10px 20px', color: '#333' }}>
          Transacciones Recientes
        </h2>
        
        {transactions.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            <p>No hay transacciones aún.</p>
            <p>¡Agrega tu primera transacción arriba!</p>
          </div>
        ) : (
          <div style={{ padding: '0 20px 20px 20px' }}>
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  ':last-child': { borderBottom: 'none' }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: transaction.type === 'income' ? '#4CAF50' : '#f44336',
                    marginBottom: '5px'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {transaction.description}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>
                    {transaction.category} • {transaction.date.toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>💡 Los datos se guardan localmente en tu navegador</p>
        <p>Cuenta Clara - Gestión de Finanzas Personales</p>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<CuentaClaraWeb />);
} else {
  console.error('No se encontró el elemento root');
}
