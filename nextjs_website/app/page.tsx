'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTransactions, getTransactionTotals, getAllMarketData, type Transaction, type AllMarketData } from '@/lib/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faDollarSign, 
  faChartLine, 
  faWallet, 
  faStickyNote, 
  faChartBar, 
  faBriefcase,
  faCoins,
  faGem,
  faArrowTrendUp,
  faArrowTrendDown,
  faFileInvoiceDollar,
  faCreditCard,
  faNoteSticky,
  faChartLine as faStockChart,
  faSackDollar,
  faCircleDollarToSlot,
  faMinus,
  faPlus
} from '@fortawesome/free-solid-svg-icons'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totals, setTotals] = useState({ total_income: 0, total_expenses: 0, balance: 0 })
  const [marketData, setMarketData] = useState<AllMarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [transData, totalsData, marketDataResult] = await Promise.all([
        getTransactions(),
        getTransactionTotals(),
        getAllMarketData().catch(() => null) // Don't fail if market data unavailable
      ])
      setTransactions(transData.slice(0, 5)) // Show only recent 5
      setTotals(totalsData)
      setMarketData(marketDataResult)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Overview of your financial status</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Total Income */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-green-100 text-xs sm:text-sm mb-1">Total Income</p>
                    <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(totals.total_income)}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                    <FontAwesomeIcon icon={faCircleDollarToSlot} className="text-2xl sm:text-3xl" />
                  </div>
                </div>
                <div className="flex items-center text-green-100 text-xs sm:text-sm">
                  <span>All time income</span>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-red-100 text-xs sm:text-sm mb-1">Total Expenses</p>
                    <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(totals.total_expenses)}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-2xl sm:text-3xl" />
                  </div>
                </div>
                <div className="flex items-center text-red-100 text-xs sm:text-sm">
                  <span>All time expenses</span>
                </div>
              </div>

              {/* Balance */}
              <div className={`bg-gradient-to-br rounded-xl p-4 sm:p-6 shadow-lg text-white sm:col-span-2 lg:col-span-1 ${
                totals.balance >= 0 
                  ? 'from-blue-500 to-cyan-600' 
                  : 'from-orange-500 to-red-600'
              }`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs sm:text-sm mb-1">Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(totals.balance)}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-2xl sm:text-3xl" />
                  </div>
                </div>
                <div className="flex items-center text-white/80 text-xs sm:text-sm">
                  <span>{totals.balance >= 0 ? 'Positive balance' : 'Negative balance'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
              <Link
                href="/finance"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      Finance
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Manage transactions and track income/expenses
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xl sm:text-2xl text-purple-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/wallets"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      Wallets
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Manage your wallets and balances
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faCreditCard} className="text-xl sm:text-2xl text-green-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/notes"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                      Notes
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Capture your thoughts and ideas
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faNoteSticky} className="text-xl sm:text-2xl text-yellow-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/stocks"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      Stocks
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Track your stock portfolio
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faStockChart} className="text-xl sm:text-2xl text-blue-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/assets"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      Assets
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Track your assets and investments
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faBriefcase} className="text-xl sm:text-2xl text-indigo-600" />
                  </div>
                </div>
              </Link>

              <Link
                href="/markets"
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      Markets
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Real-time market prices and trends
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faChartBar} className="text-xl sm:text-2xl text-orange-600" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Market Data Summary */}
            {marketData && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Market Overview</h2>
                  <Link
                    href="/markets"
                    className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium transition-colors"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {marketData.bitcoin && (
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Bitcoin</span>
                        <FontAwesomeIcon icon={faCoins} className="text-lg sm:text-xl" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-1">
                        ${marketData.bitcoin.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        marketData.bitcoin.change_24h >= 0 ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {marketData.bitcoin.change_24h >= 0 ? '+' : ''}{marketData.bitcoin.change_24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {marketData.ethereum && (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Ethereum</span>
                        <FontAwesomeIcon icon={faGem} className="text-lg sm:text-xl" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-1">
                        ${marketData.ethereum.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        marketData.ethereum.change_24h >= 0 ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {marketData.ethereum.change_24h >= 0 ? '+' : ''}{marketData.ethereum.change_24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {marketData.gold && marketData.gold.price > 0 && (
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Gold (oz)</span>
                        <FontAwesomeIcon icon={faGem} className="text-lg sm:text-xl" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-1">
                        ${marketData.gold.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        marketData.gold.change_24h >= 0 ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {marketData.gold.change_24h >= 0 ? '+' : ''}{marketData.gold.change_24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {marketData.bnb && (
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">BNB</span>
                        <FontAwesomeIcon icon={faCoins} className="text-lg sm:text-xl" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-1">
                        ${marketData.bnb.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        marketData.bnb.change_24h >= 0 ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {marketData.bnb.change_24h >= 0 ? '+' : ''}{marketData.bnb.change_24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {marketData.sp500 && (
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">S&P 500</span>
                        <FontAwesomeIcon icon={faArrowTrendUp} className="text-lg sm:text-xl" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-1">
                        {marketData.sp500.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${
                        marketData.sp500.change_24h >= 0 ? 'text-green-100' : 'text-red-100'
                      }`}>
                        {marketData.sp500.change_24h >= 0 ? '+' : ''}{marketData.sp500.change_24h.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Transactions</h2>
                <Link
                  href="/finance"
                  className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faNoteSticky} className="text-2xl sm:text-3xl text-gray-600" />
                  </div>
                  <p className="text-gray-600 text-base sm:text-lg">No transactions yet</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">Start by adding your first transaction</p>
                  <Link
                    href="/finance"
                    className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Add Transaction
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'income'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          <FontAwesomeIcon 
                            icon={transaction.type === 'income' ? faArrowTrendUp : faArrowTrendDown} 
                            className={`text-xl sm:text-2xl ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{transaction.description}</h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                              {transaction.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-base sm:text-lg font-bold ml-2 flex-shrink-0 ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
