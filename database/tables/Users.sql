CREATE TABLE Users(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedDate DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);