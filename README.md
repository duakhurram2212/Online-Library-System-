# Online-Library-System 

# Online-Library-System-
Online Library Management System

A full-stack web application designed to manage and enjoy digital books, featuring both user and admin functionalities. Powered by 3 Idiots.

⸻

Table of Contents
	1.	Introduction
	2.	Tech Stack
	3.	Features
	4.	Installation
	5.	Usage
	6.	License

⸻

Introduction

Welcome to the Online Library Management System repository! This system allows users to access a vast collection of books, manage their reading progress, and interact with the content. Admins have the power to upload, manage, and organize books. Built with Node.js, React, and SQL Server, this system combines sleek UI/UX with strong functionality.

⸻

Tech Stack
	•	Backend: Node.js, Express
	•	Frontend: React, HTML, CSS
	•	Database: SQL Server
	•	Authentication: Basic login system for Admin and User roles
	•	Version Control: Git, GitHub

⸻

Features

For Users
	•	Search Books: Check if a book is available with the message "BOOK AVAILABLE" or "NOT AVAILABLE".
	•	Bookmark Books: Save your favorite books for easy access.
	•	Download Books: Download available books in your preferred format.
	•	View Fines: Track any fines for overdue books.
	•	User-Friendly Interface: Clean design for smooth navigation and reading.

For Admins
	•	Book Upload: Admins can upload new books into the library.
	•	Book Management: Edit and delete only the books they uploaded.
	•	Manage User Data: Admins can view users’ interactions and activities.
	•	Top 3Books: Display the top 3 most popular books based on user interactions.
	•	Functional Queries: Get insights such as books by category, author, and user feedback.

Other Cool Features
	•	Stylish homepage with a catchy slogan: “Powered by 3 Idiots”
	•	Responsive: Designed to work on any device for easy access.

⸻

Installation

To get started with the Online Library Management System, follow these steps:

1. Clone the repository:

git clone https://github.com/your-username/online-library-system.git

2. Install dependencies:
	•	Backend (Node.js):
Navigate to the backend folder and run:
node index.js 

	•	Frontend (React):
Navigate to the frontend folder and run:

npm install


3. Set up your database:
	•	Make sure SQL Server is installed and running.
	•	Create a new database and configure your connection in the backend.

4. Run the application:
•	Start the backend server:
node index.js
•	Start the frontend:

npm start
Now, your app should be running at http://localhost:3000!

Usage
	1.	Log in as either User or Admin.
	2.	Users can browse and interact with the book collection.
	3.	Admins can upload new books, manage existing ones, and access user data.
	4.	The system will display available books, fines, and bookmarks.
