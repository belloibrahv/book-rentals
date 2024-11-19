import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RentalProvider } from './context/RentalContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import BookDetails from './components/BookDetails';
import MyRentals from './components/MyRentals';
import './styles/main.css';

function App() {
  return (
    <RentalProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/my-rentals" element={<MyRentals />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RentalProvider>
  );
}

export default App;
