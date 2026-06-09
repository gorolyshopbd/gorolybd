'use client';
import React, { useContext } from 'react';
import { ShopContext } from '@/context/ShopContext';
import { Home, ShoppingBag, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';

export default function MobileBottomNav({ activeTab, onTabChange, onCartClick, onAuthClick }) {
  const { user, cartItems } = useContext(ShopContext);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'shop', label: 'Shop', icon: ShoppingBag },
    { key: 'categories', label: 'Categories', icon: Grid3X3 },
    { key: 'wishlist', label: 'Wishlist', icon: Heart, requiresAuth: true },
    { key: 'cart', label: 'Cart', icon: ShoppingCart, isCart: true },
    { key: 'account', label: user ? 'Account' : 'Login', icon: User },
  ];

  const handlePress = (item) => {
    if (item.isCart) {
      onCartClick && onCartClick();
      return;
    }
    if (item.key === 'account') {
      if (user) {
        onTabChange('dashboard');
      } else {
        onAuthClick && onAuthClick();
      }
      return;
    }
    if (item.requiresAuth && !user) {
      onAuthClick && onAuthClick();
      return;
    }
    onTabChange(item.key);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isCart ? false : activeTab === item.key;
          const isAccountActive = item.key === 'account' && activeTab === 'dashboard';
          const showWishlistActive = item.key === 'wishlist' && activeTab === 'wishlist';

          return (
            <button
              key={item.key}
              onClick={() => handlePress(item)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors duration-150 ${
                isActive || isAccountActive || showWishlistActive ? 'text-[#FF6600]' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive || isAccountActive || showWishlistActive ? 2.5 : 1.8} />
                {item.isCart && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF6600] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold truncate w-full text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
