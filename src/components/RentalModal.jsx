import { useEffect, useState } from 'react';
import { useRental } from '../context/RentalContext';

const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();
  const [paymentMethod, setPaymentMethod] = useState('later');
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
  const [dateError, setDateError] = useState(''); // Validation message for dates
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Tracking booking exploration and results
  useEffect(() => {
    // Initialize or update window.currentBookingInfo
    window.currentBookingInfo = {
      ...formData,
      book: {
        title: book.title,
        id: book.id,
      },
      paymentMethod,
      isInFinalPage: true,
    };

  }, [formData, paymentMethod, book]);


  const handleDateValidation = () => {
    const { collectiondate, returndate } = formData;
    if (collectiondate && returndate) {
      const collection = new Date(collectiondate);
      const returnDate = new Date(returndate);

      if (returnDate <= collection) {
        setDateError('Return date must be later than collection date.');
        return false;
      }
    }
    setDateError(''); // Clear error if validation passes
    return true;
  };

  const handleCollectionDateChange = (e) => {
    const collectionDate = e.target.value;
    setFormData(prev => ({
      ...prev, 
      collectiondate: collectionDate,
      // Reset return date if it's before or equal to new collection date
      returndate: prev.returndate <= collectionDate ? '' : prev.returndate
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      collectiondate: formData.collectiondate,
      returndate: formData.returndate,
    };

    if (paymentMethod === 'now') {
      userData.paymentDetails = {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      };
    }

    const userInfoWithoutPayment =  {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      paymentMethod: paymentMethod,
    }
    const userInfoWithPayment =  {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      paymentMethod: paymentMethod,
      paymentDetails: userData?.paymentDetails
    }

    const userDetails = paymentMethod == 'now' ? userInfoWithPayment : userInfoWithoutPayment;  
    // Prepare booking results
    const bookingResult = {
      book: {
        title: book.title
      },
      user: userDetails
    };
    
    window.bookingResults;
    window.bookingResults = bookingResult;
    // Initialize bookingResults array if not exists
    // if (!window.bookingResults) {
    // }

    // Add current booking to results
    // window.bookingResults.push(bookingResult);

    // Log booking results
    console.log('Booking Results:', window.bookingResults);

    // Perform book rental
    rentBook(book, userData, paymentMethod);

    // Clear current booking info on submission
    window.currentBookingInfo = null;
    
    onComplete();
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
              min={today} // Prevent selecting past date
              value={formData.collectiondate}
              onChange={handleCollectionDateChange}
              onBlur={handleDateValidation} // Validate when user leaves the field
            />
          </div>
          <div className="form-group">
            <label>Return Date:</label>
            <input
              type="date"
              required
              value={formData.returndate || today} // Prevent selecting date before collection date
              onChange={(e) =>
                setFormData({ ...formData, returndate: e.target.value })
              }
              onBlur={handleDateValidation}
              disabled={!formData.collectiondate} // Disable until collection date is selected
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
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalModal;
