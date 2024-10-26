window.onload = function() {
    const buyButtons = document.querySelectorAll('.buy-btn');
    const plusButtons = document.querySelectorAll('.plus-btn');
    const minusButtons = document.querySelectorAll('.minus-btn');
    const spinner = document.getElementById('loading-spinner');
    const qrCodeDisplay = document.getElementById('qrcode-display');
    const paymentModal = document.getElementById('payment-modal');
    const scanPayButton = document.getElementById('scan-pay');
    const vpaPayButton = document.getElementById('vpa-pay');
    const vpaForm = document.getElementById('vpa-form');
    const vpaSubmitButton = document.getElementById('vpa-submit');

    // Handle quantity increment
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const quantityDisplay = document.getElementById(`quantity-${index}`);
            let quantity = parseInt(quantityDisplay.innerText);
            quantity++;
            quantityDisplay.innerText = quantity;
        });
    });

    // Handle quantity decrement
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const quantityDisplay = document.getElementById(`quantity-${index}`);
            let quantity = parseInt(quantityDisplay.innerText);
            if (quantity > 1) {
                quantity--;
            }
            quantityDisplay.innerText = quantity;
        });
    });

    // Handle Buy Now button click
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            const index = this.getAttribute('data-index');
            const quantity = document.getElementById(`quantity-${index}`).innerText;

            const totalAmount = amount * quantity;
            vpaSubmitButton.setAttribute('data-amount', totalAmount);
            vpaSubmitButton.setAttribute('data-index', index);

            // Show the payment options modal
            paymentModal.style.display = 'block';
        });
    });

    // Handle QR Code option
    scanPayButton.addEventListener('click', async function() {
        paymentModal.style.display = 'none'; // Hide the modal

        const totalAmount = vpaSubmitButton.getAttribute('data-amount');
        const index = vpaSubmitButton.getAttribute('data-index');
        const upiApp = document.getElementById(`upi-select-${index}`).value;

        spinner.style.display = 'block';
        qrCodeDisplay.innerHTML = '';

        try {
            const response = await fetch(`/generate_qr?amount=${totalAmount}&upi_app=${upiApp}`);
            const qrCodeHTML = await response.text();

            spinner.style.display = 'none';
            qrCodeDisplay.innerHTML = qrCodeHTML;
        } catch (error) {
            console.error('Error generating QR code:', error);
            spinner.style.display = 'none';
        }
    });

    // Handle VPA option
    vpaPayButton.addEventListener('click', function() {
        paymentModal.style.display = 'none'; // Hide the modal
        vpaForm.style.display = 'block'; // Show VPA form
    });

    // Handle VPA form submission
    vpaSubmitButton.addEventListener('click', async function() {
        const vpa = document.getElementById('vpa-input').value;
        const totalAmount = vpaSubmitButton.getAttribute('data-amount');
        const index = vpaSubmitButton.getAttribute('data-index');
        const upiApp = document.getElementById(`upi-select-${index}`).value;

        if (!vpa) {
            alert('Please enter a valid VPA.');
            return;
        }

        spinner.style.display = 'block';
        qrCodeDisplay.innerHTML = '';
        vpaForm.style.display = 'none'; // Hide VPA form

        try {
            const response = await fetch(`/send_payment_request?vpa=${vpa}&amount=${totalAmount}&upi_app=${upiApp}`);
            const result = await response.text();

            spinner.style.display = 'none';
            alert(result); // Notify the user of the payment request
        } catch (error) {
            console.error('Error sending payment request:', error);
            spinner.style.display = 'none';
        }
    });
};
