import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.js";
import LoginPage from "./LoginPage.js";
import LoginUser from "./UserLogin.js";
import LoginAdmin from "./AdminLogin.js";
import UserDashboard from "./UserDashboard.js";
import AdminDashboard from "./AdminDashboard.js";
import ManageBooks from "./ManageBooks.js";
import ManageUsers from "./ManageUsers.js"; // Import ManageUsers
import BooksPage from "./BooksPage.js"; // New Component
import CategoriesPage from "./CategoriesPage.js"; // New Component
import AuthorsPage from "./AuthorsPage.js"; // New Component
import UserSettings from "./UserSettings.js";
import BorrowHistoryPage from "./BorrowHistoryPage.js";
import FinesDetailsPage from "./FinesDetailsPage.js";
import BookmarksPage from './BookmarksPage.js'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/user" element={<LoginUser />} />
        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-books" element={<ManageBooks />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />

        {/* New Routes for Books, Categories, and Authors */}
        <Route path="/user/books" element={<BooksPage />} />
        <Route path="/user/categories" element={<CategoriesPage />} />
        <Route path="/user/authors" element={<AuthorsPage />} />
        <Route path="/user/settings" element={<UserSettings />} />
         <Route path="/user/borrowing-history" element={<BorrowHistoryPage />} />
         <Route path="/user/fines-details" element={<FinesDetailsPage />} />
         <Route path="/bookmarks" element={<BookmarksPage />} />

      </Routes>
    </Router>
  );
}

export default App;
