'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAssets, createAsset, deleteAsset, getAssetTotals, type Asset } from '@/lib/api'

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [totals, setTotals] = useState({ total_portfolio_value: 0, by_type: {} as Record<string, { count: number; value: number }> })
  const [formData, setFormData] = useState({
    type: 'Money' as Asset['type'],
    name: '',
    amount: '',
    value: '',
    currency: 'USD',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Load assets from API on mount
  useEffect(() => {
    loadAssets()
    loadTotals()
  }, [])

  const loadAssets = async () => {
    try {
      setLoading(true)
      const data = await getAssets()
      setAssets(data)
    } catch (error) {
      console.error('Failed to load assets:', error)
      alert('Failed to load assets. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const loadTotals = async () => {
    try {
      const data = await getAssetTotals()
      setTotals(data)
    } catch (error) {
      console.error('Failed to load totals:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount || !formData.value) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const newAsset = await createAsset({
        type: formData.type,
        name: formData.name,
        amount: parseFloat(formData.amount),
        value: parseFloat(formData.value),
        currency: formData.currency,
        notes: formData.notes || undefined,
        date: new Date(formData.date).toISOString()
      })
      setAssets([newAsset, ...assets])
      setFormData({
        type: 'Money',
        name: '',
        amount: '',
        value: '',
        currency: 'USD',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
      loadTotals() // Refresh totals
    } catch (error) {
      console.error('Failed to create asset:', error)
      alert('Failed to create asset. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id)
        setAssets(assets.filter(a => a.id !== id))
        loadTotals() // Refresh totals
      } catch (error) {
        console.error('Failed to delete asset:', error)
        alert('Failed to delete asset. Please try again.')
      }
    }
  }

  const assetsByType = {
    Money: assets.filter(a => a.type === 'Money'),
    Bank: assets.filter(a => a.type === 'Bank'),
    Gold: assets.filter(a => a.type === 'Gold'),
    Crypto: assets.filter(a => a.type === 'Crypto'),
    Stock: assets.filter(a => a.type === 'Stock'),
    Loan: assets.filter(a => a.type === 'Loan')
  }

  const getAssetTypeIcon = (type: Asset['type']) => {
    const icons = {
      Money: '💵',
      Bank: '🏦',
      Gold: '🥇',
      Crypto: '₿',
      Stock: '📈',
      Loan: '💳'
    }
    return icons[type]
  }

  const getAssetTypeColor = (type: Asset['type']) => {
    const colors = {
      Money: 'bg-green-100 text-green-700',
      Bank: 'bg-blue-100 text-blue-700',
      Gold: 'bg-yellow-100 text-yellow-700',
      Crypto: 'bg-orange-100 text-orange-700',
      Stock: 'bg-purple-100 text-purple-700',
      Loan: 'bg-red-100 text-red-700'
    }
    return colors[type]
  }

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD']

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Asset Management</h1>
          <p className="text-gray-600">Track and manage all your assets in one place</p>
        </div>

        {/* Total Portfolio Value */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Portfolio Value</p>
              <p className={`text-4xl font-bold text-white ${totals.total_portfolio_value < 0 ? 'text-red-200' : ''}`}>
                {totals.total_portfolio_value >= 0 ? '+' : ''}{totals.total_portfolio_value.toFixed(2)} USD
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">💼</span>
            </div>
          </div>
        </div>

        {/* Asset Type Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {(['Money', 'Bank', 'Gold', 'Crypto', 'Stock', 'Loan'] as Asset['type'][]).map((type) => {
            const typeData = totals.by_type[type] || { count: 0, value: 0 }
            return (
              <div key={type} className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getAssetTypeIcon(type)}</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAssetTypeColor(type)}`}>
                    {typeData.count}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{type}</p>
                <p className={`text-lg font-bold ${type === 'Loan' ? 'text-red-600' : 'text-gray-900'}`}>
                  {typeData.value >= 0 ? '+' : ''}{typeData.value.toFixed(2)}
                </p>
              </div>
            )
          })}
        </div>

        {/* Add Asset Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {showAddForm ? '− Cancel' : '+ Add Asset'}
          </button>
        </div>

        {/* Add Asset Form */}
        {showAddForm && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Asset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="Money">💵 Money</option>
                    <option value="Bank">🏦 Bank</option>
                    <option value="Gold">🥇 Gold</option>
                    <option value="Crypto">₿ Crypto</option>
                    <option value="Stock">📈 Stock</option>
                    <option value="Loan">💳 Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Savings Account, Bitcoin, Apple Stock, etc."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount/Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value ({formData.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes about this asset..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Asset
              </button>
            </form>
          </div>
        )}

        {/* Assets List */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Assets</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <p className="text-gray-600 text-lg">No assets yet</p>
              <p className="text-gray-500 text-sm mt-2">Add your first asset to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 ${getAssetTypeColor(asset.type)} rounded-lg flex items-center justify-center text-xl`}>
                        {getAssetTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAssetTypeColor(asset.type)}`}>
                            {asset.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-2">
                          <div>
                            <span className="text-gray-500">Amount:</span>{' '}
                            <span className="font-medium">{asset.amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Value:</span>{' '}
                            <span className={`font-semibold ${asset.type === 'Loan' ? 'text-red-600' : 'text-green-600'}`}>
                              {asset.type === 'Loan' ? '-' : '+'}{asset.value.toFixed(2)} {asset.currency}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>{' '}
                            <span className="font-medium">
                              {new Date(asset.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {asset.notes && (
                            <div className="col-span-2 md:col-span-1">
                              <span className="text-gray-500">Notes:</span>{' '}
                              <span className="font-medium text-xs">{asset.notes.substring(0, 30)}{asset.notes.length > 30 ? '...' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-4"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

