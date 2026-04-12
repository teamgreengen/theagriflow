const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const PaymentService = {
  async initialize() {
    await loadPaystackScript();
  },

  async checkout({ email, amount, reference, onSuccess, onClose }) {
    await loadPaystackScript();

    const handler = window.PaystackPop.setup({
      key: 'pk_live_0cf753f9246e8742a6084493e00848b061e05522',
      email,
      amount: amount * 100,
      currency: 'GHS',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Order Reference',
            variable_name: 'order_reference',
            value: reference
          }
        ]
      },
      callback: (response) => {
        if (onSuccess) onSuccess(response);
      },
      onClose: () => {
        if (onClose) onClose();
      }
    });

    handler.openIframe();
  },

  generateReference(prefix = 'AGR') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  verifyPayment(reference) {
    return fetch(`${import.meta.env.VITE_API_URL || ''}/api/verify-paystack?ref=${reference}`, {
      method: 'GET'
    }).then(res => res.json());
  }
};

export default PaymentService;
