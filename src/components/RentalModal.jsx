import { useEffect, useState } from 'react';
import { useRental } from '../context/RentalContext';

const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();
  const [paymentMethod, setPaymentMethod] = useState('later');
  const [isCurrentlyBooking, setIsCurrentlyBooking] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    collectiondate: '',
    returndate: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [dateError, setDateError] = useState('');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Track booking information in window variables
  useEffect(() => {
    // Initialize bookingResults array if not exists
    if (!window.bookingResults) {
      window.bookingResults = [];
    }

    // Update current booking info in real-time
    if (isCurrentlyBooking) {
      window.currentBookingInfo = {
        ...formData,
        book: {
          title: book.title,
          id: book.id,
        },
        paymentMethod,
        isInFinalPage: true,
      };
    } else {
      // Reset booking info when not in booking process
      window.currentBookingInfo = {
        isInFinalPage: false
      };
    }
  }, [formData, paymentMethod, book, isCurrentlyBooking]);

  // Date validation logic
  const handleDateValidation = () => {
    const { collectiondate, returndate } = formData;
    if (collectiondate && returndate) {
      const collection = new Date(collectiondate);
      const returnDate = new Date(returndate);
  
      // Validate return date is on or after collection date
      if (returnDate < collection) {
        setDateError('Return date must be on or after collection date.');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  // Collection date change handler
  const handleCollectionDateChange = (e) => {
    const collectionDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      collectiondate: collectionDate,
      // Reset return date if it's before the new collection date
      returndate: prev.returndate && new Date(prev.returndate) < new Date(collectionDate)
        ? collectionDate
        : prev.returndate
    }));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handleDateValidation()) return;

    const bookingResult = {
      book: {
        title: book.title,
        id: book.id,
      },
      user: {
        ...formData,
        paymentMethod,
        paymentDetails:
          paymentMethod === 'now'
            ? {
                cardNumber: formData.cardNumber,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
              }
            : null,
      },
    };

    window.bookingResults.push(bookingResult);

    rentBook(book, bookingResult.user, paymentMethod);

    window.currentBookingInfo = null;
    setIsCurrentlyBooking(false);
    onComplete();
  };

  const handleClose = () => {
    setIsCurrentlyBooking(false);
    window.currentBookingInfo = { isInFinalPage: false };
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Rent {book.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Collection Date:</label>
            <input
              type="date"
              required
              value={formData.collectiondate}
              onChange={handleCollectionDateChange}
              onBlur={handleDateValidation}
            />
          </div>
          <div className="form-group">
            <label>Return Date:</label>
            <input
              type="date"
              required
              min={formData.collectiondate || today}
              value={formData.returndate}
              onChange={(e) => setFormData({ ...formData, returndate: e.target.value })}
              onBlur={handleDateValidation}
            /> 
          </div>
          {dateError && <p className="error-text">{dateError}</p>} {/* Display validation error */}
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="now"
                min={formData.collectiondate || today} // Dynamic minimum date
                checked={paymentMethod === 'now'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay Now
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="later"
                checked={paymentMethod === 'later'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay Later
            </label>
          </div>
          {paymentMethod === 'now' && (
            <div className="payment-details">
              <div className="form-group">
                <label>Card Number:</label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Expiry Date:</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>CVV:</label>
                <input
                  type="text"
                  required
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData({ ...formData, cvv: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="submit-button">
              Complete Rental
            </button>
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalModal;
