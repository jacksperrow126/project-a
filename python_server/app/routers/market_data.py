from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

router = APIRouter(prefix="/api/market-data", tags=["market-data"])

async def fetch_crypto_price(symbol: str) -> Optional[Dict[str, Any]]:
    """Fetch cryptocurrency price from CoinGecko"""
    try:
        # Map symbols to CoinGecko IDs
        coin_map = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'BNB': 'binancecoin',
            'SOL': 'solana',
            'ADA': 'cardano',
            'XRP': 'ripple',
            'DOGE': 'dogecoin'
        }
        
        coin_id = coin_map.get(symbol.upper(), symbol.lower())
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd&include_24hr_change=true"
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if coin_id in data:
                    return {
                        "symbol": symbol.upper(),
                        "price": data[coin_id]["usd"],
                        "change_24h": data[coin_id].get("usd_24h_change", 0),
                        "timestamp": datetime.now().isoformat()
                    }
        return None
    except Exception as e:
        print(f"Error fetching crypto price for {symbol}: {e}")
        return None

async def fetch_gold_price() -> Optional[Dict[str, Any]]:
    """Fetch gold price from Coinbase API (XAU/USD)"""
    # Primary method: Use Coinbase API - most reliable source for gold price
    # Gold price in 2025 is around $4000-4500/oz
    try:
        # Get USD exchange rates to find XAU rate
        url = "https://api.coinbase.com/v2/exchange-rates?currency=USD"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if "data" in data and "rates" in data["data"]:
                    rates = data["data"]["rates"]
                    if "XAU" in rates:
                        # Coinbase returns how many XAU per 1 USD
                        xau_per_usd = float(rates["XAU"])
                        # Invert to get USD per XAU (troy ounce)
                        price_per_ounce = 1.0 / xau_per_usd if xau_per_usd > 0 else 0
                        
                        # Gold price in 2025 is around $4000-4500/oz, accept this range
                        if 1000 < price_per_ounce < 10000:
                            return {
                                "symbol": "GOLD",
                                "price": round(price_per_ounce, 2),
                                "change_24h": 0,  # Coinbase doesn't provide 24h change
                                "timestamp": datetime.now().isoformat()
                            }
    except Exception as e:
        print(f"Error fetching gold from Coinbase: {e}")
    
    # Fallback: Use Yahoo Finance GC=F (Gold Futures)
    try:
        gold_data = await fetch_stock_price("GC=F")
        if gold_data and gold_data.get("price", 0) > 0:
            price = gold_data["price"]
            # GC=F futures price is per troy ounce
            # Accept prices in the $1000-$10000 range (2025 gold prices are higher)
            if 1000 < price < 10000:
                return {
                    "symbol": "GOLD",
                    "price": round(price, 2),
                    "change_24h": gold_data.get("change_24h", 0),
                    "timestamp": datetime.now().isoformat()
                }
    except Exception as e:
        print(f"Error fetching gold from GC=F: {e}")
    
    return None

async def fetch_stock_price(symbol: str) -> Optional[Dict[str, Any]]:
    """Fetch stock price using Yahoo Finance API"""
    try:
        # Map common symbols to Yahoo Finance format
        symbol_map = {
            'GSPC': '^GSPC',  # S&P 500
            'DJI': '^DJI',    # Dow Jones
            'IXIC': '^IXIC',  # NASDAQ
            'DX-Y.NYB': 'DX-Y.NYB',  # Dollar Index
        }
        
        # Use mapped symbol or original
        yahoo_symbol = symbol_map.get(symbol.upper(), symbol)
        
        # URL encode the symbol
        import urllib.parse
        encoded_symbol = urllib.parse.quote(yahoo_symbol)
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded_symbol}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
        }
        
        async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if "chart" in data and "result" in data["chart"] and len(data["chart"]["result"]) > 0:
                    result = data["chart"]["result"][0]
                    meta = result.get("meta", {})
                    regular_price = meta.get("regularMarketPrice") or meta.get("previousClose")
                    previous_close = meta.get("previousClose", regular_price)
                    
                    if regular_price and regular_price > 0:
                        change = regular_price - previous_close
                        change_percent = (change / previous_close * 100) if previous_close > 0 else 0
                        
                        return {
                            "symbol": symbol.upper().replace("^", ""),
                            "price": float(regular_price),
                            "change_24h": float(change_percent),
                            "timestamp": datetime.now().isoformat()
                        }
        return None
    except Exception as e:
        print(f"Error fetching stock price for {symbol}: {e}")
        return None

@router.get("/crypto/{symbol}")
async def get_crypto_price(symbol: str):
    """Get cryptocurrency price"""
    data = await fetch_crypto_price(symbol)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch price for {symbol}")
    return data

@router.get("/gold")
async def get_gold_price():
    """Get gold price"""
    data = await fetch_gold_price()
    if data is None:
        raise HTTPException(status_code=503, detail="Gold price service unavailable")
    return data

@router.get("/stock/{symbol}")
async def get_stock_price(symbol: str):
    """Get stock price"""
    data = await fetch_stock_price(symbol)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch price for {symbol}")
    return data

@router.get("/all")
async def get_all_market_data():
    """Get all market data at once"""
    try:
        import asyncio
        
        # Fetch all data in parallel
        results = await asyncio.gather(
            fetch_crypto_price("BTC"),
            fetch_crypto_price("ETH"),
            fetch_crypto_price("BNB"),
            fetch_gold_price(),
            fetch_stock_price("GSPC"),  # S&P 500 (without ^)
            fetch_stock_price("DX-Y.NYB"),  # Dollar Index
            fetch_stock_price("DJI"),  # Dow Jones (without ^)
            fetch_stock_price("IXIC"),  # NASDAQ (without ^)
            return_exceptions=True
        )
        
        # Process results
        market_data = {
            "bitcoin": results[0] if not isinstance(results[0], Exception) and results[0] else None,
            "ethereum": results[1] if not isinstance(results[1], Exception) and results[1] else None,
            "bnb": results[2] if not isinstance(results[2], Exception) and results[2] else None,
            "gold": results[3] if not isinstance(results[3], Exception) and results[3] else None,
            "sp500": results[4] if not isinstance(results[4], Exception) and results[4] else None,
            "dollar_index": results[5] if not isinstance(results[5], Exception) and results[5] else None,
            "dow_jones": results[6] if not isinstance(results[6], Exception) and results[6] else None,
            "nasdaq": results[7] if not isinstance(results[7], Exception) and results[7] else None,
            "timestamp": datetime.now().isoformat()
        }
        
        return market_data
    except Exception as e:
        print(f"Error in get_all_market_data: {e}")
        raise HTTPException(status_code=503, detail=f"Error fetching market data: {str(e)}")

@router.get("/")
async def get_market_summary():
    """Get market summary with key indicators"""
    try:
        data = await get_all_market_data()
        return {
            "summary": {
                "bitcoin": data.get("bitcoin", {}).get("price") if data.get("bitcoin") else None,
                "ethereum": data.get("ethereum", {}).get("price") if data.get("ethereum") else None,
                "bnb": data.get("bnb", {}).get("price") if data.get("bnb") else None,
                "gold": data.get("gold", {}).get("price") if data.get("gold") else None,
                "sp500": data.get("sp500", {}).get("price") if data.get("sp500") else None,
                "dollar_index": data.get("dollar_index", {}).get("price") if data.get("dollar_index") else None,
            },
            "timestamp": data.get("timestamp")
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error fetching market summary: {str(e)}")
