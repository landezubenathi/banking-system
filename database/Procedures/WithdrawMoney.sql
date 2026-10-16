USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[WithdrawMoney]    Script Date: 2026/08/10 12:33:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Purpose: Withdraws money from a bank account after checking the amount, confirming the account exists, and checking the available balance.
ALTER   PROCEDURE [dbo].[WithdrawMoney]
   @AccountId INT,
   @Amount DECIMAL(18, 2)
AS
BEGIN 
  BEGIN TRY
     BEGIN TRANSACTION;

     -- Check that the withdrawal amount is greater than zero, preventing zero-value and negative-value withdrawals.
     IF @Amount <= 0
     BEGIN
        RAISERROR('Amount must be greater than zero.',16,1);
        ROLLBACK;
        RETURN;
     END 

     -- Check that the specified account exists before processing the withdrawal.
     IF NOT EXISTS(SELECT 1
                   FROM Accounts
                   WHERE AccountId = @AccountId)
     BEGIN
        RAISERROR('Account not found.',16,1);
        ROLLBACK;
        RETURN;
    END

    -- Checks whether the account is frozen.
    -- Withdrawals are not allowed from frozen accounts in this procedure.
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

    -- Declares a variable to hold the account's current balance.
    DECLARE @Balance DECIMAL(18, 2);

    -- Retrieve the current balance so it can be checked before the withdrawal is processed.
    SELECT @Balance = AccountBalance
    FROM Accounts
    WHERE AccountId = @AccountId;

    -- Checks that the account has enough money for the withdrawal and rejects the request if the available balance is too low.
    IF @Balance < @Amount
    BEGIN
       RAISERROR('Insufficient funds.',16,1);
       ROLLBACK;
       RETURN;
   END
      
   -- Subtract the withdrawal amount from the account balance.
    UPDATE Accounts
    SET AccountBalance = AccountBalance - @Amount
    WHERE AccountId = @AccountId;

    -- Record the withdrawal in the Transactions table for transaction history and financial record-keeping.
    INSERT INTO Transactions(AccountId, TransactionType, Amount)
    VALUES(@AccountId, 'Withdraw', @Amount);

    -- Saves the balance change and transaction record together.
    COMMIT;
    PRINT 'Withdraw Successful';

    END TRY
    BEGIN CATCH
        -- Undo any uncommitted changes if an error occurs.
        IF @@TRANCOUNT > 0
            ROLLBACK;
            THROW;
    END CATCH
END
