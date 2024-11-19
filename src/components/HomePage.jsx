import { Link } from 'react-router-dom';
import { books } from '../data/books';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1 className="text-3xl font-bold text-center my-8">Welcome to BookRental</h1>
      <div className="books-grid">
        {books.map(book => (
          <Link to={`/book/${book.id}`} key={book.id} className="book-card">
            <div className="book-image-container">
              <img 
                src={book.cover} 
                alt={book.title}
                className="book-cover"
                loading="lazy"
              />
            </div>
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p className="book-price">${book.rentPrice.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
