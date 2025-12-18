'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStocks, createStock, deleteStock, getWallets, type Stock, type Wallet } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '@/lib/icons'

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<number | ''>('')
  const [formData, setFormData] = useState({
    wallet_id: 0,
    code: '',
    volume: '',
    start_price: '',
    start_date: new Date().toISOString().split('T')[0],
    margin: ''
  })

  useEffect(() => {
    loadStocks()
    loadWallets()
  }, [selectedWallet])

  const loadStocks = async () => {
    try {
      setLoading(true)
      const walletId = selectedWallet ? parseInt(selectedWallet as string) : undefined
      const data = await getStocks(walletId)
      setStocks(data)
    } catch (error) {
      console.error('Failed to load stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWallets = async () => {
    try {
      const data = await getWallets()
      const stockWallets = data.filter(w => w.type === 'Stock')
      setWallets(stockWallets)
      if (stockWallets.length > 0 && !formData.wallet_id) {
        setFormData({ ...formData, wallet_id: stockWallets[0].id })
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.volume || !formData.start_price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await createStock({
        wallet_id: formData.wallet_id,
        code: formData.code,
        volume: parseFloat(formData.volume),
        start_price: parseFloat(formData.start_price),
        start_date: new Date(formData.start_date).toISOString(),
        margin: formData.margin ? parseFloat(formData.margin) : null
      })
      setFormData({
        wallet_id: wallets.length > 0 ? wallets[0].id : 0,
        code: '',
        volume: '',
        start_price: '',
        start_date: new Date().toISOString().split('T')[0],
        margin: ''
      })
      setShowAddForm(false)
      loadStocks()
      loadWallets() // Refresh to get updated balances
    } catch (error: any) {
      console.error('Failed to create stock:', error)
      alert(error.message || 'Failed to create stock. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to sell this stock?')) {
      try {
        await deleteStock(id)
        loadStocks()
        loadWallets()
      } catch (error) {
        console.error('Failed to delete stock:', error)
        alert('Failed to delete stock. Please try again.')
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const holdingStocks = stocks.filter(s => s.is_holding)
  const totalValue = holdingStocks.reduce((sum, s) => sum + (s.volume * s.start_price), 0)

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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Stock Portfolio</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your stock investments</p>
        </div>

        {/* Summary */}
        {holdingStocks.length > 0 && (
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg text-white">
            <p className="text-white/80 text-xs sm:text-sm mb-1">Total Portfolio Value</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-white/80 text-xs sm:text-sm mt-2">{holdingStocks.length} holding stock(s)</p>
          </div>
        )}

        {/* Filter by Wallet */}
        {wallets.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Wallet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value ? parseInt(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Wallets</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} - Cash: {formatCurrency(wallet.cash || 0)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
            size="md"
          >
            {showAddForm ? '− Cancel' : '+ Add Stock'}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Add New Stock</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Stock Wallet"
                value={formData.wallet_id.toString()}
                onChange={(e) => setFormData({ ...formData, wallet_id: parseInt(e.target.value) })}
                options={wallets.map(wallet => ({
                  value: wallet.id.toString(),
                  label: `${wallet.name} - Available: ${formatCurrency(wallet.cash || 0)}`
                }))}
                required
                icon={<FontAwesomeIcon icon={icons.creditCard} className="text-gray-400" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Stock Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL"
                  required
                  icon={<FontAwesomeIcon icon={icons.stockChart} className="text-gray-400" />}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  label="Volume (Shares)"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="0"
                  required
                  icon={<FontAwesomeIcon icon={icons.chartBar} className="text-gray-400" />}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  label="Purchase Price"
                  value={formData.start_price}
                  onChange={(e) => setFormData({ ...formData, start_price: e.target.value })}
                  placeholder="0.00"
                  required
                  icon={<FontAwesomeIcon icon={icons.dollar} className="text-gray-400" />}
                />
                <Input
                  type="date"
                  label="Purchase Date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  icon={<FontAwesomeIcon icon={icons.calendar} className="text-gray-400" />}
                />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                label="Margin (Optional)"
                value={formData.margin}
                onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                placeholder="0.00"
                icon={<FontAwesomeIcon icon={icons.money} className="text-gray-400" />}
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Add Stock
              </Button>
            </form>
          </div>
        )}

        {/* Stocks List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading stocks...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={icons.stockChart} className="text-3xl text-gray-600" />
            </div>
            <p className="text-gray-600 text-lg">No stocks yet</p>
            <p className="text-gray-500 text-sm mt-2">Add your first stock to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className={`bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${
                  !stock.is_holding ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{stock.code}</h3>
                    <p className="text-sm text-gray-600">
                      {stock.is_holding ? 'Holding' : 'Sold'}
                    </p>
                  </div>
                  {stock.is_holding && (
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Sell
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-semibold">{stock.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Price:</span>
                    <span className="font-semibold">{formatCurrency(stock.start_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-semibold">{formatDate(stock.start_date)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-600">
                    <span>Total Value:</span>
                    <span>{formatCurrency(stock.volume * stock.start_price)}</span>
                  </div>
                  {stock.margin && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Margin:</span>
                      <span>{formatCurrency(stock.margin)}</span>
                    </div>
                  )}
                  {stock.sell_price && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Sell Price:</span>
                        <span className="font-semibold">{formatCurrency(stock.sell_price)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Sell Date:</span>
                        <span className="font-semibold">{formatDate(stock.sell_date!)}</span>
                      </div>
                    </>
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

