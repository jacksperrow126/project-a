'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getWallets, createWallet, deleteWallet, getWalletTotals, type Wallet } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '@/lib/icons'

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [totals, setTotals] = useState({ total_balance: 0, total_credit: 0, net_balance: 0 })
  const [formData, setFormData] = useState({
    name: '',
    type: 'Cash' as Wallet['type'],
    detail: ''
  })

  const walletTypes: Wallet['type'][] = ['Cash', 'Bank', 'Stock', 'Savings', 'Assets', 'Credit']

  useEffect(() => {
    loadWallets()
    loadTotals()
  }, [])

  const loadWallets = async () => {
    try {
      setLoading(true)
      const data = await getWallets()
      setWallets(data)
    } catch (error) {
      console.error('Failed to load wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTotals = async () => {
    try {
      const data = await getWalletTotals()
      setTotals(data)
    } catch (error) {
      console.error('Failed to load totals:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please enter a wallet name')
      return
    }

    try {
      await createWallet(formData)
      setFormData({ name: '', type: 'Cash', detail: '' })
      setShowAddForm(false)
      loadWallets()
      loadTotals()
    } catch (error) {
      console.error('Failed to create wallet:', error)
      alert('Failed to create wallet. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      try {
        await deleteWallet(id)
        loadWallets()
        loadTotals()
      } catch (error) {
        console.error('Failed to delete wallet:', error)
        alert('Failed to delete wallet. Please try again.')
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getWalletBalance = (wallet: Wallet) => {
    if (wallet.type === 'Stock' && wallet.gross_balance !== null) {
      return wallet.gross_balance
    }
    if (wallet.type === 'Credit' && wallet.loan !== null) {
      return wallet.loan
    }
    return wallet.balance
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Wallets</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your wallets and track balances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
            <p className="text-green-100 text-xs sm:text-sm mb-1">Total Balance</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totals.total_balance)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
            <p className="text-red-100 text-xs sm:text-sm mb-1">Total Credit</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totals.total_credit)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
            <p className="text-white/80 text-xs sm:text-sm mb-1">Net Balance</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totals.net_balance)}</p>
          </div>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
            size="md"
          >
            {showAddForm ? '− Cancel' : '+ Add Wallet'}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Add New Wallet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Wallet Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Bank Account"
                required
                icon={<span>💳</span>}
              />
              <Select
                label="Wallet Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Wallet['type'] })}
                options={walletTypes.map(type => ({ value: type, label: type }))}
                required
                icon={<FontAwesomeIcon icon={icons.bank} className="text-gray-400" />}
              />
              <Input
                type="text"
                label="Details (Optional)"
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="Additional information"
                icon={<FontAwesomeIcon icon={icons.stickyNote} className="text-gray-400" />}
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Create Wallet
              </Button>
            </form>
          </div>
        )}

        {/* Wallets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading wallets...</p>
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={icons.briefcase} className="text-3xl text-gray-600" />
            </div>
            <p className="text-gray-600 text-lg">No wallets yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first wallet to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{wallet.name}</h3>
                    <p className="text-sm text-gray-600">{wallet.type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <div className="space-y-2">
                  {wallet.type === 'Stock' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cash:</span>
                        <span className="font-semibold">{formatCurrency(wallet.cash || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold">{formatCurrency(wallet.investment_value || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-blue-600">
                        <span>Gross Balance:</span>
                        <span>{formatCurrency(wallet.gross_balance || 0)}</span>
                      </div>
                    </>
                  )}
                  {wallet.type === 'Credit' && (
                    <div className="flex justify-between text-sm font-bold text-red-600">
                      <span>Loan:</span>
                      <span>{formatCurrency(wallet.loan || 0)}</span>
                    </div>
                  )}
                  {wallet.type !== 'Stock' && wallet.type !== 'Credit' && (
                    <div className="flex justify-between text-sm font-bold text-gray-900">
                      <span>Balance:</span>
                      <span>{formatCurrency(wallet.balance)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

