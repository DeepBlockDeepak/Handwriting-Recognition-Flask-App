import numpy as np
from flask import Flask, jsonify, render_template, request
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.preprocessing import scale
import matplotlib.pyplot as plt
import sys  # Import sys for command line arguments

# Initialize Flask app
app = Flask(__name__)

# Route for the main index page
@app.route("/")
def index():
    # Serve the handwriting template HTML
    return render_template("hand_writing_template.html")

# Route to process the drawing data from the frontend
@app.route("/process_data", methods=["POST"])
def process_data():
    try:
        # Extract the data sent from the client
        received_data = request.json["data"]
        # Preprocess the data for the KMeans model
        processed_data = preprocess_data(received_data)

        # Define the mapping of cluster numbers to actual digit values
        cluster_to_digit = {
            0: 4, 
            1: 2, 
            2: 0, 
            3: 5, 
            4: 9, 
            5: 3, 
            6: 7, 
            7: 8, 
            8: 1, 
            9: 6
        }

        # Predict the cluster for each digit drawn by the user
        prediction = app.model.predict(processed_data)
        # Map the cluster to the actual digit value
        prediction = [cluster_to_digit[cluster] for cluster in prediction]

        # Return the prediction result back to the frontend
        return jsonify({"status": "success", "prediction": prediction})
    
    except Exception as e:
        # Handle any errors during the process
        return jsonify({"status": "error", "message": str(e)}), 500

def preprocess_data(received_data):
    # Reshape received data to match the model's expected input shape
    reshaped_data = np.array(received_data).reshape(-1, 64)  # Adjust for 4 samples
    # Scale the data as the model was trained on scaled data
    scaled_data = scale(reshaped_data)
    return scaled_data

def plot_digits(model):
    # Plot the centroids of the KMeans clusters to visualize the digits
    fig = plt.figure(figsize=(8, 3))
    fig.suptitle('Cluster Center Images', fontsize=14, fontweight='bold')
    for i in range(10):
        ax = fig.add_subplot(2, 5, 1 + i)
        ax.imshow(model.cluster_centers_[i].reshape((8, 8)), cmap=plt.cm.binary)
    plt.show()

if __name__ == "__main__":
    # Load and scale the digits dataset
    digits = load_digits()
    data = scale(digits.data)

    # Initialize and fit the KMeans model
    model = KMeans(n_clusters=10, random_state=60)
    model.fit(data)

    # Determine mode from command line argument ('run' for Flask app, 'plot' for plotting digits)
    if len(sys.argv) > 1:
        mode = sys.argv[1]  # 'run' or 'plot'
    else:
        mode = 'run'  # Default mode is to run the Flask app

    if mode == 'plot':
        # Execute plotting logic if mode is 'plot'
        plot_digits(model)
    else:
        # Otherwise, run the Flask app
        app.model = model
        app.run(debug=True)
