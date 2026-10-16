USE [BankingSystemAndFraudDetectonDB];
GO

/*
  PURPOSE:Transfers funds between two bank accounts using their customer-facing
  account numbers while retaining internal AccountIds for database operations.

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

    -- Automatically abort and roll back the transaction when certain run-time errors occur, supporting transfer consistency.
    SET XACT_ABORT ON;

   -- Validate the sender account number's length and numeric format.
   -- Wider input parameters allow oversized inputs to be rejected rather than silently truncated to the Accounts column size.
    IF @FromAccount IS NULL OR LEN(@FromAccount) NOT BETWEEN 7 AND 10
       OR @FromAccount LIKE '%[^0-9]%'
        THROW 51001, 'Sender account number must be 7 to 10 digits.', 1;

    -- Validate the recipient account number using the same format rules.
    IF @ToAccount IS NULL OR LEN(@ToAccount) NOT BETWEEN 7 AND 10
       OR @ToAccount LIKE '%[^0-9]%'
        THROW 51002, 'Recipient account number must be 7 to 10 digits.', 1;
    
    -- Prevent a transfer from being made to the same account.
    IF @FromAccount = @ToAccount
        THROW 51003, 'Cannot transfer to the same account.', 1;

    -- Require a positive transfer amount before accessing account records.
    IF @Amount IS NULL OR @Amount <= 0
        THROW 51004, 'Amount must be greater than zero.', 1;

    -- Declare variables for the internal account IDs, account statuses and sender balance retrieved from the Accounts table.
    DECLARE @FromAccountId INT;
    DECLARE @ToAccountId INT;
    DECLARE @FromStatus VARCHAR(50);
    DECLARE @ToStatus VARCHAR(50);
    DECLARE @FromBalance DECIMAL(18, 2);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Retrieve the sender's internal ID, status, and current balance.
        SELECT @FromAccountId = AccountId,
               @FromStatus = AccountStatus,
               @FromBalance = AccountBalance
        FROM dbo.Accounts WITH (UPDLOCK, HOLDLOCK)
        WHERE AccountNumber = @FromAccount;

        -- Reject the transfer if the sender account number was not found.
        IF @FromAccountId IS NULL
            THROW 51005, 'Sender account number not found.', 1;

       -- Retrieve the recipient's internal ID and current account status.
        SELECT @ToAccountId = AccountId,
               @ToStatus = AccountStatus
        FROM dbo.Accounts WITH (UPDLOCK, HOLDLOCK)
        WHERE AccountNumber = @ToAccount;

        -- Reject the transfer if the recipient account number was not found.
        IF @ToAccountId IS NULL
            THROW 51006, 'Recipient account number not found.', 1;

        -- Requires the sender account to have ACTIVE status before debiting it.
        IF @FromStatus IS NULL OR @FromStatus <> 'ACTIVE'
            THROW 51007, 'Sender account is not active.', 1;
        -- Require the recipient account to have ACTIVE status before crediting it.
        IF @ToStatus IS NULL OR @ToStatus <> 'ACTIVE'
            THROW 51008, 'Recipient account is not active.', 1;

        -- Verifies that the sender has enough available balance for the transfer.
        IF COALESCE(@FromBalance, 0) < @Amount
            THROW 51009, 'Insufficient funds.', 1;

        -- Subtracts the transfer amount from the sender's account only if the account is still active and has enough money.
        UPDATE dbo.Accounts
        SET AccountBalance = AccountBalance - @Amount
        WHERE AccountId = @FromAccountId
          AND AccountStatus = 'ACTIVE'
          AND AccountBalance >= @Amount;

        -- Checks that the sender's account was updated successfully.
        -- If not, stops the transfer so the changes can be undone.
        IF @@ROWCOUNT <> 1
            THROW 51010, 'Sender account changed; transfer cancelled.', 1;

        -- Add the transfer amount to the recipient's account only if the account is still active.
        UPDATE dbo.Accounts
        SET AccountBalance = AccountBalance + @Amount
        WHERE AccountId = @ToAccountId AND AccountStatus = 'ACTIVE';

        -- Checks that the recipient's account was updated successfully.
        -- If not, stops the transfer so the sender's money is not lost.
        IF @@ROWCOUNT <> 1
            THROW 51011, 'Recipient account changed; transfer cancelled.', 1;

        -- Save two records of the transfer: one for each account.
        -- Each record identifies the other account involved.
        -- Internal account IDs are used to maintain transaction history and support the existing fraud-detection trigger.
        INSERT INTO dbo.Transactions
            (AccountId, ReferenceAccountId, TransactionType, Amount)
        VALUES
            (@FromAccountId, @ToAccountId, 'Transfer', @Amount),
            (@ToAccountId, @FromAccountId, 'Transfer', @Amount);

        -- Save all balance changes and transaction records together.
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Undo any uncommitted changes if an error occurs preventing an incomplete transfer.
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
