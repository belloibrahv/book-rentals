import React, { createContext, useContext, useState } from 'react';

// Provider Component
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);

  const rentBook = (book, userData, paymentMethod) => {
    const rental = {
      bookDetails: {
        id: book.id,
        title: book.title,
        cover: book.cover
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
  
    // Update rentals and localStorage
    setRentals((prevRentals) => {
      const updatedRentals = [...prevRentals, rental];
      // window.bookingResults.push(rental);
      localStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
      return updatedRentals;
    });
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