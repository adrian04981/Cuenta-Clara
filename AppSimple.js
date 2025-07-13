import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';

// Datos de ejemplo para demostrar la app
const sampleCategories = [
  { id: '1', name: 'Alimentación', icon: '🍕', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Transporte', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Entretenimiento', icon: '🎬', color: '#45B7D1', type: 'expense' },
  { id: '9', name: 'Salario', icon: '💼', color: '#74B9FF', type: 'income' },
  { id: '10', name: 'Freelance', icon: '💻', color: '#00B894', type: 'income' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'expense',
  });

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleTransactions = [
      {
        id: '1',
        amount: 500,
        description: 'Comida en restaurante',
        categoryId: '1',
        type: 'expense',
        date: new Date(),
      },
      {
        id: '2',
        amount: 5000,
        description: 'Salario',
        categoryId: '9',
        type: 'income',
        date: new Date(Date.now() - 86400000),
      },
      {
        id: '3',
        amount: 200,
        description: 'Uber',
        categoryId: '2',
        type: 'expense',
        date: new Date(Date.now() - 172800000),
      },
    ];

    setTransactions(sampleTransactions);

    const totalIncome = sampleTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = sampleTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setBalance({
      income: totalIncome,
      expense: totalExpense,
      total: totalIncome - totalExpense,
    });
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.categoryId) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      categoryId: newTransaction.categoryId,
      type: newTransaction.type,
      date: new Date(),
    };

    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);

    // Actualizar balance
    const totalIncome = updatedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = updatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setBalance({
      income: totalIncome,
      expense: totalExpense,
      total: totalIncome - totalExpense,
    });

    setNewTransaction({
      amount: '',
      description: '',
      categoryId: '',
      type: 'expense',
    });
    setShowAddForm(false);
  };

  const TransactionItem = ({ transaction }) => {
    const category = sampleCategories.find(c => c.id === transaction.categoryId);
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Text style={styles.iconText}>{category?.icon || '💳'}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>
            {transaction.description || category?.name || 'Sin descripción'}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.date)}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#00B894' : '#FF6B6B' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Cuenta Clara</Text>
        <Text style={styles.subtitle}>Gestión de Finanzas Personales</Text>
        <Text style={styles.demo}>🚀 DEMO - Datos de Ejemplo</Text>
      </View>

      {/* Balance Summary */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={[
            styles.balanceAmount,
            { color: balance.total >= 0 ? '#00B894' : '#FF6B6B' }
          ]}>
            {formatCurrency(balance.total)}
          </Text>
        </View>
        
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Ingresos</Text>
            <Text style={[styles.balanceItemAmount, { color: '#00B894' }]}>
              {formatCurrency(balance.income)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Gastos</Text>
            <Text style={[styles.balanceItemAmount, { color: '#FF6B6B' }]}>
              {formatCurrency(balance.expense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#00B894' }]}
          onPress={() => {
            setNewTransaction({ ...newTransaction, type: 'income' });
            setShowAddForm(true);
          }}
        >
          <Text style={styles.actionButtonText}>+ Ingreso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => {
            setNewTransaction({ ...newTransaction, type: 'expense' });
            setShowAddForm(true);
          }}
        >
          <Text style={styles.actionButtonText}>- Gasto</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Form */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            Agregar {newTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Cantidad"
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Descripción (opcional)"
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
          />
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sampleCategories
                .filter(c => c.type === newTransaction.type)
                .map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: category.color },
                      newTransaction.categoryId === category.id && styles.selectedCategory
                    ]}
                    onPress={() => setNewTransaction({ ...newTransaction, categoryId: category.id })}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
        <ScrollView style={styles.transactionsList}>
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay transacciones aún</Text>
              <Text style={styles.emptyStateSubtext}>
                Agrega tu primera transacción usando los botones de arriba
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌐 Versión Web Demo | 📱 Disponible también en Android e iOS
        </Text>
        <Text style={styles.footerText}>
          🔒 Datos almacenados localmente | 💾 Open Source en GitHub
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
  },
  demo: {
    fontSize: 12,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  balanceContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343a40',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#343a40',
  },
  categoryOption: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedCategory: {
    borderWidth: 3,
    borderColor: '#007bff',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionsContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#343a40',
  },
  transactionsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default App;
