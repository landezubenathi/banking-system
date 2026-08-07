USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[DepositMoney]    Script Date: 2026/08/07 12:56:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER   PROCEDURE [dbo].[DepositMoney]
@AccountId INT,
@Amount DECIMAL(18,2)
AS
BEGIN
  BEGIN TRY
    BEGIN TRANSACTION;

    IF @Amount <= 0
    BEGIN
        RAISERROR('Amount must be greater than zero.',16,1);
        ROLLBACK;
        RETURN;
    END

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

    UPDATE Accounts
    SET AccountBalance = AccountBalance + @Amount
    WHERE AccountId = @AccountId;

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

    COMMIT;
    PRINT 'Deposit successful';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    ROLLBACK;
    PRINT ERROR_MESSAGE();
END CATCH
END;