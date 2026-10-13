-- Run on BankingSystemAndFraudDetectonDB BEFORE deploying Flask security update.
-- Do not recreate existing banking tables or delete existing users/transactions.
IF OBJECT_ID(N'dbo.AuthSessions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuthSessions (
        SessionId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AuthSessions PRIMARY KEY,
        UserId INT NOT NULL,
        TokenHash VARBINARY(32) NOT NULL,
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuthSessions_CreatedAt DEFAULT SYSUTCDATETIME(),
        ExpiresAt DATETIME2(3) NOT NULL,
        RevokedAt DATETIME2(3) NULL,
        CONSTRAINT FK_AuthSessions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT UQ_AuthSessions_TokenHash UNIQUE (TokenHash)
    );
END;
GO
-- Safe to rerun: add optional lookup index only if missing.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.AuthSessions') AND name = N'IX_AuthSessions_UserId'
)
BEGIN
    CREATE INDEX IX_AuthSessions_UserId ON dbo.AuthSessions(UserId) INCLUDE (ExpiresAt, RevokedAt);
END;
GO