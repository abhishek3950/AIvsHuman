import os
import time
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import requests
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from web3 import Web3
from dotenv import load_dotenv
import schedule

# Load environment variables
load_dotenv()

# Configuration
COINGECKO_API = "https://api.coingecko.com/api/v3"
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
RPC_URL = os.getenv("RPC_URL")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Load contract ABI
with open("contracts/artifacts/contracts/BettingContract.sol/BettingContract.json") as f:
    contract_json = json.load(f)
    contract_abi = contract_json["abi"]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

def fetch_historical_data():
    """Fetch historical BTC price data from CoinGecko"""
    end_time = datetime.now()
    start_time = end_time - timedelta(days=30)
    
    url = f"{COINGECKO_API}/coins/bitcoin/market_chart/range"
    params = {
        "vs_currency": "usd",
        "from": int(start_time.timestamp()),
        "to": int(end_time.timestamp())
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Convert to DataFrame
    df = pd.DataFrame(data["prices"], columns=["timestamp", "price"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    return df

def prepare_features(df):
    """Prepare features for the model"""
    # Calculate technical indicators
    df["sma_5"] = df["price"].rolling(window=5).mean()
    df["sma_20"] = df["price"].rolling(window=20).mean()
    df["rsi"] = calculate_rsi(df["price"])
    
    # Create lagged features
    for i in range(1, 6):
        df[f"price_lag_{i}"] = df["price"].shift(i)
    
    # Drop rows with NaN values
    df = df.dropna()
    
    # Prepare features and target
    features = ["price_lag_1", "price_lag_2", "price_lag_3", "price_lag_4", "price_lag_5",
                "sma_5", "sma_20", "rsi"]
    X = df[features]
    y = df["price"]
    
    return X, y

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def train_model(X, y):
    """Train the Random Forest model"""
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model

def predict_price(model, df):
    """Make price prediction for the next 5 minutes"""
    # Prepare the latest data point
    latest_data = df.iloc[-1]
    features = ["price_lag_1", "price_lag_2", "price_lag_3", "price_lag_4", "price_lag_5",
                "sma_5", "sma_20", "rsi"]
    X_pred = latest_data[features].values.reshape(1, -1)
    
    # Make prediction
    prediction = model.predict(X_pred)[0]
    return prediction

def create_market(prediction):
    """Create a new market with the prediction"""
    try:
        # Convert prediction to wei (assuming price is in USD)
        prediction_wei = w3.to_wei(prediction, "ether")
        
        # Create transaction
        nonce = w3.eth.get_transaction_count(w3.eth.account.from_key(PRIVATE_KEY).address)
        txn = contract.functions.createMarket(prediction_wei).build_transaction({
            "chainId": 84532,  # Base Sepolia
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"Created new market with prediction: {prediction}")
        return True
    except Exception as e:
        print(f"Error creating market: {e}")
        return False

def settle_market(market_id, actual_price):
    """Settle the market with actual price"""
    try:
        # Convert actual price to wei
        actual_price_wei = w3.to_wei(actual_price, "ether")
        
        # Create transaction
        nonce = w3.eth.get_transaction_count(w3.eth.account.from_key(PRIVATE_KEY).address)
        txn = contract.functions.settleMarket(market_id, actual_price_wei).build_transaction({
            "chainId": 84532,  # Base Sepolia
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"Settled market {market_id} with actual price: {actual_price}")
        return True
    except Exception as e:
        print(f"Error settling market: {e}")
        return False

def run_prediction_cycle():
    """Main function to run the prediction cycle"""
    try:
        # Fetch historical data
        df = fetch_historical_data()
        
        # Prepare features and train model
        X, y = prepare_features(df)
        model = train_model(X, y)
        
        # Make prediction
        prediction = predict_price(model, df)
        
        # Create new market
        create_market(prediction)
        
        # Wait 5 minutes
        time.sleep(300)
        
        # Get actual price and settle market
        current_price = float(requests.get(f"{COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd").json()["bitcoin"]["usd"])
        settle_market(contract.functions.getCurrentMarket().call()[0], current_price)
        
    except Exception as e:
        print(f"Error in prediction cycle: {e}")

def main():
    """Main function to run the AI agent"""
    print("Starting AI agent...")
    
    # Schedule the prediction cycle to run every 5 minutes
    schedule.every(5).minutes.do(run_prediction_cycle)
    
    # Run the first cycle immediately
    run_prediction_cycle()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main() 