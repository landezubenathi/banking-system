USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[CreateCustomerProfile]    Script Date: 2026/08/07 12:55:21 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[CreateCustomerProfile]
@FullName VARCHAR(50),
@Email VARCHAR(100),
@PhoneNumber VARCHAR(10),
@Username VARCHAR(50),
@PasswordHash VARCHAR(255)
AS
BEGIN
  BEGIN TRY
    BEGIN TRANSACTION;

    -- Email must be unique
    IF EXISTS (
        SELECT 1
        FROM Customers
        WHERE Email = @Email
    )
    BEGIN
        RAISERROR('Email already exists.',16,1);
        ROLLBACK;
        RETURN;
    END

    -- Username must be unique
    IF EXISTS (
        SELECT 1
        FROM Users
        WHERE Username = @Username
    )
    BEGIN
        RAISERROR('Username already exists.',16,1);
        ROLLBACK;
        RETURN;
    END

    INSERT INTO Customers(FullName,Email,PhoneNumber)
    VALUES(@FullName,@Email,@PhoneNumber);

    DECLARE @CustomerId INT = SCOPE_IDENTITY();

    INSERT INTO Users
    (CustomerId, Username, PasswordHash)
    VALUES(@CustomerId,@Username, @PasswordHash);

    SELECT @CustomerId AS CustomerId;

    COMMIT;
    PRINT 'Customer profile created successfully';
 END TRY
 BEGIN CATCH
    IF @@TRANCOUNT > 0
    ROLLBACK;
    PRINT ERROR_MESSAGE();
END CATCH
END;