import { useEffect } from 'react';
import { useRental } from '../context/RentalContext';
import { formatDate } from '../utils/rentalUtils';

const MyRentals = () => {
  const { rentals } = useRental();

  useEffect(() => {
    // Ensure window.currentBookingInfo is always defined
    window.currentBookingInfo = { isInFinalPage: false };
  }, []);

  // Fallback for rentals
  const displayedRentals = rentals.length > 0 ? rentals : window.bookingResults || [];

  return (
    <div className="my-rentals">
      <h1>My Rented Books</h1>
      {displayedRentals.length === 0 ? (
        <p>{"You haven't rented any books yet."}</p>
      ) : (
        <div className="rented-books-list">
          {displayedRentals.map((rental, index) => {
            return (
              <div key={index} className="rental-item">
                {rental.bookDetails.cover ? (
                  <img
                    src={rental.bookDetails.cover}
                    alt={rental.bookDetails.title}
                    className="rental-cover"
                  />
                ) : (
                  <p>No cover available</p>
                )}
                <div className="rental-info">
                  <h3>{rental.bookDetails.title}</h3>
                  <p>Rented by: {rental.userDetails.name}</p>
                  <p>Collection Date: {formatDate(rental.rentalDetails.collectionDate)}</p>
                  <p>Return Date: {formatDate(rental.rentalDetails.returnDate)}</p>
                  <p className={`payment-status ${rental.paymentDetails.paymentMode.payNow ? 'paid' : 'pending'}`}>
                    Payment Status: {rental.paymentDetails.paymentMode.payNow ? 'Paid' : 'Pay Later'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
