USE BankingSystemAndFraudDetectonDB;
GO

-- Sample customer
INSERT INTO Customers
(
    FullName,
    Email,
    PhoneNumber
)
VALUES
(
    'Demo Customer',
    'demo@example.com',
    '0712345678'
);