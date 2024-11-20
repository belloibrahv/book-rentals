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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (returnDate <= collection) {
        setDateError('Return date must be later than collection date.');
        return false;
      }

      if (returnDate < today) {
        setDateError('Return date cannot be in the past.');
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
      returndate: prev.returndate && new Date(prev.returndate) <= new Date(collectionDate)
        ? ''
        : prev.returndate
    }));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare user data
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      collectiondate: formData.collectiondate,
      returndate: formData.returndate,
    };

    // Prepare user info with payment details
    const userInfoWithoutPayment = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      paymentMethod: paymentMethod,
    };

    const userInfoWithPayment = paymentMethod === 'now' 
      ? { 
          ...userInfoWithoutPayment, 
          paymentDetails: {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          }
        }
      : userInfoWithoutPayment;

    // Prepare booking result
    const bookingResult = {
      book: {
        title: book.title,
        id: book.id
      },
      user: userInfoWithPayment
    };

    // Add current booking to bookingResults
    window.bookingResults.push(bookingResult);

    // Perform book rental
    rentBook(book, userData, paymentMethod);

    // Clear current booking info
    window.currentBookingInfo = null;
    setIsCurrentlyBooking(false);
    onComplete();
  };

  // Close handler
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
              min={today}
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
