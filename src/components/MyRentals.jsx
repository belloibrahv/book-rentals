import { useEffect } from 'react';
import { useRental } from '../context/RentalContext';
import { books } from '../data/books'; // Centralized book data with covers
import { formatDate } from '../utils/rentalUtils';
import NoCover from '../assets/images/no-cover.png';

const MyRentals = () => {
  const { rentals } = useRental();

  useEffect(() => {
    // Ensure window.currentBookingInfo is always defined
    window.currentBookingInfo = { isInFinalPage: false };
  }, []);

  // Fallback for rentals
  const displayedRentals = rentals.length > 0 ? rentals : window.bookingResults || [];

  // Get the cover image for a book by title or ID
  const getCoverImage = (titleOrId) => {
    const book = books.find((b) => b.title === titleOrId || b.id === titleOrId);
    return book ? book.cover : NoCover;
  };

  return (
    <div className="my-rentals">
      <h1>My Rented Books</h1>
      {displayedRentals.length === 0 ? (
        <p>{"You haven't rented any books yet."}</p>
      ) : (
        <div className="rented-books-list">
          {displayedRentals.map((rental, index) => (
            <div key={index} className="rental-item">
              <img
                src={getCoverImage(rental.bookDetails.title || rental.bookDetails.id)}
                alt={rental.bookDetails.title || 'No Title'}
                className="rental-cover"
              />
              <div className="rental-info">
                <h3>{rental.bookDetails.title || 'Unknown Title'}</h3>
                <p>Rented by: {rental.userDetails.name}</p>
                <p>Collection Date: {formatDate(rental.rentalDetails.collectionDate)}</p>
                <p>Return Date: {formatDate(rental.rentalDetails.returnDate)}</p>
                <p
                  className={`payment-status ${
                    rental.paymentDetails.paymentMode.payNow ? 'paid' : 'pending'
                  }`}
                >
                  Payment Status: {rental.paymentDetails.paymentMode.payNow ? 'Paid' : 'Pay Later'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
