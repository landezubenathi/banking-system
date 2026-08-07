CREATE TABLE Transactions(
TransactionId INT PRIMARY KEY IDENTITY(1, 1),
AccountId INT NOT NULL,
TransactionType  VARCHAR(50) CHECK (TransactionType IN ('Deposit', 'Withdraw', 'Transfer')),
Amount DECIMAL(18, 2) DEFAULT 0,
TransactionDate DATETIME DEFAULT GETDATE(),
ReferenceAccountId INT NULL,
FOREIGN KEY(AccountId) REFERENCES Accounts(AccountId)
);