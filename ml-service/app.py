from flask import Flask, request, jsonify
from flask_cors import CORS
import analyzer
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        file_name = data.get('file_name')

        result = analyzer.analyze_file(file_path, file_name)
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML Service is running ✅'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)