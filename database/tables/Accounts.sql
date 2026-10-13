/* Schema for a NEW database only. Do not run CREATE TABLE against your live Azure DB.
   The live Accounts table already has AccountNumber and a unique constraint.
   CreateAccount generates the 10-digit number after inserting the new row.
*/
CREATE TABLE dbo.Accounts (
    AccountId INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    CustomerId INT NOT NULL,
    AccountBalance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    AccountStatus VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (AccountStatus IN ('ACTIVE', 'FROZEN')),
    DateCreated DATETIME NOT NULL DEFAULT GETDATE(),
    AccountNumber VARCHAR(10) NULL,
    CONSTRAINT FK_Accounts_Customers FOREIGN KEY (CustomerId)
        REFERENCES dbo.Customers(CustomerId),
    CONSTRAINT UQ_Accounts_AccountNumber UNIQUE (AccountNumber)
);
