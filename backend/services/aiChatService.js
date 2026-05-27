const responses = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Welcome! How may I help you?",
  ],
  goodbye: [
    "Goodbye! Have a great day!",
    "See you later!",
    "Bye! Feel free to chat again if you need help.",
  ],
  thanks: [
    "You're welcome!",
    "Happy to help!",
    "Anytime!",
  ],
  order: [
    "You can track your order in the 'My Orders' section after logging in.",
    "To check your order status, please go to 'My Orders' in your account.",
    "Order tracking is available in your account under 'My Orders'.",
  ],
  shipping: [
    "We offer free shipping on orders over $50. Standard delivery takes 3-5 business days.",
    "Shipping costs $5 for standard delivery (3-5 days) and $15 for express (1-2 days).",
    "We ship nationwide with standard delivery in 3-5 business days.",
  ],
  return: [
    "You can return items within 30 days of delivery. Please visit our Returns page for details.",
    "Returns are accepted within 30 days. Contact support for a return label.",
    "Our return policy allows returns within 30 days with original packaging.",
  ],
  product: [
    "You can browse all our products in the shop. Use filters to find what you need.",
    "Check out our latest collection in the shop section.",
    "All products are listed on our shop page with detailed descriptions.",
  ],
  price: [
    "Prices are listed on each product page. We often have discounts and promotions running!",
    "You can see current prices on the product pages. Don't forget to check for ongoing sales!",
  ],
  account: [
    "To create an account, click 'Sign Up' on the top right corner.",
    "You can manage your account settings in the 'My Account' section.",
    "Account registration is free and gives you access to order history and wishlist.",
  ],
  payment: [
    "We accept Visa, Mastercard, PayPal, and Cash on Delivery.",
    "All major payment methods are supported including credit cards and PayPal.",
  ],
  contact: [
    "You can reach our support team through this chat or email us at support@shopio.com",
    "Email us at support@shopio.com or use this live chat for immediate assistance.",
  ],
  default: [
    "I'm here to help! Could you please provide more details about your question?",
    "I'd be happy to assist you. What specifically do you need help with?",
    "Let me know more about what you're looking for, and I'll do my best to help!",
  ],
};

const keywords = {
  greeting: ["hello", "hi", "hey", "good morning", "good evening"],
  goodbye: ["bye", "goodbye", "see you", "later"],
  thanks: ["thank", "thanks", "thank you"],
  order: ["order", "track", "tracking", "shipped", "shipping status"],
  shipping: ["shipping", "delivery", "deliver", "arrive", "when will"],
  return: ["return", "refund", "exchange", "cancel order"],
  product: ["product", "item", "shop", "buy", "available"],
  price: ["price", "cost", "much", "expensive", "discount", "sale"],
  account: ["account", "register", "sign up", "login", "password"],
  payment: ["payment", "pay", "credit card", "paypal", "cash"],
  contact: ["contact", "support", "help", "email", "phone"],
};

export const getAIResponse = (message) => {
  const text = message.toLowerCase().trim();
  
  if (text.length === 0) {
    return responses.greeting[0];
  }

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((word) => text.includes(word))) {
      const options = responses[category];
      return options[Math.floor(Math.random() * options.length)];
    }
  }

  return responses.default[Math.floor(Math.random() * responses.default.length)];
};