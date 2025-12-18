'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllMarketData, type AllMarketData, type MarketData } from '@/lib/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '@/lib/icons'

export default function MarketsPage() {
  const [marketData, setMarketData] = useState<AllMarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadMarketData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      const data = await getAllMarketData()
      setMarketData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (price: number) => {
    if (price === 0 || !price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price)
  }

  const formatChange = (change: number) => {
    if (change === 0 || change === null || change === undefined) return '0.00%'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const MarketCard = ({ title, data, icon, color }: { 
    title: string
    data: MarketData | null
    icon: any
    color: string
  }) => {
    if (!data || !data.price) {
      return (
        <div className={`bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm ${color} opacity-50`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <div className="text-3xl">
              {typeof icon === 'string' ? icon : <FontAwesomeIcon icon={icon} className="text-gray-400" />}
            </div>
          </div>
          <p className="text-xs text-gray-500">Data unavailable</p>
        </div>
      )
    }

    const isPositive = data.change_24h >= 0

    return (
      <div className={`bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${color}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(data.price)}</p>
          </div>
          <div className="text-3xl sm:text-4xl">
            {typeof icon === 'string' ? icon : <FontAwesomeIcon icon={icon} className="text-gray-600" />}
          </div>
        </div>
        <div className="flex items-center">
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatChange(data.change_24h)}
          </span>
          <span className="ml-2 text-xs text-gray-500">24h</span>
        </div>
      </div>
    )
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Market Data</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time prices and market indicators
            {lastUpdate && (
              <span className="ml-2 text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {loading && !marketData ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading market data...</p>
          </div>
        ) : (
          <>
            {/* Cryptocurrencies */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Cryptocurrencies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MarketCard
                  title="Bitcoin"
                  data={marketData?.bitcoin || null}
                  icon={icons.bitcoin}
                  color=""
                />
                <MarketCard
                  title="Ethereum"
                  data={marketData?.ethereum || null}
                  icon={icons.ethereum}
                  color=""
                />
                <MarketCard
                  title="BNB"
                  data={marketData?.bnb || null}
                  icon={icons.coins}
                  color=""
                />
              </div>
            </div>

            {/* Precious Metals */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Precious Metals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MarketCard
                  title="Gold"
                  data={marketData?.gold || null}
                  icon={icons.gem}
                  color=""
                />
              </div>
            </div>

            {/* Stock Indices */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Stock Indices</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MarketCard
                  title="S&P 500"
                  data={marketData?.sp500 || null}
                  icon={icons.arrowUp}
                  color=""
                />
                <MarketCard
                  title="Dow Jones"
                  data={marketData?.dow_jones || null}
                  icon={icons.chartBar}
                  color=""
                />
                <MarketCard
                  title="NASDAQ"
                  data={marketData?.nasdaq || null}
                  icon={icons.stockChart}
                  color=""
                />
              </div>
            </div>

            {/* Currency */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Currency</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MarketCard
                  title="Dollar Index"
                  data={marketData?.dollar_index || null}
                  icon={icons.dollar}
                  color=""
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

