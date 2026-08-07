USE [BankingSystemAndFraudDetectonDB]
GO
/****** Object:  StoredProcedure [dbo].[UpdateProfile]    Script Date: 2026/08/07 12:58:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[UpdateProfile]

    @CustomerId INT,
    @FullName VARCHAR(100),
    @Email VARCHAR(100),
    @PhoneNumber VARCHAR(20)

AS
BEGIN

    /*SET NOCOUNT ON;*/

    UPDATE Customers

    SET
        FullName = @FullName,
        Email = @Email,
        PhoneNumber = @PhoneNumber

    WHERE CustomerId = @CustomerId;

END
