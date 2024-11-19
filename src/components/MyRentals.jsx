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
          {rentals.map((rental) => (
            <div key={rental.id} className="rental-item">
              <img
                src={rental.book.cover}
                alt={rental.book.title}
                className="rental-cover"
              />
              <div className="rental-info">
                <h3>{rental.book.title}</h3>
                <p>Rented by: {rental.user.name}</p>
                <p>Collection Date: {formatDate(rental.collectionDate)}</p>
                <p>Return Date: {formatDate(rental.returnDate)}</p>
                <p className={`payment-status ${rental.paymentStatus}`}>
                  Payment Status: {rental.paymentStatus}
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
