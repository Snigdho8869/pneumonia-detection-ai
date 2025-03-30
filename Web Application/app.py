import os
from flask import Flask, request, jsonify, render_template, url_for
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
model = load_model('pneumonia.h5')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
            
        try:
            filename = file.filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            image = load_img(file_path, target_size=(224,224), color_mode="grayscale")
            input_arr = img_to_array(image)
            input_arr = np.array([input_arr])

            result = model.predict(input_arr)

            if result[0][0] == 1:
                prediction = 'Pneumonia Detected'
            else:
                prediction = 'Normal'
                
            image_url = url_for('static', filename=f'uploads/{filename}', _external=True)
            
            return jsonify({
                'prediction': prediction,
                'image_url': image_url
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)