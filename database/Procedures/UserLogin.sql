USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[UserLogin]    Script Date: 2026/08/07 12:59:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[UserLogin]
    @Username VARCHAR(50)
AS
BEGIN

    SET NOCOUNT ON;

    BEGIN TRY

        IF NOT EXISTS
        (
            SELECT 1
            FROM Users
            WHERE Username = @Username
        )
        BEGIN
            THROW 50001, 'Username not found.', 1;
        END

        SELECT
            U.UserId,
            U.CustomerId,
            U.Username,
            U.PasswordHash,
            U.LastLogin,
            C.FullName,
            C.Email,
            C.PhoneNumber
        FROM Users U
        INNER JOIN Customers C
            ON U.CustomerId = C.CustomerId
        WHERE U.Username = @Username;

    END TRY

    BEGIN CATCH

        THROW;

    END CATCH

END;