import { createContext, useContext, useEffect, useState } from 'react';

// Provider Component
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const storedRentals = sessionStorage.getItem('bookingResults');
    const parsedRentals = storedRentals ? JSON.parse(storedRentals) : [];
    window.bookingResults = parsedRentals.length > 0 ? parsedRentals : [];
    setRentals(parsedRentals);
  }, []);

  const rentBook = (book, userData, paymentMethod) => {
    const rental = {
      bookDetails: {
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

    // Update rentals and sessionStorage
    setRentals((prevRentals) => {
      const updatedRentals = [...prevRentals, rental];
      sessionStorage.setItem('bookingResults', JSON.stringify(updatedRentals));
      window.bookingResults = updatedRentals; // Update global variable
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
