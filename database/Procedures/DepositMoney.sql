USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[DepositMoney]    Script Date: 2026/08/07 12:56:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- PURPOSE: Deposits money into an existing bank account while enforcing basic transaction validation and account-status restrictions.
ALTER   PROCEDURE [dbo].[DepositMoney]
@AccountId INT,
@Amount DECIMAL(18,2)
AS
BEGIN
  BEGIN TRY
    BEGIN TRANSACTION;

    -- Validate that the deposit amount is positive preventing zero-value and negative-value deposits.
    IF @Amount <= 0
    BEGIN
        RAISERROR('Amount must be greater than zero.',16,1);
        ROLLBACK;
        RETURN;
    END

    -- Verify that the specified account exists before processing the deposit.
    IF NOT EXISTS
    (
        SELECT 1
        FROM Accounts
        WHERE AccountId = @AccountId
    )
    BEGIN
        RAISERROR('Account not found.',16,1);
        ROLLBACK;
        RETURN;
    END

    -- Check whether the account is frozen.
    -- Preventing deposits to frozen accounts enforces the account-status restriction implemented by this procedure.
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
      
    -- Increase the account balance by the validated deposit amount.
    UPDATE Accounts
    SET AccountBalance = AccountBalance + @Amount
    WHERE AccountId = @AccountId;

    -- Record the deposit in the Transactions table for transaction history and financial record-keeping.
    INSERT INTO Transactions
    (
        AccountId,
        TransactionType,
        Amount
    )
    VALUES
    (
        @AccountId,
        'Deposit',
        @Amount
    );
    -- Commit the balance update and transaction record together.
    COMMIT;
    PRINT 'Deposit successful';
END TRY
BEGIN CATCH
     -- Roll back any active transaction if an error occurs, helping prevent an incomplete deposit operation.
    IF @@TRANCOUNT > 0
    ROLLBACK;
    PRINT ERROR_MESSAGE();
END CATCH
END;
