import { useEffect, useState } from 'react';
import { useRental } from '../context/RentalContext';
import { CreditCard, Lock } from 'lucide-react';


const cardValidations = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
};


const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();
  const [cardType, setCardType] = useState(null);
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
  const [formErrors, setFormErrors] = useState({});

  const detectCardType = (number) => {
    for (const [type, regex] of Object.entries(cardValidations)) {
      if (regex.test(number.replace(/\s/g, ''))) {
        return type;
      }
    }
    return null;
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    const type = detectCardType(cleanNumber);
    setCardType(type);
    
    if (!type) {
      return 'Invalid card number';
    }
    return null;
  };

  const validateExpiryDate = (date) => {
    const [month, year] = date.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!/^\d{2}\/\d{2}$/.test(date)) {
      return 'Invalid date format (MM/YY)';
    }

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear || 
        (expYear === currentYear && expMonth < currentMonth)) {
      return 'Card has expired';
    }
    return null;
  };

  const validateCVV = (cvv) => {
    const cvvRegex = /^[0-9]{3,4}$/;
    return cvvRegex.test(cvv) ? null : 'Invalid CVV';
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    const error = validateCardNumber(value);
    
    setFormData(prev => ({
      ...prev, 
      cardNumber: value
    }));

    setFormErrors(prev => ({
      ...prev,
      cardNumber: error
    }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = `${value.slice(0,2)}/${value.slice(2)}`;
    }

    const error = validateExpiryDate(value);
    
    setFormData(prev => ({
      ...prev, 
      expiryDate: value
    }));

    setFormErrors(prev => ({
      ...prev,
      expiryDate: error
    }));
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const error = validateCVV(value);
    
    setFormData(prev => ({
      ...prev, 
      cvv: value
    }));

    setFormErrors(prev => ({
      ...prev,
      cvv: error
    }));
  };

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
                  pattern="[0-9\s]{13,19}"
                  min="16"
                  max="19"
                  placeholder="xxxx xxxx xxxx xxxx"
                  required
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
            <>
            <div className="payment-header">
              <h2>Payment Details</h2>
              <div className="card-icons">
                <CreditCard 
                  color={cardType === 'visa' ? '#1434CB' : '#666'}
                  size={24} 
                  className={cardType === 'visa' ? 'active-card' : ''}
                />
                <CreditCard 
                  color={cardType === 'mastercard' ? '#EB001B' : '#666'}
                  size={24} 
                  className={cardType === 'mastercard' ? 'active-card' : ''}
                />
                <CreditCard 
                  color={cardType === 'amex' ? '#2E77BB' : '#666'}
                  size={24} 
                  className={cardType === 'amex' ? 'active-card' : ''}
                />
                <CreditCard 
                  color={cardType === 'discover' ? '#F68B1F' : '#666'}
                  size={24} 
                  className={cardType === 'discover' ? 'active-card' : ''}
                />
              </div>
            </div>
            <div className="payment-details">
              <div className="form-group">
                <label>Card Number</label>
                <div className="input-with-icon">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                {formErrors.cardNumber && 
                  <p className="error-text">{formErrors.cardNumber}</p>
                }
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  {formErrors.expiryDate && 
                    <p className="error-text">{formErrors.expiryDate}</p>
                  }
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={handleCVVChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  {formErrors.cvv && 
                    <p className="error-text">{formErrors.cvv}</p>
                  }
                </div>
              </div>
            </div>
            
            </>
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
