CREATE DATABASE Online_LMS24;
GO
USE Online_LMS24;

-- 1. Admins Table
CREATE TABLE Admins 
(
    Admin_Id INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL CHECK (Email LIKE '%@%._%'), 
    Password VARCHAR(255) NOT NULL CHECK (LEN(Password) BETWEEN 8 AND 50),
    Created_At DATETIME DEFAULT GETDATE()
);

-- 2. Users Table
CREATE TABLE Users (
    User_Id INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL CHECK (Email LIKE '%@%._%'), 
    Password VARCHAR(255) NOT NULL CHECK (LEN(Password) BETWEEN 8 AND 50),
    Phone VARCHAR(20) CHECK (LEN(Phone) BETWEEN 10 AND 20),
    Registration_Date DATETIME DEFAULT GETDATE()
);

-- 3. Categories Table
CREATE TABLE Categories (
    Category_Id INT PRIMARY KEY IDENTITY(1,1),
    Category_Name VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Authors Table
CREATE TABLE Authors (
    Author_Id INT PRIMARY KEY IDENTITY(1,1),
    Author_Name VARCHAR(255) NOT NULL,
    Nationality VARCHAR(100)
);

-- 5. Ebooks Table
CREATE TABLE Ebooks (
    Ebook_Id INT PRIMARY KEY IDENTITY(1,1),
    Title VARCHAR(255) NOT NULL,
    Author_Id INT,
    Category_Id INT,
    ISBN VARCHAR(20) UNIQUE NOT NULL CHECK (LEN(ISBN) IN (12, 13)), 
    Publication_Year INT CHECK (Publication_Year >= 1500 AND Publication_Year <= YEAR(GETDATE())),
    File_Format VARCHAR(10) CHECK (File_Format IN ('PDF', 'EPUB', 'TXT')),
    Uploaded_By INT NOT NULL,
    Subscription_Type INT CHECK (Subscription_Type IN (0, 1)),  
	URL VARCHAR(500) NULL,
    Image VARCHAR(500) NULL,
    FOREIGN KEY (Author_Id) REFERENCES Authors(Author_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Category_Id) REFERENCES Categories(Category_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Uploaded_By) REFERENCES Admins(Admin_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Access_Log Table
CREATE TABLE Access_Log (
    Access_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Access_Time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Reviews Table
CREATE TABLE Reviews (
    Review_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Review_Text TEXT,
    Review_Date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. Recommendations Table 
CREATE TABLE Recommendations (
    Recommendation_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Recommended_On DATETIME DEFAULT GETDATE(),
    Review_Id INT UNIQUE,
    FOREIGN KEY (Review_Id) REFERENCES Reviews(Review_Id),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- 9. Bookmarks Table
CREATE TABLE Bookmarks (
    Bookmark_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Page_Number INT NOT NULL CHECK (Page_Number >= 0),
    Created_At DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 10. User_Subscriptions Table
CREATE TABLE User_Subscriptions (
    Subscription_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Subscription_Type INT CHECK (Subscription_Type IN (0, 1)), -- 0 (MEMBER) 1 (VIP) 
    Expiry_Date DATE,
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11. Download_History Table
CREATE TABLE Download_History (
    Download_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Download_Time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12. Reading_Progress Table
CREATE TABLE Reading_Progress (
    Progress_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Percentage_Read DECIMAL(5,2) CHECK (Percentage_Read BETWEEN 0 AND 100),
    Last_Updated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);
--13. User and Book combine table
CREATE TABLE User_Book(
    Ebook_Id INT,
    User_Id INT,
	FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY(Ebook_Id, User_Id)
);

-- 14. Borrowing Table
CREATE TABLE Borrowing
(
    Borrow_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Borrowed_On DATE DEFAULT GETDATE(),
    Due_Date AS DATEADD(DAY, 14, Borrowed_On) PERSISTED,
    Returned_On DATE NULL,
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 15. Fines Table 
CREATE TABLE Fines (
    Fine_Id INT PRIMARY KEY IDENTITY(1,1),
    User_Id INT,
    Ebook_Id INT,
    Borrow_Id INT UNIQUE,
    Fine_Amount DECIMAL(10,2) CHECK (Fine_Amount >= 0),
    Paid BIT DEFAULT 0, -- 0 for unpaid, 1 for paid
    FOREIGN KEY (User_Id) REFERENCES Users(User_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ebook_Id) REFERENCES Ebooks(Ebook_Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Borrow_Id) REFERENCES Borrowing(Borrow_Id) ON DELETE NO ACTION ON UPDATE NO ACTION
);



-- Insert into Admins
INSERT INTO Admins (Name, Email, Password) VALUES
('Alice Johnson', 'alice.johnson@example.com', 'AdminPass123'),
('Robert Smith', 'robert.smith@example.com', 'SecurePass456');

-- Insert into Users
INSERT INTO Users (Name, Email, Password, Phone) VALUES
('John Doe', 'john.doe@example.com', 'UserPass123', '+923001234567'),
('Emma Watson', 'emma.watson@example.com', 'SecurePass789', '+923002345678'),
('Liam Brown', 'liam.brown@example.com', 'PassSecure987', '+923003456789'),
('David Miller', 'david.miller@example.com', 'DavidPass654', '+923007890123'),
('Sophia Wilson', 'sophia.wilson@example.com', 'SophiaSecure321', '+923008901234'),
('James Anderson', 'james.anderson@example.com', 'JamesPass567', '+923009012345');

-- Insert into Categories
INSERT INTO Categories (Category_Name) VALUES
('Fiction'),
('Non-Fiction'),
('Science'),
('Technology'),
('Biography'),
('Self-Help'),
('Horror');

-- Insert into Authors
INSERT INTO Authors (Author_Name, Nationality) VALUES
('Mark Twain', 'USA'),
('J.K. Rowling', 'UK'),
('Margaret Atwood', 'Canada'),
('Stephen King', 'USA'),
('Dale Carnegie', 'USA'),
('Walter Isaacson', 'USA');

-- Insert into Ebooks
INSERT INTO Ebooks 
(Title, Author_Id, Category_Id, ISBN, Publication_Year, File_Format, Uploaded_By, URL, Image, Subscription_Type) 
VALUES
('Adventures of Huckleberry Finn', 1, 1, '123456789012', 1884, 'PDF', 1, 
 'https://archive.org/details/mark-twain_the-adventures-of-huckleberry-finn', 
 'https://ccsbooks.co.uk/wp-content/uploads/2019/10/9781910619872-scaled.jpg', 1),

('Harry Potter and the Sorcerer''s Stone', 2, 1, '123456789013', 1997, 'EPUB', 2, 
 'https://ia801401.us.archive.org/5/items/01-harry-potter-and-the-sorcerers-stone/01%20Harry%20Potter%20and%20the%20Sorcerer%27s%20Stone.pdf', 
 'https://images.thenile.io/r1000/9780545582889.jpg', 1),

('The Handmaid''s Tale', 3, 2, '123456789014', 1985, 'TXT', 1, 
 'https://ia801807.us.archive.org/18/items/the-handmaids-tale_pdf/the-handmaids-tale_ForLibrary.pdf', 
 'https://cdn2.penguin.com.au/covers/original/9780099740919.jpg', 0),

('The Shining', 2, 5, '123456789019', 1977, 'PDF', 2, 
 'https://www.overdrive.com/media/166394/the-shining', 
 'https://media1.popsugar-assets.com/files/thumbor/VDtKKeNUg-lYxPZCrcaxZDfUaOI/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2016/07/06/021/n/1922283/4d7d4fa5_shining/i/Shining-Stephen-King.jpg', 1),

('How to Win Friends & Influence People', 3, 4, '123456789020', 1936, 'EPUB', 1, 
 'https://archive.org/details/howtowinfriendsinfluencepeople_202004', 
 'https://cdn2.penguin.com.au/covers/original/9780091906818.jpg', 0),

('Steve Jobs', 4, 1, '123456789021', 2011, 'TXT', 2, 
 'https://stevejobsarchive.com/book/download', 
 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781501127625/steve-jobs-9781501127625_hr.jpg', 1),

('Animal Farm', 5, 2, '123456789022', 1945, 'PDF', 1, 
 'https://archive.org/details/AnimalFarm_201303', 
 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg', 0),

('The Silent Patient', 4, 3, '123456789023', 2019, 'EPUB', 2, 
 'https://dn790005.ca.archive.org/0/items/StudykKollection/The%20Silent%20Patient%20by%20Alex%20Michaelides.pdf', 
 'https://celadonbooks.com/wp-content/uploads/2019/07/silent-patient-uk-500x800.jpg', 1),

('Purple Hearts', 1, 2, '678936281368', 1886, 'PDF', 1, 
 'https://openlibrary.org/books/OL34074074M/Purple_Hearts', 
 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781668021873/purple-hearts-9781668021873_hr.jpg', 1);


-- Insert into Access_Log
INSERT INTO Access_Log (User_Id, Ebook_Id) VALUES
(1, 8),
(5, 2),
(3, 3),
(5, 2),
(3, 6),
(6, 7),
(1, 9),
(4, 4);

-- Insert into Reviews
INSERT INTO Reviews (User_Id, Ebook_Id, Rating, Review_Text) VALUES
(3, 4, 5, 'An incredible journey through the Mississippi River.'),
(2, 2, 3, 'A magical story that captivates all ages.'),
(1, 3, 4, 'A gripping dystopian novel with deep themes.'),
(2, 9, 5, 'A chilling horror masterpiece.'), 
(4, 7, 2, 'Incredible wisdom that still applies today.'), 
(6, 8, 4, 'A powerful biography of an innovative genius.'), 
(3, 6, 4, 'A thought-provoking political allegory.'), 
(5, 2, 3, 'A suspenseful psychological thriller.');

-- Insert into Recommendations
--only one review is allowed for the same ebook by same user so reviewid is always distinct
INSERT INTO Recommendations (User_Id, Ebook_Id, Review_Id) VALUES
(2, 4, 2),
(4, 3, 4),
(3, 5, 8),
(1,9, 7),
(3, 8, 1),
(2, 7, 6),
(6, 9, 3),
(4, 2, 5);

-- Insert into Bookmarks
INSERT INTO Bookmarks (User_Id, Ebook_Id, Page_Number) VALUES
(1, 2, 45),
(2, 2, 100),
(3, 3, 30),
(6, 7, 120),
(2, 9, 75),
(4, 2, 90),
(3, 8, 30),
(5, 2, 140);

-- Insert into User_Subscriptions
INSERT INTO User_Subscriptions (User_Id, Subscription_Type, Expiry_Date) VALUES
(1, 1, '2025-12-31'),
(2, 0, '2024-06-30'),
(3, 1, '2026-01-15'),
(6, 0, '2025-08-25'),
(3, 1, '2026-02-15'),
(2, 0, '2024-11-30'),
(5, 1, '2026-07-10'),
(4, 0, '2025-12-05');

-- Insert into Download_History
INSERT INTO Download_History (User_Id, Ebook_Id) VALUES
(1, 2),
(2, 2),
(3, 3),
(3, 2),
(6, 9),
(2, 7),
(5, 8),
(4, 7);

-- Insert into Reading_Progress
INSERT INTO Reading_Progress (User_Id, Ebook_Id, Percentage_Read) VALUES
(1, 8, 75.50),
(2, 2, 50.00),
(3, 3, 30.25),
(5, 7, 65.50),
(3, 9, 80.00),
(6, 2, 45.75),
(2, 4, 90.00),
(4, 9, 55.25);

INSERT INTO User_Book ( Ebook_Id, User_Id) VALUES
(3,1),
(2,2),
(9,3),
(6, 4),
(7, 5),
(8, 6);

-- Insert more Borrowing Records
--make sure user book does not have same data
INSERT INTO Borrowing (User_Id, Ebook_Id, Borrowed_On, Returned_On) VALUES
(3, 4, '2025-12-22', '2025-12-28'),  -- User 3, Ebook 4
(3, 6, '2025-12-25', '2025-12-30'),  -- User 3, Ebook 6
(4, 8, '2025-12-05', '2025-12-10'),  -- User 4, Ebook 8
(5, 9, '2026-07-10', '2026-07-15'),  -- User 5, Ebook 9
(4, 2, '2025-12-05', '2025-12-10');  -- User 4, Ebook 2


-- Insert Fines
--only one user can borrow onw book with same id so borrow id should be unique .
INSERT INTO Fines (User_Id, Ebook_Id, Borrow_Id, Fine_Amount, Paid) VALUES
(1, 2, 2, 1.00, 0),
(5, 4, 1, 14.00,1),
(6, 5, 5, 5.00,0),
(2, 7,4, 7.00,1),
(3, 8, 3, 4.00,1);


-- Select statements to view all data
SELECT * FROM Admins;
SELECT * FROM Users;
SELECT * FROM Categories;
SELECT * FROM Authors;
SELECT * FROM Ebooks;
SELECT * FROM Access_Log;
SELECT * FROM Reviews;
SELECT * FROM Recommendations;
SELECT * FROM Bookmarks;
SELECT * FROM User_Subscriptions;
SELECT * FROM Download_History;
SELECT * FROM Reading_Progress;
SELECT * FROM User_Book;
SELECT * FROM Borrowing;
SELECT * FROM Fines;


--  Views

--1 Top 3 books
Create View Top_3_Books As
Select Top 3 
    E.Ebook_Id, 
    E.Title As Book_Title, 
    Count(R.Recommendation_Id) As Total_Recommendations
From Ebooks E
Join Recommendations R On E.Ebook_Id = R.Ebook_Id
Group By E.Ebook_Id, E.Title
Order By Total_Recommendations Desc;

Select * From Top_3_Books

--2 Top 3 Users With Most Recommendations Given

Create View Top_3_Users_With_Recommendations As
Select Top 3
    U.User_Id, 
    U.Name As User_Name, 
    Count(R.Recommendation_Id) As Total_Recommendations_Given
From Users U
Join Recommendations R On U.User_Id = R.User_Id
Group By U.User_Id, U.Name
Order By Total_Recommendations_Given Desc;

Select * From Top_3_Users_With_Recommendations


CREATE VIEW Top_3Genre AS  
SELECT TOP 3  
    C.Category_Id,  
    C.Category_Name,  
    COUNT(UB.Ebook_Id) AS Bookcount
FROM Categories C  
JOIN Ebooks E ON C.Category_Id = E.Category_Id  
JOIN User_Book UB ON E.Ebook_Id = UB.Ebook_Id  
GROUP BY C.Category_Id, C.Category_Name  
ORDER BY Bookcount   DESC;  

--TRIGGERS

-- Trigger on Borrowing for late return
CREATE TRIGGER InsertFineOnLateReturn
ON Borrowing
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Fines (User_Id, Ebook_Id, Borrow_Id, Fine_Amount, Paid)
    SELECT 
        b.User_Id, 
        b.Ebook_Id, 
        b.Borrow_Id, 
        DATEDIFF(DAY, b.Due_Date, b.Returned_On) * 1.00,  -- $1 per day late
        0  
    FROM inserted b
    WHERE b.Returned_On IS NOT NULL AND b.Returned_On > b.Due_Date;
END;

-- Subscription expiry

CREATE TRIGGER SetSubscriptionExpiry
ON User_Subscriptions
AFTER INSERT
AS
BEGIN
    UPDATE User_Subscriptions
    SET Expiry_Date = DATEADD(YEAR, 1, GETDATE())
    WHERE Expiry_Date IS NULL AND Subscription_Id IN (SELECT Subscription_Id FROM inserted);
END;


-- No borrowing if subscription expired

CREATE TRIGGER PreventExpiredSubscriptionBorrowing
ON Borrowing
AFTER INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted I
        JOIN User_Subscriptions US ON I.User_Id = US.User_Id
        WHERE US.Expiry_Date < GETDATE()
    )
    BEGIN
        RAISERROR ('Cannot borrow books. Your subscription has expired.', 16, 1);
        ROLLBACK TRANSACTION;
    END;
END;


-- Prevent double fine payment
CREATE TRIGGER PreventDuplicateFinePayments
ON Fines
AFTER UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted I
        JOIN deleted D ON I.Fine_Id = D.Fine_Id
        WHERE D.Paid = 1 AND I.Paid = 1
    )
    BEGIN
        RAISERROR ('This fine has already been paid.', 16, 1);
        ROLLBACK TRANSACTION;
    END;
END;

-- Update reading progress
CREATE TRIGGER UpdateReadingProgressTimestamp
ON Reading_Progress
AFTER UPDATE
AS
BEGIN
    UPDATE Reading_Progress
    SET Last_Updated = GETDATE()
    WHERE Progress_Id IN (SELECT Progress_Id FROM inserted);
END;


-- Prevents deletion of users who have borrowed books but haven't returned them.
CREATE TRIGGER RestrictUserDeletion
ON Users
INSTEAD OF DELETE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM Borrowing B
        JOIN deleted D ON B.User_Id = D.User_Id
        WHERE B.Returned_On IS NULL
    )
    BEGIN
        RAISERROR ('User cannot be deleted as they have active borrowed books.', 16, 1);
        RETURN;
    END;
    DELETE FROM Users WHERE User_Id IN (SELECT User_Id FROM deleted);
END;


-- Trigger to Automatically Add Borrowed Books to User_Book
CREATE TRIGGER AddUserBookOnBorrow
ON Borrowing
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO User_Book (Ebook_Id, User_Id)
    SELECT i.Ebook_Id, i.User_Id
    FROM inserted i;
END;



-- Trigger to Automatically Add a Default Subscription for New Users
CREATE TRIGGER AddDefaultSubscriptionOnUser
ON Users
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO User_Subscriptions (User_Id, Subscription_Type, Expiry_Date)
    SELECT i.User_Id, 0, DATEADD(YEAR, 1, GETDATE())  -- Default to MEMBER with a 1-year expiry
    FROM inserted i;
END;



-- Trigger to Log Access When Borrowing a Book
CREATE TRIGGER AccessOnBorrow
ON Borrowing
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Access_Log (User_Id, Ebook_Id, Access_Time)
    SELECT i.User_Id, i.Ebook_Id, GETDATE()
    FROM inserted i;
END;



-- Trigger to Log Download History When Borrowing
CREATE TRIGGER DownloadOnBorrow
ON Borrowing
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Download_History (User_Id, Ebook_Id, Download_Time)
    SELECT i.User_Id, i.Ebook_Id, GETDATE()
    FROM inserted i;
END;
