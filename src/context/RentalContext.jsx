import React, { createContext, useContext, useReducer } from 'react';

const RentalContext = createContext();

// Action Types
const ADD_RENTAL = 'ADD_RENTAL';
const UPDATE_RENTAL = 'UPDATE_RENTAL';

// Initial State
const initialState = {
  rentals: [],
  currentUser: null  // We'll use this for storing user details after rental
};

// Reducer
function rentalReducer(state, action) {
  switch (action.type) {
    case ADD_RENTAL:
      return {
        ...state,
        rentals: [...state.rentals, {
          ...action.payload,
          id: Date.now(),
          rentDate: new Date(),
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days rental period
        }]
      };
    case UPDATE_RENTAL:
      return {
        ...state,
        rentals: state.rentals.map(rental =>
          rental.id === action.payload.id ? { ...rental, ...action.payload } : rental
        )
      };
    default:
      return state;
  }
}

// Provider Component
export function RentalProvider({ children }) {
  const [state, dispatch] = useReducer(rentalReducer, initialState);

  // Action Creators
  const rentBook = (bookData, userData, paymentMethod) => {
    dispatch({
      type: ADD_RENTAL,
      payload: {
        book: bookData,
        user: userData,
        paymentStatus: paymentMethod === 'now' ? 'paid' : 'pending',
        status: 'active'
      }
    });
  };

  const updateRental = (rentalId, updates) => {
    dispatch({
      type: UPDATE_RENTAL,
      payload: { id: rentalId, ...updates }
    });
  };

  return (
    <RentalContext.Provider value={{
      rentals: state.rentals,
      currentUser: state.currentUser,
      rentBook,
      updateRental
    }}>
      {children}
    </RentalContext.Provider>
  );
}

// Custom hook for using the rental context
export function useRental() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}
