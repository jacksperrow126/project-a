const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Transaction API
export interface Transaction {
  id: number
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  wallet_id: number | null
  date: string
  created_at: string
}

export interface TransactionCreate {
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  wallet_id?: number | null
  date: string
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/api/transactions`)
  if (!response.ok) throw new Error('Failed to fetch transactions')
  return response.json()
}

export async function createTransaction(data: TransactionCreate): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create transaction')
  return response.json()
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete transaction')
}

export async function getTransactionTotals() {
  const response = await fetch(`${API_BASE_URL}/api/transactions/summary/totals`)
  if (!response.ok) throw new Error('Failed to fetch transaction totals')
  return response.json()
}

// Wallet API
export interface Wallet {
  id: number
  name: string
  balance: number
  type: 'Cash' | 'Bank' | 'Stock' | 'Savings' | 'Assets' | 'Credit'
  detail: string | null
  margin: number | null
  cash: number | null
  investment_value: number | null
  gross_balance: number | null
  loan: number | null
  not_mine: boolean
  created_at: string
}

export interface WalletCreate {
  name: string
  type: 'Cash' | 'Bank' | 'Stock' | 'Savings' | 'Assets' | 'Credit'
  detail?: string | null
  margin?: number | null
  cash?: number | null
  investment_value?: number | null
  gross_balance?: number | null
  loan?: number | null
  not_mine?: boolean
}

export async function getWallets(): Promise<Wallet[]> {
  const response = await fetch(`${API_BASE_URL}/api/wallets`)
  if (!response.ok) throw new Error('Failed to fetch wallets')
  return response.json()
}

export async function createWallet(data: WalletCreate): Promise<Wallet> {
  const response = await fetch(`${API_BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create wallet')
  return response.json()
}

export async function deleteWallet(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/wallets/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete wallet')
}

export async function getWalletTotals() {
  const response = await fetch(`${API_BASE_URL}/api/wallets/summary/totals`)
  if (!response.ok) throw new Error('Failed to fetch wallet totals')
  return response.json()
}

// Note API
export interface Note {
  id: number
  title: string | null
  content: string
  tag: 'Common' | 'Drink' | 'Friends' | 'Study' | 'Work' | 'Life' | 'Entertainment' | 'Family' | 'Health'
  remark: boolean
  image: string | null
  date: string
  created_at: string
}

export interface NoteCreate {
  title?: string | null
  content: string
  tag: 'Common' | 'Drink' | 'Friends' | 'Study' | 'Work' | 'Life' | 'Entertainment' | 'Family' | 'Health'
  remark?: boolean
  image?: string | null
}

export async function getNotes(tag?: string, date?: string): Promise<Note[]> {
  const params = new URLSearchParams()
  if (tag) params.append('tag', tag)
  if (date) params.append('date', date)
  const url = `${API_BASE_URL}/api/notes${params.toString() ? '?' + params.toString() : ''}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch notes')
  return response.json()
}

export async function createNote(data: NoteCreate): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create note')
  return response.json()
}

export async function deleteNote(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete note')
}

// Stock API
export interface Stock {
  id: number
  wallet_id: number
  code: string
  volume: number
  start_price: number
  start_date: string
  sell_price: number | null
  sell_date: string | null
  is_holding: boolean
  margin: number | null
  created_at: string
}

export interface StockCreate {
  wallet_id: number
  code: string
  volume: number
  start_price: number
  start_date: string
  margin?: number | null
}

export async function getStocks(walletId?: number): Promise<Stock[]> {
  const url = walletId 
    ? `${API_BASE_URL}/api/stocks?wallet_id=${walletId}`
    : `${API_BASE_URL}/api/stocks`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch stocks')
  return response.json()
}

export async function createStock(data: StockCreate): Promise<Stock> {
  const response = await fetch(`${API_BASE_URL}/api/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create stock')
  return response.json()
}

export async function deleteStock(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/stocks/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete stock')
}

// Budget Plan API
export interface BudgetPlan {
  id: number
  name: string
  value: number
  type: 'income' | 'expense'
  icon: string | null
  created_at: string
}

export interface BudgetPlanCreate {
  name: string
  value: number
  type: 'income' | 'expense'
  icon?: string | null
}

export async function getBudgetPlans(type?: 'income' | 'expense'): Promise<BudgetPlan[]> {
  const url = type 
    ? `${API_BASE_URL}/api/budget-plans?plan_type=${type}`
    : `${API_BASE_URL}/api/budget-plans`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch budget plans')
  return response.json()
}

export async function createBudgetPlan(data: BudgetPlanCreate): Promise<BudgetPlan> {
  const response = await fetch(`${API_BASE_URL}/api/budget-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create budget plan')
  return response.json()
}

export async function deleteBudgetPlan(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/budget-plans/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete budget plan')
}

// Transfer API
export interface MoneyTransfer {
  from_wallet_id: number
  to_wallet_id: number
  amount: number
  description?: string | null
}

export async function transferMoney(data: MoneyTransfer) {
  const response = await fetch(`${API_BASE_URL}/api/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to transfer money')
  return response.json()
}

// Asset API
export interface Asset {
  id: number
  type: 'Money' | 'Bank' | 'Gold' | 'Crypto' | 'Stock' | 'Loan'
  name: string
  amount: number
  value: number
  currency: string
  notes: string | null
  date: string
  created_at: string
}

export interface AssetCreate {
  type: 'Money' | 'Bank' | 'Gold' | 'Crypto' | 'Stock' | 'Loan'
  name: string
  amount: number
  value: number
  currency: string
  notes?: string
  date: string
}

export async function getAssets(): Promise<Asset[]> {
  const response = await fetch(`${API_BASE_URL}/api/assets`)
  if (!response.ok) throw new Error('Failed to fetch assets')
  return response.json()
}

export async function createAsset(data: AssetCreate): Promise<Asset> {
  const response = await fetch(`${API_BASE_URL}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create asset')
  return response.json()
}

export async function deleteAsset(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete asset')
}

export async function getAssetTotals() {
  const response = await fetch(`${API_BASE_URL}/api/assets/summary/totals`)
  if (!response.ok) throw new Error('Failed to fetch asset totals')
  return response.json()
}

// Market Data API
export interface MarketData {
  symbol: string
  price: number
  change_24h: number
  timestamp: string
}

export interface AllMarketData {
  bitcoin: MarketData | null
  ethereum: MarketData | null
  bnb: MarketData | null
  gold: MarketData | null
  sp500: MarketData | null
  dollar_index: MarketData | null
  dow_jones: MarketData | null
  nasdaq: MarketData | null
  timestamp: string
}

export async function getAllMarketData(): Promise<AllMarketData> {
  const response = await fetch(`${API_BASE_URL}/api/market-data/all`)
  if (!response.ok) throw new Error('Failed to fetch market data')
  return response.json()
}

export async function getMarketSummary() {
  const response = await fetch(`${API_BASE_URL}/api/market-data/`)
  if (!response.ok) throw new Error('Failed to fetch market summary')
  return response.json()
}

export async function getCryptoPrice(symbol: string): Promise<MarketData> {
  const response = await fetch(`${API_BASE_URL}/api/market-data/crypto/${symbol}`)
  if (!response.ok) throw new Error(`Failed to fetch ${symbol} price`)
  return response.json()
}

export async function getGoldPrice(): Promise<MarketData> {
  const response = await fetch(`${API_BASE_URL}/api/market-data/gold`)
  if (!response.ok) throw new Error('Failed to fetch gold price')
  return response.json()
}

export async function getStockPrice(symbol: string): Promise<MarketData> {
  const response = await fetch(`${API_BASE_URL}/api/market-data/stock/${symbol}`)
  if (!response.ok) throw new Error(`Failed to fetch ${symbol} price`)
  return response.json()
}
