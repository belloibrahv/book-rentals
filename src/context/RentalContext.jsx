import React, { createContext, useContext, useState } from 'react';

// Create the context
const RentalContext = createContext();

// Provider Component
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);

  const rentBook = (book, userData, paymentMethod) => {
    const rental = {
      bookDetails: {
        id: book.id,
        title: book.title,
        cover: book.cover, // Add cover for MyRentals component
      },
      userDetails: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
      },
      rentalDetails: {
        collectionDate: userData.collectiondate,
        returnDate: userData.returndate,
        rentalPrice: book.rentPrice,
      },
      paymentDetails: {
        paymentMode: {
          payNow: paymentMethod === 'now',
          payLater: paymentMethod === 'later',
        },
        cardDetails: paymentMethod === 'now'
          ? {
              cardNumber: userData.cardNumber,
              expiryDate: userData.expiryDate,
              cvv: userData.cvv,
            }
          : null,
      },
    };

    // Update state (for managing in context)
    setRentals(prevRentals => [...prevRentals, rental]);

    // Initialize bookingResults if it does not exist
    if (!window.bookingResults) {
      window.bookingResults = [];
    }
  
    // Push new rental into bookingResults
    window.bookingResults.push(rental);
  };
  
  return (
    <RentalContext.Provider value={{ rentals, rentBook }}>
      {children}
    </RentalContext.Provider>
  );
};

// Custom hook for using the rental context
export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};