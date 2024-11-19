import { useState } from 'react';
import { useRental } from '../context/RentalContext';

const RentalModal = ({ book, onClose, onComplete }) => {
  const { rentBook } = useRental();
  const [paymentMethod, setPaymentMethod] = useState('later');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };

    if (paymentMethod === 'now') {
      userData.paymentDetails = {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv
      };
    }

    rentBook(book, userData, paymentMethod);
    onComplete();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Rent {book.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="now"
                checked={paymentMethod === 'now'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              Pay Now
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="later"
                checked={paymentMethod === 'later'}
                onChange={e => setPaymentMethod(e.target.value)}
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
                  onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date:</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>CVV:</label>
                <input
                  type="text"
                  required
                  value={formData.cvv}
                  onChange={e => setFormData({...formData, cvv: e.target.value})}
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
