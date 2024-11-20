import React, { createContext, useContext, useReducer, useState } from 'react';

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
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);

  const rentBook = (book, userData, paymentMethod) => {
    const rental = {
      id: rentals.length + 1,
      book,
      user: userData,
      paymentMethod,
      rentDate: new Date(),
      collectionDate: userData.collectiondate,
      returnDate: userData.returndate,
      paymentStatus: paymentMethod === 'now' ? 'paid' : 'pending',
    };
  
    // Update state
    setRentals([...rentals, rental]);
  
    // Add to global booking results
    // if (!window.bookingResults) {
      // window.bookingResults = []
    // }
    // window.bookingResults.push(rental);
    // window.bookingResults = rentBook
  };
  
  return (
    <RentalContext.Provider value={{ rentals, rentBook }}>
      {children}
    </RentalContext.Provider>
  );
};


// Custom hook for using the rental context
export function useRental() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}
