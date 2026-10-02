const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
let loadPromise;

const loadRazorpay = () => {
    if (window.Razorpay) {
      return Promise.resolve(true);
    }

    if (!loadPromise) {
      loadPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = checkoutScriptUrl;
        script.onload = () => resolve(true);
        script.onerror = () => {
          loadPromise = undefined;
          resolve(false);
        };
        document.body.appendChild(script);
      });
    }

    return loadPromise;
};

export default loadRazorpay;
