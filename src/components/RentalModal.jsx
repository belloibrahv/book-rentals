import { useEffect, useState } from 'react';
import { useRental } from '../context/RentalContext';


// Card type detection utility
const detectCardType = (cardNumber) => {
  const cardPatterns = [
      { type: 'visa', regex: /^4/, icon: '💳' },
      { type: 'mastercard', regex: /^5[1-5]/, icon: '💳' },
      { type: 'amex', regex: /^3[47]/, icon: '💳' },
      { type: 'discover', regex: /^6(?:011|5)/, icon: '💳' },
  ];
  const detectedCard = cardPatterns.find(card => 
      cardNumber.match(card.regex)
  );
  return detectedCard || { type: 'unknown', icon: '💳' };
};

const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();

  // State for payment methods
  const [payNow, setPayNow] = useState(false);
  const [payLater, setPayLater] = useState(false);
  const [cardType, setCardType] = useState(null);
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
  const [paymentErrors, setPaymentErrors] = useState({});

  // Load booking results and current booking info from localStorage on mount
  useEffect(() => {
    // Retrieve booking results from localStorage
      const storedBookingResults = localStorage.getItem('bookingResults');
      window.bookingResults = storedBookingResults 
          ? JSON.parse(storedBookingResults) 
          : [];

      // Retrieve current booking info from localStorage
      const storedCurrentBookingInfo = localStorage.getItem('currentBookingInfo');
      window.currentBookingInfo = storedCurrentBookingInfo
          ? JSON.parse(storedCurrentBookingInfo)
          : { isInFinalPage: false };
  }, []);

    // Validate payment details
    const handlePaymentValidation = () => {
      const errors = {};

      // Only validate if Pay Now is selected
      if (payNow) {
          // Card number validation
          if (!formData.cardNumber || formData.cardNumber.length < 13) {
              errors.cardNumber = 'Invalid card number';
          }

          // Expiry date validation
          const today = new Date();
          const [month, year] = formData.expiryDate.split('/').map(Number);
          const expiryDate = new Date(2000 + year, month - 1);
          if (!formData.expiryDate || expiryDate <= today) {
              errors.expiryDate = 'Invalid expiry date';
          }

          // CVV validation
          if (!formData.cvv || formData.cvv.length < 3) {
              errors.cvv = 'Invalid CVV';
          }
      }

      setPaymentErrors(errors);
      return Object.keys(errors).length === 0;
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

    // Update current booking info in real-time
    useEffect(() => {
      if (isCurrentlyBooking) {
          const currentBookingInfo = {
              ...formData,
              book: {
                  title: book.title,
                  id: book.id,
              },
              payNow,
              payLater,
              isInFinalPage: true,
          };
          
          window.currentBookingInfo = currentBookingInfo;
          localStorage.setItem('currentBookingInfo', JSON.stringify(currentBookingInfo));
      } else {
          window.currentBookingInfo = { isInFinalPage: false };
          localStorage.removeItem('currentBookingInfo');
      }
  }, [formData, payNow, payLater, book, isCurrentlyBooking]);

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
      
    // Validate dates and payment details
    if (!handleDateValidation() || !handlePaymentValidation()) {
      return;
    }

    // Prepare booking result
    const bookingResult = {
        book: {
            title: book.title,
        },
        user: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            collectiondate: formData.collectiondate,
            returndate: formData.returndate,
            payNow,
            payLater,
            paymentDetails: payNow
                ? {
                      cardNumber: formData.cardNumber,
                      expiryDate: formData.expiryDate,
                      cvv: formData.cvv,
                  }
                : null,
        },
    };

    // Add to booking results and save to localStorage
    window.bookingResults.push(bookingResult);
    localStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));

    // Rent the book using the new payment logic
    rentBook(book, bookingResult.user, payNow ? 'now' : 'later');

    // Reset booking state
    setIsCurrentlyBooking(false);
    onComplete();
  };

  // Payment method handler
  const handlePaymentMethodChange = (method) => {
      setPayNow(method === 'now');
      setPayLater(method === 'later');
  };

  // Handle input changes
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));

      // Detect card type when card number is entered
      if (name === 'cardNumber') {
          setCardType(detectCardType(value));
      }
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
                checked={payNow}
                onChange={() => handlePaymentMethodChange('now')}
            />
              Pay Now
            </label>
            <label>
            <input
                type="radio"
                name="payment"
                value="later"
                checked={payLater}
                onChange={() => handlePaymentMethodChange('later')}
            />
              Pay Later
            </label>
          </div>
          {payNow && (
            <div className="payment-details">
              <div className="card-icons">
                {['visa', 'mastercard', 'amex', 'discover'].map(type => (
                  <span 
                    key={type} 
                    className={`card-icon ${cardType?.type === type ? 'active' : ''}`}
                  >
                    {type === 'visa' && '💳'}
                    {type === 'mastercard' && '💳'}
                    {type === 'amex' && '💳'}
                    {type === 'discover' && '💳'}
                  </span>
                ))}
              </div>
              
              <div className="form-group">
                <label>Card Number:</label>
                <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                />
                {cardType && <span>{cardType.icon} {cardType.type}</span>}
                {paymentErrors.cardNumber && <p className="error">{paymentErrors.cardNumber}</p>}
              </div>
              
              <div className="payment-row">
                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                  />
                  {paymentErrors.expiryDate && <p className="error">{paymentErrors.expiryDate}</p>}
                </div>
                
                <div className="form-group">
                  <label>CVV:</label>
                  <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                  />
                    {paymentErrors.cvv && <p className="error">{paymentErrors.cvv}</p>}
                </div>
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
