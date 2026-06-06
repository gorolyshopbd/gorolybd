'use client';

import { useCallback } from 'react';

// Centralized hook for GTM DataLayer pushes (GA4 E-commerce Schema)
export const useTracking = () => {
  const pushToDataLayer = useCallback((eventName, payload) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object to prevent bleed
      window.dataLayer.push({
        event: eventName,
        ...payload
      });
    }
  }, []);

  const trackViewItem = useCallback((product, finalPrice) => {
    if (!product) return;
    pushToDataLayer('view_item', {
      ecommerce: {
        currency: 'BDT',
        value: Number(finalPrice || product.price || 0),
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: Number(finalPrice || product.price || 0),
          item_category: product.category,
          item_brand: product.brand,
          quantity: 1
        }]
      }
    });
  }, [pushToDataLayer]);

  const trackAddToCart = useCallback((product, quantity, finalPrice) => {
    if (!product) return;
    pushToDataLayer('add_to_cart', {
      ecommerce: {
        currency: 'BDT',
        value: Number(finalPrice || product.price || 0) * quantity,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: Number(finalPrice || product.price || 0),
          item_category: product.category,
          item_brand: product.brand,
          quantity: quantity
        }]
      }
    });
  }, [pushToDataLayer]);

  const trackRemoveFromCart = useCallback((item) => {
    if (!item) return;
    pushToDataLayer('remove_from_cart', {
      ecommerce: {
        currency: 'BDT',
        value: Number(item.price || 0) * item.quantity,
        items: [{
          item_id: item._id,
          item_name: item.name,
          price: Number(item.price || 0),
          item_category: item.category,
          item_brand: item.brand,
          quantity: item.quantity
        }]
      }
    });
  }, [pushToDataLayer]);

  const trackBeginCheckout = useCallback((cartItems, totalValue) => {
    if (!cartItems || !cartItems.length) return;
    pushToDataLayer('begin_checkout', {
      ecommerce: {
        currency: 'BDT',
        value: Number(totalValue || 0),
        items: cartItems.map((item) => ({
          item_id: item._id,
          item_name: item.name,
          price: Number(item.price || 0),
          item_category: item.category,
          item_brand: item.brand,
          quantity: item.quantity
        }))
      }
    });
  }, [pushToDataLayer]);

  const trackPurchase = useCallback((orderData) => {
    if (!orderData) return;
    const items = orderData.orderItems || [];
    pushToDataLayer('purchase', {
      ecommerce: {
        transaction_id: orderData._id || orderData.transactionId || `T_${Date.now()}`,
        value: Number(orderData.totalPrice || 0),
        tax: Number(orderData.taxPrice || 0),
        shipping: Number(orderData.shippingPrice || 0),
        currency: 'BDT',
        items: items.map((item) => ({
          item_id: item.product || item._id,
          item_name: item.name,
          price: Number(item.price || 0),
          quantity: item.qty || item.quantity
        }))
      }
    });
  }, [pushToDataLayer]);

  return {
    trackViewItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase
  };
};
