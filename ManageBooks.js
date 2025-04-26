import React, { useState, useEffect } from 'react';
import './ManageBooks.css';

function ManageBooks() {
  const [activeTab, setActiveTab] = useState('addBook');
  const [books, setBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [noReviewsFound, setNoReviewsFound] = useState(false);

  const [newBook, setNewBook] = useState({
    Title: '',
    Author_Id: '',
    Category_Id: '',
    ISBN: '',
    Publication_Year: '',
    File_Format: '',
    Subscription_Type: '1',
    Uploaded_By: '',
    Image: '',
    URL: '',
  });

  const [searchEbookId, setSearchEbookId] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:5000/Ebooks');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      alert('Error fetching books');
      console.error(error);
    }
  };

  const fetchTopRecommended = async () => {
    try {
      const res = await fetch('http://localhost:5000/top-3-recommended-books');
      const data = await res.json();
      setTopBooks(data);
    } catch (error) {
      console.error('Error fetching top recommended books:', error);
    }
  };

  const fetchReviews = async (EbookId) => {
    try {
      const res = await fetch(`http://localhost:5000/reviews/${EbookId}`);
      const data = await res.json();
      if (data.length === 0) {
        setReviews([]);
        setNoReviewsFound(true);
      } else {
        setReviews(data);
        setNoReviewsFound(false);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setNoReviewsFound(true);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTopRecommended();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const addBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/Ebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });

      if (res.ok) {
        alert('Book added successfully! 📚✨');
        setNewBook({
          Title: '',
          Author_Id: '',
          Category_Id: '',
          ISBN: '',
          Publication_Year: '',
          File_Format: '',
          Subscription_Type: '1',
          Uploaded_By: '',
          Image: '',
          URL: '',
        });
        fetchBooks();
      } else {
        alert('Error adding book 😞');
      }
    } catch (error) {
      alert('Error adding book 😞');
      console.error(error);
    }
  };

  const deleteBook = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this book? 📚❌');
    if (!confirmDelete) return;

    setBooks(books.filter(book => book.Ebook_Id !== id));

    fetch(`http://localhost:5000/Ebooks/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          alert('Book deleted successfully! 🗑️');
        } else {
          alert('Error deleting book from backend. 😞');
        }
      })
      .catch((error) => {
        console.error('Error deleting book from backend:', error);
      });
  };

  const handleSearchReviews = () => {
    if (searchEbookId) {
      fetchReviews(searchEbookId);
    }
  };

  return (
    <div className="manage-books-container">
      <h2>📚 Manage Books Dashboard</h2>

      {/* Tabs */}
      <div className="tabs">
        {['addBook', 'deleteBook', 'topBooks', 'searchReviews'].map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'addBook' && '➕ Add New Book'}
            {tab === 'deleteBook' && '🗑️ Delete Book'}
            {tab === 'topBooks' && '🌟 Top 3 Recommended'}
            {tab === 'searchReviews' && '🔍 Search Reviews'}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {activeTab === 'addBook' && (
          <div className="tab-content">
            <form onSubmit={addBook} className="book-form">
              {Object.keys(newBook).map((key) => (
                <input
                  key={key}
                  name={key}
                  placeholder={key}
                  value={newBook[key]}
                  onChange={handleInputChange}
                  required
                />
              ))}
              <button type="submit">➕ Add Book</button>
            </form>
          </div>
        )}

        {activeTab === 'deleteBook' && (
          <div className="tab-content">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author ID</th>
                  <th>Category ID</th>
                  <th>ISBN</th>
                  <th>Year</th>
                  <th>Format</th>
                  <th>Subscription</th>
                  <th>Uploaded By</th>
                  <th>Image</th>
                  <th>URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.Ebook_Id}>
                    <td>{book.Title}</td>
                    <td>{book.Author_Id}</td>
                    <td>{book.Category_Id}</td>
                    <td>{book.ISBN}</td>
                    <td>{book.Publication_Year}</td>
                    <td>{book.File_Format}</td>
                    <td>{book.Subscription_Type === 1 ? 'Premium' : 'Free'}</td>
                    <td>{book.Uploaded_By}</td>
                    <td>
                      <img src={book.Image} alt="cover" style={{ width: '50px' }} />
                    </td>
                    <td>
                      <a href={book.URL} target="_blank" rel="noopener noreferrer">
                        Read 📖
                      </a>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => deleteBook(book.Ebook_Id)}>
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'topBooks' && (
          <div className="tab-content">
            <ul className="top-books-list">
              {topBooks.map((book, index) => (
                <li key={index}>
                  <strong>{book.Book_Title}</strong>
                  {book.Image && <img src={book.Image} alt="cover" style={{ width: '50px', marginLeft: '10px' }} />}
                  {book.URL && (
                    <a href={book.URL} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>
                      Read 📖
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'searchReviews' && (
          <div className="tab-content">
            <div>
              <input
                type="number"
                placeholder="Enter EbookId"
                value={searchEbookId}
                onChange={(e) => setSearchEbookId(e.target.value)}
              />
              <button onClick={handleSearchReviews}>Search Reviews</button>
            </div>

            <h3>📖 Reviews</h3>
            {noReviewsFound ? (
              <p>No reviews found for this book. 😞</p>
            ) : (
              <ul className="reviews-list">
                {reviews.map((review, index) => (
                  <li key={index}>{review.Review_Text}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageBooks;
