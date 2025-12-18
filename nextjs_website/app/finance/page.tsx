'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTransactions, createTransaction, deleteTransaction, getTransactionTotals, getWallets, type Transaction, type Wallet } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '@/lib/icons'

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [totals, setTotals] = useState({ total_income: 0, total_expenses: 0, balance: 0 })
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    wallet_id: '' as string | number,
    date: new Date().toISOString().split('T')[0]
  })

  // Load transactions from API on mount
  useEffect(() => {
    loadTransactions()
    loadTotals()
    loadWallets()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      alert('Failed to load transactions. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const loadTotals = async () => {
    try {
      const data = await getTransactionTotals()
      setTotals(data)
    } catch (error) {
      console.error('Failed to load totals:', error)
    }
  }

  const loadWallets = async () => {
    try {
      const data = await getWallets()
      setWallets(data)
    } catch (error) {
      console.error('Failed to load wallets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description || !formData.category) {
      alert('Please fill in all fields')
      return
    }

    try {
      const newTransaction = await createTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        wallet_id: formData.wallet_id ? parseInt(formData.wallet_id as string) : null,
        date: new Date(formData.date).toISOString()
      })
      setTransactions([newTransaction, ...transactions])
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        wallet_id: '',
        date: new Date().toISOString().split('T')[0]
      })
      loadWallets() // Refresh wallets to get updated balances
      setShowAddForm(false)
      loadTotals() // Refresh totals
    } catch (error) {
      console.error('Failed to create transaction:', error)
      alert('Failed to create transaction. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id)
        setTransactions(transactions.filter(t => t.id !== id))
        loadTotals() // Refresh totals
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        alert('Failed to delete transaction. Please try again.')
      }
    }
  }

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Salary',
    'Freelance',
    'Investment',
    'Other'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 py-6 border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white text-xl sm:text-2xl font-bold">VL</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-indigo-700 group-hover:to-purple-800 transition-all duration-300">
              Valy Life
            </span>
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Finance Management</h1>
          <p className="text-gray-600">Track your income and expenses, manage your money effectively</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-3xl font-bold text-green-600">${totals.total_income.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={icons.circleDollar} className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">${totals.total_expenses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={icons.arrowDown} className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totals.balance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={icons.chart} className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Transaction Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
          >
            {showAddForm ? '− Cancel' : '+ Add Transaction'}
          </Button>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        formData.type === 'income'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        formData.type === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    label="Amount ($)"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    icon={<FontAwesomeIcon icon={icons.dollar} className="text-gray-400" />}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="text"
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Grocery shopping, Salary, etc."
                  required
                    icon={<FontAwesomeIcon icon={icons.stickyNote} className="text-gray-400" />}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Wallet (Optional)"
                    value={formData.wallet_id}
                    onChange={(e) => setFormData({ ...formData, wallet_id: e.target.value })}
                    options={[
                      { value: '', label: 'No wallet' },
                      ...wallets.map(wallet => ({
                        value: wallet.id.toString(),
                        label: `${wallet.name} (${wallet.type}) - $${wallet.balance.toFixed(2)}`
                      }))
                    ]}
                    icon={<FontAwesomeIcon icon={icons.creditCard} className="text-gray-400" />}
                  />
                </div>
                <div>
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: '', label: 'Select a category' },
                      ...categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                    required
                    icon={<FontAwesomeIcon icon={icons.tag} className="text-gray-400" />}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                    icon={<FontAwesomeIcon icon={icons.calendar} className="text-gray-400" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Add Transaction
              </Button>
            </form>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={icons.stickyNote} className="text-3xl text-gray-600" />
            </div>
              <p className="text-gray-600 text-lg">No transactions yet</p>
              <p className="text-gray-500 text-sm mt-2">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Wallet</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {transaction.wallet_id ? (
                          wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown'
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

