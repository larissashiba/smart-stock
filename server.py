from flask import Flask, request, jsonify, render_template
from datetime import datetime

app = Flask(__name__)

latest_readings = {
    "Farinha": {
        "peso": 0.0,
        "limite_alerta": 15.00,
        "capacidade_maxima": 50.00, 
        "timestamp": datetime.now().isoformat()
    },
    "Acucar": {
        "peso": 0.0,
        "limite_alerta": 10.00,
        "capacidade_maxima": 50.00, 
        "timestamp": datetime.now().isoformat()
    },
    "Oleo": {
        "peso": 0.0,
        "limite_alerta": 10.00,
        "capacidade_maxima": 50.00, 
        "timestamp": datetime.now().isoformat()
    }
}

@app.route('/', methods=['GET'])
def index():
    """Renderiza o template HTML principal (Dashboard)."""
    return render_template('index.html')

@app.route('/status', methods=['GET'])
def get_status():
    """Retorna o status atual do estoque de TODOS os itens para o dashboard (JSON)."""
    return jsonify(latest_readings)


@app.route('/dados_peso', methods=['POST'])
def receber_dados():
    global latest_readings
    
    try:
        data = request.get_json()
        
        # 1. Extrai o nome do item e o peso
        item_name = data.get('item', 'Item Desconhecido')
        # Garante que o peso é um float
        new_peso = float(data.get('peso', 0.0))

        # 2. Verifica se o item é válido e está no nosso dicionário
        if item_name not in latest_readings:
            print(f"Erro: Item '{item_name}' desconhecido. Ignorando dados.")
            return jsonify({"status": "erro", "mensagem": f"Item '{item_name}' não mapeado."}), 400

        # 3. Atualiza APENAS o item específico, mantendo as outras configurações
        latest_readings[item_name].update({
            "peso": new_peso,
            "timestamp": datetime.now().isoformat() 
        })
        
        print(f"Atualizado: {item_name} -> {new_peso:.2f} kg")
        
        return jsonify({"status": "ok", "mensagem": f"Dados de {item_name} armazenados com sucesso"}), 200
        
    except Exception as e:
        print(f"Erro ao processar dados POST: {e}")
        return jsonify({"status": "erro", "mensagem": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
