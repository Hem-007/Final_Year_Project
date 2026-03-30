from flask import Flask, render_template, request
import easyocr
import os

app = Flask(__name__)

reader = easyocr.Reader(['en'])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/extract-text', methods=['POST'])
def extract_text():

    file = request.files['image']

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    result = reader.readtext(filepath)

    text = " ".join([item[1] for item in result])

    return f"<h2>Extracted Text:</h2><p>{text}</p><br><a href='/'>Upload another image</a>"

if __name__ == "__main__":
    app.run(debug=True)