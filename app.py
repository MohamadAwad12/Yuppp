from flask import Flask, render_template, jsonify
import time
from threading import Lock
from datetime import datetime
from some import get_wallet_tokens, get_token_price

app = Flask(__name__)

# Global variables
WALLET_ADDRESSES = [
    "2AiLzs7bhm2kJkx4hw62kNykTcqHuWhFWwbumLMaHJPv",
    "GvhEuFmQYnxtXnyT1dwkLabgWhMGbgimJXvGdHSuMdNU"
]
cache = {
    'total_value': 0,
    'last_update': 0,
    'cache_lock': Lock()
}

def calculate_total_portfolio_value():
    total_value = 0
    try:
        for wallet_address in WALLET_ADDRESSES:
            tokens = get_wallet_tokens(wallet_address)
            for token in tokens:
                price = get_token_price(token['mint'])
                value = token['amount'] * price
                total_value += value
    except Exception as e:
        print(f"Error calculating portfolio value: {str(e)}")
    return total_value

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/portfolio-value')
def get_portfolio_value():
    current_time = time.time()
    
    with cache['cache_lock']:
        if current_time - cache['last_update'] > 5:  # Update every 5 seconds
            new_value = calculate_total_portfolio_value()
            old_value = cache['total_value']
            cache['total_value'] = new_value
            cache['last_update'] = current_time
            
            return jsonify({
                'value': new_value,
                'previous_value': old_value,
                'timestamp': datetime.now().isoformat()
            })
        
        return jsonify({
            'value': cache['total_value'],
            'previous_value': cache['total_value'],
            'timestamp': datetime.now().isoformat()
        })

if __name__ == '__main__':
    app.run(debug=True)
