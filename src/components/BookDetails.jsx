import { useParams, useNavigate } from 'react-router-dom';
import { books } from '../data/books';
import RentalModal from './RentalModal';
import { useState } from 'react';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  const book = books.find(b => b.id === parseInt(id));
  
  if (!book) return <div>Book not found</div>;
  
  return (
    <div className="book-details">
      <img src={book.cover} alt={book.title} className="book-cover-large" />
      <div className="book-info-detailed">
        <h1>{book.title}</h1>
        <h2>{book.author}</h2>
        <p className="summary">{book.summary}</p>
        <p className="price">Rental Price: ${book.rentPrice}</p>
        <button 
          className="rent-button"
          onClick={() => setShowModal(true)}
        >
          Rent Book
        </button>
      </div>
      {showModal && (
        <RentalModal 
          book={book} 
          onClose={() => setShowModal(false)}
          onComplete={() => navigate('/my-rentals')}
        />
      )}
    </div>
  );
};

export default BookDetails;
