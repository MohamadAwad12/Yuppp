import requests
import json

def get_wallet_tokens(wallet_address):
    """Fetch all tokens and their amounts from a wallet"""
    try:
        body = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
                wallet_address,
                {
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "encoding": "jsonParsed"
                }
            ]
        }
        
        response = requests.post(
            "https://api.mainnet-beta.solana.com",
            json=body,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print(f"Error: HTTP {response.status_code}")
            return []
            
        data = response.json()
        if "result" not in data or "value" not in data["result"]:
            print("Unexpected response format")
            return []
            
        tokens = []
        for account in data["result"]["value"]:
            if "account" in account and "data" in account["account"]:
                parsed_data = account["account"]["data"]
                if "parsed" in parsed_data and "info" in parsed_data["parsed"]:
                    info = parsed_data["parsed"]["info"]
                    mint = info.get("mint")
                    amount = float(info.get("tokenAmount", {}).get("uiAmount", 0))
                    if mint and amount > 0:  # Only include tokens with non-zero balance
                        tokens.append({
                            "mint": mint,
                            "amount": amount
                        })
        
        return tokens
    except Exception as e:
        print(f"Error fetching wallet tokens: {str(e)}")
        return []

def get_token_price(token_address):
    """Fetch token price from DexScreener API"""
    try:
        url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            pairs = data.get("pairs", [])
            if pairs:
                return float(pairs[0].get('priceUsd', 0))
        return 0
    except Exception as e:
        print(f"Error fetching token price: {str(e)}")
        return 0
