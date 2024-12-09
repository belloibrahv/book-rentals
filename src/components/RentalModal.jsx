import { useEffect, useState } from 'react';
import { useRental } from '../context/RentalContext';

const FROZEN_DATE = new Date('2024-01-01');

// Card type detection utility
const detectCardType = (cardNumber) => {
  const cardPatterns = [
    { type: 'visa', regex: /^4/, icon: '💳' },
    { type: 'mastercard', regex: /^5[1-5]/, icon: '💳' },
    { type: 'amex', regex: /^3[47]/, icon: '💳' },
    { type: 'discover', regex: /^6(?:011|5)/, icon: '💳' },
  ];
  const detectedCard = cardPatterns.find((card) => cardNumber.match(card.regex));
  return detectedCard || { type: 'unknown', icon: '💳' };
};

const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();

  // State for payment methods
  const [payNow, setPayNow] = useState(false);
  const [payLater, setPayLater] = useState(true);
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

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19 ? null : 'Invalid card number length';
  };
  
  const validateExpiryDate = (expiry) => {
    const [month, year] = expiry.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000; // Adjust for 2-digit years
  
    if (expMonth < 1 || expMonth > 12) {
      return 'Invalid month';
    }
  
    // Allow both past and present dates
    if (expYear < 2024 || (expYear === 2024 && expMonth < 1)) {
      return null; // Accept expired cards
    }
  
    return null;
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv) ? null : 'Invalid CVV length';
  };

  // Handle card number change with formatting and type detection
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Strip non-digit characters
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Format as 1234 5678
  
    const detectedCard = detectCardType(value); // Detect the card type
    setCardType(detectedCard); // Update card type state
  
    setFormData((prev) => ({
      ...prev,
      cardNumber: formattedValue,
    }));
  };

  // Comprehensive payment validation
  const handlePaymentValidation = () => {
    const errors = {};

    if (payNow) {
      const cardNumberError = validateCardNumber(formData.cardNumber.replace(/\s/g, ''));
      const expiryError = validateExpiryDate(formData.expiryDate);
      const cvvError = validateCVV(formData.cvv);

      if (cardNumberError) errors.cardNumber = cardNumberError;
      if (expiryError) errors.expiryDate = expiryError;
      if (cvvError) errors.cvv = cvvError;
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const storedBookingResults = sessionStorage.getItem('bookingResults');
    window.bookingResults = storedBookingResults ? JSON.parse(storedBookingResults) : [];
  }, []);

  useEffect(() => {
    window.currentBookingInfo = { ...window.currentBookingInfo, isInFinalPage: true };
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, []);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Update current booking info in real-time
  useEffect(() => {
    const currentBookingInfo = {
      bookDetails: {
        id: book.id,
        title: book.title
      },
      userDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      rentalDetails: {
        collectionDate: formData.collectiondate,
        returnDate: formData.returndate,
      },
      paymentDetails: {
        paymentMode: {
          payNow,
          payLater,
        },
        cardDetails: payNow
          ? {
              cardNumber: formData.cardNumber,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
            }
          : null,
      },
    };
  
    window.currentBookingInfo = currentBookingInfo;
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(currentBookingInfo));
  }, [formData, payNow, payLater, book]);
    

  const handleDateValidation = () => {
    const { collectiondate, returndate } = formData;
    if (collectiondate && returndate) {
      const collection = new Date(collectiondate);
      const returnDate = new Date(returndate);
  
      if (returnDate <= collection) {
        setDateError('Return date must be after collection date.');
        return false;
      }
    }
    setDateError('');
    return true;
  };  

    // Collection date change handler - No restrictions on past dates
    const handleCollectionDateChange = (e) => {
      const collectionDate = e.target.value;
      setFormData(prev => ({
        ...prev,
        collectiondate: collectionDate,
        // Reset return date if it's not after the new collection date
        returndate: prev.returndate && new Date(prev.returndate) <= new Date(collectionDate)
          ? '' // Clear return date if not valid
          : prev.returndate
      }));
    };

  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const bookingResult = {
      bookDetails: {
        title: book.title,
      },
      userDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      rentalDetails: {
        collectionDate: formData.collectiondate,
        returnDate: formData.returndate,
      },
      paymentDetails: {
        paymentMode: {
          payNow,
          payLater,
        },
        cardDetails: payNow
          ? {
              cardNumber: formData.cardNumber,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
            }
          : null,
      },
    };
  
    const isDuplicate = window.bookingResults.some((entry) => 
      entry.bookDetails.title === bookingResult.bookDetails.title &&
      entry.userDetails.email === bookingResult.userDetails.email &&
      entry.rentalDetails.collectionDate === bookingResult.rentalDetails.collectionDate
    );
  
    if (!isDuplicate) {
      window.bookingResults.push(bookingResult);
      sessionStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
    }
  
    sessionStorage.removeItem('currentBookingInfo');
    onComplete();
  };
  

  // Payment method handler
  const handlePaymentMethodChange = (method) => {
    setPayNow(method === 'now');
    setPayLater(method === 'later');
  };

  const handleClose = () => {
    window.currentBookingInfo = { isInFinalPage: false };
    sessionStorage.removeItem('currentBookingInfo');
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
            />
          </div>
          <div className="form-group">
            <label>Return Date:</label>
            <input
              type="date"
              required
              min={formData.collectiondate || ''}
              value={formData.returndate}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                returndate: e.target.value,
              }))}
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
              {cardType?.type && (
                <span className={`card-icon active`}>
                  {cardType.icon}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Card Number:</label>
              <input
                type="text"
                required
                maxLength="19"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
              />
              {paymentErrors.cardNumber && (
                <p className="error-text">{paymentErrors.cardNumber}</p>
              )}
            </div>
            
            <div className="payment-row">
              <div className="form-group">
                <label>Expiry Date:</label>
                <input
                  type="text"
                  required
                  maxLength="5"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    const formatted = value.length > 2 
                      ? `${value.slice(0,2)}/${value.slice(2)}` 
                      : value;
                    setFormData(prev => ({ ...prev, expiryDate: formatted }));
                  }}
                  placeholder="MM/YY"
                />
                {paymentErrors.expiryDate && (
                  <p className="error-text">{paymentErrors.expiryDate}</p>
                )}
              </div>
              
              <div className="form-group">
                <label>CVV:</label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setFormData(prev => ({ ...prev, cvv: value }));
                  }}
                  placeholder="123"
                />
                {paymentErrors.cvv && (
                  <p className="error-text">{paymentErrors.cvv}</p>
                )}
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
