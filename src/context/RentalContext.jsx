import React, { createContext, useContext, useState } from 'react';

// Provider Component
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);
  
  const rentBook = (book, userData, paymentMethod) => {
    // Ensure book cover is preserved
    const rental = {
      bookDetails: {
        id: book.id,
        title: book.title,
        cover: book.cover || 'path/to/default/book/image.jpg', // Fallback cover
        author: book.author || 'Unknown Author', // Fallback author
      },
      userDetails: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
      },
      rentalDetails: {
        // Convert to string in consistent DD-MM-YYYY format if not already
        collectionDate: typeof userData.collectiondate === 'string' 
          ? userData.collectiondate 
          : userData.collectiondate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(/\//g, '-'),
        returnDate: typeof userData.returndate === 'string'
          ? userData.returndate
          : userData.returndate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(/\//g, '-'),
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
    
    // Update state 
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

// Create the context
const RentalContext = createContext();

// Custom hook for using the rental context
export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};