USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[WithdrawMoney]    Script Date: 2026/08/10 12:33:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   PROCEDURE [dbo].[WithdrawMoney]
   @AccountId INT,
   @Amount DECIMAL(18, 2)
AS
BEGIN 
  BEGIN TRY
     BEGIN TRANSACTION;

     --check if amount is positive
     IF @Amount <= 0
     BEGIN
     RAISERROR('Amount must be greater than zero.',16,1);
     ROLLBACK;
     RETURN;
     END 

     -- check if account exists
     IF NOT EXISTS(SELECT 1
                   FROM Accounts
                   WHERE AccountId = @AccountId)
     BEGIN
        RAISERROR('Account not found.',16,1);
        ROLLBACK;
        RETURN;
    END
    -- check if account is active
    IF EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE AccountId = @AccountId
        AND AccountStatus = 'FROZEN'
    )
    BEGIN
        RAISERROR('Account is frozen.',16,1);
        ROLLBACK;
        RETURN;
    END

    DECLARE @Balance DECIMAL(18, 2);

    SELECT @Balance = AccountBalance
    FROM Accounts
    WHERE AccountId = @AccountId;


    IF @Balance < @Amount
    BEGIN
    RAISERROR('Insufficient funds.',16,1);
    ROLLBACK;
    RETURN;
    END

    
    UPDATE Accounts
    SET AccountBalance = AccountBalance - @Amount
    WHERE AccountId = @AccountId;

    INSERT INTO Transactions(AccountId, TransactionType, Amount)
    VALUES(@AccountId, 'Withdraw', @Amount);

    COMMIT;
    PRINT 'Withdraw Successful';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END