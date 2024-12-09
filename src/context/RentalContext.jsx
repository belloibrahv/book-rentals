import { createContext, useContext, useEffect, useState } from 'react';

// Provider Component
export const RentalProvider = ({ children }) => {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const storedBookings = sessionStorage.getItem('bookingResults');
    const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];
    window.bookingResults = parsedBookings;
    setRentals(parsedBookings);
  }, []);
  
  const rentBook = (book, userData, paymentMethod) => {
    const newRental = {
      bookDetails: {
        title: book.title,
        id: book.id, // Use id as a unique identifier
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
  
    const updatedRentals = [...rentals, newRental];
    setRentals(updatedRentals);
    sessionStorage.setItem('bookingResults', JSON.stringify(updatedRentals));
    window.bookingResults = updatedRentals;
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
