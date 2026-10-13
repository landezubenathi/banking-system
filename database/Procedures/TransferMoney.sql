USE [BankingSystemAndFraudDetectonDB];
GO

/*
  UPDATE: Customer-facing transfers now accept account numbers, not AccountIds.

  Accounts.AccountNumber = VARCHAR(10), so currently allow 7-10 digits.
  Transactions.AccountId and ReferenceAccountId remain INT internal keys.
  Fraud trigger remains unchanged because it operates on Transactions.AccountId.

  IMPORTANT: The procedure itself cannot determine which web customer is logged in.
  The Flask API MUST authorize the sender account against a verified server-side
  identity before calling this procedure. The repository ZIP does not implement
  that authorization yet; do not expose this as a public banking service.
*/
CREATE OR ALTER PROCEDURE dbo.TransferMoney
    @FromAccount VARCHAR(50),  -- AccountNumber, NOT AccountId
    @ToAccount   VARCHAR(50),  -- AccountNumber, NOT AccountId
    @Amount DECIMAL(18, 2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Use wider input parameters so that overly long account numbers are rejected
    -- instead of being silently truncated to the Accounts column size.
    IF @FromAccount IS NULL OR LEN(@FromAccount) NOT BETWEEN 7 AND 10
       OR @FromAccount LIKE '%[^0-9]%'
        THROW 51001, 'Sender account number must be 7 to 10 digits.', 1;

    IF @ToAccount IS NULL OR LEN(@ToAccount) NOT BETWEEN 7 AND 10
       OR @ToAccount LIKE '%[^0-9]%'
        THROW 51002, 'Recipient account number must be 7 to 10 digits.', 1;

    IF @FromAccount = @ToAccount
        THROW 51003, 'Cannot transfer to the same account.', 1;

    IF @Amount IS NULL OR @Amount <= 0
        THROW 51004, 'Amount must be greater than zero.', 1;

    DECLARE @FromAccountId INT;
    DECLARE @ToAccountId INT;
    DECLARE @FromStatus VARCHAR(50);
    DECLARE @ToStatus VARCHAR(50);
    DECLARE @FromBalance DECIMAL(18, 2);

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT @FromAccountId = AccountId,
               @FromStatus = AccountStatus,
               @FromBalance = AccountBalance
        FROM dbo.Accounts WITH (UPDLOCK, HOLDLOCK)
        WHERE AccountNumber = @FromAccount;

        IF @FromAccountId IS NULL
            THROW 51005, 'Sender account number not found.', 1;

        SELECT @ToAccountId = AccountId,
               @ToStatus = AccountStatus
        FROM dbo.Accounts WITH (UPDLOCK, HOLDLOCK)
        WHERE AccountNumber = @ToAccount;

        IF @ToAccountId IS NULL
            THROW 51006, 'Recipient account number not found.', 1;

        IF @FromStatus IS NULL OR @FromStatus <> 'ACTIVE'
            THROW 51007, 'Sender account is not active.', 1;

        IF @ToStatus IS NULL OR @ToStatus <> 'ACTIVE'
            THROW 51008, 'Recipient account is not active.', 1;

        IF COALESCE(@FromBalance, 0) < @Amount
            THROW 51009, 'Insufficient funds.', 1;

        UPDATE dbo.Accounts
        SET AccountBalance = AccountBalance - @Amount
        WHERE AccountId = @FromAccountId
          AND AccountStatus = 'ACTIVE'
          AND AccountBalance >= @Amount;

        IF @@ROWCOUNT <> 1
            THROW 51010, 'Sender account changed; transfer cancelled.', 1;

        UPDATE dbo.Accounts
        SET AccountBalance = AccountBalance + @Amount
        WHERE AccountId = @ToAccountId AND AccountStatus = 'ACTIVE';

        IF @@ROWCOUNT <> 1
            THROW 51011, 'Recipient account changed; transfer cancelled.', 1;

        -- Internal ID-based relationship retained for historical data and triggers.
        INSERT INTO dbo.Transactions
            (AccountId, ReferenceAccountId, TransactionType, Amount)
        VALUES
            (@FromAccountId, @ToAccountId, 'Transfer', @Amount),
            (@ToAccountId, @FromAccountId, 'Transfer', @Amount);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
