import { useRental } from '../context/RentalContext';
import { formatDate } from '../utils/rentalUtils';

const MyRentals = () => {
  const { rentals } = useRental();

  return (
    <div className="my-rentals">
      <h1>My Rented Books</h1>
      {rentals.length === 0 ? (
        <p>{"You haven't rented any books yet."}</p>
      ) : (
        <div className="rented-books-list">
          {rentals.map((rental, index) => (
            <div key={index} className="rental-item">
              <img
                src={rental.bookDetails.cover}
                alt={rental.bookDetails.title}
                className="rental-cover"
              />
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
