from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
import librosa
import numpy as np
import tensorflow as tf
import soundfile as sf
import pickle
import logging
from pydub import AudioSegment

logging.basicConfig(level=logging.DEBUG)


# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load ML model and label encoder
MODEL_PATH = "sound-detection-model/model.h5"
LABEL_ENCODER_PATH = "sound-detection-model/label_encoder.pkl"

model = tf.keras.models.load_model(MODEL_PATH)
with open(LABEL_ENCODER_PATH, 'rb') as f:
    label_encoder = pickle.load(f)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        port=os.getenv("MYSQL_PORT"),
    )

def extract_features_from_audio(audio, sample_rate):
    try:
        features = np.mean(librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=50).T, axis=0)
        return features
    except Exception as e:
        app.logger.error(f"Feature extraction error: {e}")
        return None

def predict_audio_class(audio_features):
    if audio_features is not None:
        audio_features = audio_features.reshape(1, -1, 1)
        prediction = model.predict(audio_features)
        predicted_class = label_encoder.inverse_transform([np.argmax(prediction)])
        return predicted_class[0]
    return "Unknown"

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Hello, world!"})

@app.route("/incidents", methods=["GET"])
def get_incidents():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM incidents")
        incidents = cursor.fetchall()
        conn.close()
        return jsonify(incidents)
    except Exception as e:
        return jsonify({"message": "Error fetching incidents", "error": str(e)}), 500

@app.route("/incidents", methods=["POST"])
def create_incident():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO incidents (user_id, type, title, description, latitude, longitude, urgency, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        values = (
            data["userId"], data["type"], data["title"], data["description"],
            data["latitude"], data["longitude"], data["urgency"], data["status"]
        )

        cursor.execute(query, values)
        conn.commit()
        incident_id = cursor.lastrowid
        conn.close()

        return jsonify({"id": incident_id}), 201
    except Exception as e:
        return jsonify({"message": "Error creating incident", "error": str(e)}), 500

@app.route("/classify-audio", methods=["POST"])
def classify_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    temp_wav = "temp.wav"
    sr = 22050
    try:
        # audio, sr  = librosa.load(audio_file, sr=22050)
        
        # with wave.open(audio_file, "rb") as wf:
        #     sr = wf.getframerate()
        #     audio_data = wf.readframes(wf.getnframes())

        # audio, sr = sf.read(audio_file)

        audio = AudioSegment.from_file(audio_file, format="wav")
        audio.export(temp_wav, format="wav")
        audio_data, sr  = librosa.load(temp_wav, sr=22050)
        

        features = extract_features_from_audio(audio_data, sr)

        if features is None:
            return jsonify({"error": "Feature extraction failed"}), 500
        
        prediction = predict_audio_class(features)

        return jsonify({
            "classification": prediction,
            "status": "success"
        })

    except Exception as e:
        logging.exception("Audio classification error")
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
        return jsonify({"error": str(e)}), 500

# Error handling for non-existent routes
@app.errorhandler(404)
def not_found(e):
    return jsonify({"message": "Not Found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)