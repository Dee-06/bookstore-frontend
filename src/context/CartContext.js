import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

// Get cart key specific to a user — prevents cart bleed between accounts
const getCartKey = () => {
  const token = localStorage.getItem('token');
  if (!token) return 'cart_guest';
  try {
    // Decode JWT payload (middle part) to get user id
    const payload = JSON.parse(atob(token.split('.')[1]));
    return `cart_${payload.id}`;
  } catch {
    return 'cart_guest';
  }
};

const getInitialItems = () => {
  try {
    return JSON.parse(localStorage.getItem(getCartKey())) || [];
  } catch {
    return [];
  }
};

const initialState = {
  items: getInitialItems(),
};

function cartReducer(state, action) {
  let updatedItems;

  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        updatedItems = state.items.map(i =>
          i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return { ...state, items: updatedItems };
    }
    case 'REMOVE_ITEM':
      updatedItems = state.items.filter(i => i._id !== action.payload);
      return { ...state, items: updatedItems };
    case 'UPDATE_QUANTITY':
      updatedItems = state.items.map(i =>
        i._id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      );
      return { ...state, items: updatedItems };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist cart under user-specific key
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (book) => dispatch({ type: 'ADD_ITEM', payload: book });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeItem(id);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  // Called on logout — clears cart state and removes from localStorage
  const clearCart = () => {
    localStorage.removeItem(getCartKey());
    dispatch({ type: 'CLEAR_CART' });
  };

  // Called on login — loads the cart for the newly logged-in user
  const loadUserCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(getCartKey())) || [];
      dispatch({ type: 'LOAD_CART', payload: saved });
    } catch {
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      loadUserCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
