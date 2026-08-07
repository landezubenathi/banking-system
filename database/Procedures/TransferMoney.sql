USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[TransferMoney]    Script Date: 2026/08/07 12:58:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
  
ALTER PROCEDURE [dbo].[TransferMoney]
   @FromAccount INT,
   @ToAccount INT,
   @Amount DECIMAL(18, 2)
AS
BEGIN 
  BEGIN TRY
     BEGIN TRANSACTION;
     
     --check if amount > 0
     IF @Amount <= 0
     BEGIN
     RAISERROR('Amount must be greater than zero.',16,1);
     ROLLBACK;
     RETURN;
     END

     -- check if sender's account exists
     IF NOT EXISTS(SELECT 1
                   FROM Accounts
                   WHERE AccountId = @FromAccount)
     BEGIN
        RAISERROR('Account not found.',16,1);
        ROLLBACK;
        RETURN;
    END
    -- check if sender's account is active
    IF EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE AccountId =  @FromAccount 
        AND AccountStatus = 'FROZEN'
    )
    BEGIN
        RAISERROR('Account is frozen.',16,1);
        ROLLBACK;
        RETURN;
    END

     -- check if receiver's account exists
     IF NOT EXISTS(SELECT 1
                   FROM Accounts
                   WHERE AccountId = @ToAccount)
     BEGIN
        RAISERROR('Account not found.',16,1);
        ROLLBACK;
        RETURN;
    END
    -- check if receiver's account is active
    IF EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE AccountId =  @ToAccount
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
    WHERE AccountId = @FromAccount;

    IF @FromAccount = @ToAccount
    BEGIN
    RAISERROR('Cannot transfer to the same account.',16,1);
    ROLLBACK;
    RETURN;
    END


    IF @Balance < @Amount
    BEGIN
    RAISERROR('Insufficient funds.',16,1);
    ROLLBACK;
    RETURN;
    END
       
    UPDATE Accounts
    SET AccountBalance = AccountBalance - @Amount
    WHERE AccountId = @FromAccount;

    UPDATE Accounts
    SET AccountBalance = AccountBalance + @Amount
    WHERE AccountId = @ToAccount;

    INSERT INTO Transactions(AccountId, ReferenceAccountId, TransactionType, Amount)
    VALUES(@FromAccount, @ToAccount, 'Transfer', @Amount);
   
    INSERT INTO Transactions(AccountId, ReferenceAccountId, TransactionType, Amount)
    VALUES(@ToAccount, @FromAccount, 'Transfer', @Amount);

    COMMIT;
    PRINT 'Tranfer Successful';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        THROW;
    END CATCH
END