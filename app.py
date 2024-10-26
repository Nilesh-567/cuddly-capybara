from flask import Flask, render_template, request, redirect, url_for, send_file
import qrcode
import io

app = Flask(__name__)

# Mock product list (you can expand this)
products = [
    {"id": 1, "name": "Product 1", "price": 20},
    {"id": 2, "name": "Product 2", "price": 40},
    {"id": 3, "name": "Product 3", "price": 10},
    {"id": 4, "name": "Product 4", "price": 30},
]

UPI_ID = "6299695907-2@ybl"  # Your UPI ID
NAME = "Nilesh Ranjan"  # Your name for UPI

@app.route('/')
def index():
    return render_template('index.html', products=products)

@app.route('/payment/<int:product_id>', methods=['GET', 'POST'])
def payment(product_id):
    # Get the selected product
    selected_product = next((p for p in products if p['id'] == product_id), None)
    if not selected_product:
        return "Product not found!", 404

    if request.method == 'POST':
        # Get form data
        donation = request.form.get('donation')
        amount = float(selected_product['price'])
        add_donation = request.form.get('add_donation')

        # If donation is checked and amount is provided, add donation
        if add_donation == 'on' and donation:
            amount += float(donation)

        # Generate the correct UPI URI based on amount
        upi_uri = generate_upi_uri(UPI_ID, NAME, amount)

        # Generate QR code
        img = generate_qr_image(upi_uri)

        # Convert the QR code to a file-like object
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png')

    return render_template('payment.html', product=selected_product)

def generate_upi_uri(upi_id, name, amount=None):
    """
    Generate UPI URI for fixed or donation based payment.
    """
    upi_uri = f"upi://pay?pa={upi_id}&pn={name}&cu=INR"
    if amount:
        upi_uri += f"&am={amount}"  # Include amount if it's a fixed price QR
    return upi_uri

def generate_qr_image(data):
    """
    Generate a QR code from data
    """
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    return img

if __name__ == '__main__':
    app.run(debug=True)
