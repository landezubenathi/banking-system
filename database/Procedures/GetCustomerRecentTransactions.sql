USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[GetCustomerRecentTransactions]    Script Date: 2026/08/07 12:56:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[GetCustomerRecentTransactions]
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 5
        T.TransactionId,
        T.AccountId,
        T.TransactionType,
        T.Amount,
        T.TransactionDate
    FROM Transactions T
    INNER JOIN Accounts A
        ON T.AccountId = A.AccountId
    WHERE A.CustomerId = @CustomerId
    ORDER BY T.TransactionDate DESC;
END;
