USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[CreateAccount]    Script Date: 2026/08/07 12:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[CreateAccount]
@CustomerId INT
AS
BEGIN
 BEGIN TRY
   BEGIN TRANSACTION;

    -- Customer must exist
    IF NOT EXISTS
    (SELECT 1
     FROM Customers
     WHERE CustomerId = @CustomerId
    )
    BEGIN
        RAISERROR('Customer does not exist.',16,1);
        ROLLBACK;
        RETURN;
    END

    -- One customer = one account
    IF EXISTS
    (SELECT 1
     FROM Accounts
     WHERE CustomerId = @CustomerId
     )
    BEGIN
        RAISERROR('Customer already has an account.',16,1);
        ROLLBACK;
        RETURN;
    END

    INSERT INTO Accounts(CustomerId)
    VALUES(@CustomerId);

    -- Get the newly created AccountId
    DECLARE @AccountId INT = SCOPE_IDENTITY();

    -- Generate the 10-digit Account Number
    UPDATE Accounts
    SET AccountNumber = RIGHT(
    CAST(1000000000 + @AccountId AS VARCHAR(10)),
    10
)
WHERE AccountId = @AccountId;

    COMMIT;
    PRINT 'Account created successfully';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    ROLLBACK;
    PRINT ERROR_MESSAGE();
END CATCH
END;
 