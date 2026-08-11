USE [BankingSystemAndFraudDetectonDB];
GO

/*
====================================================
LAMA BANK DATABASE SEED / VERIFICATION SCRIPT
====================================================

This script is intentionally safe to run multiple times.

The application creates customers and accounts through:

    CreateCustomerProfile
    CreateAccount

Therefore, no default users or passwords are inserted here.

====================================================
*/


PRINT '========================================';
PRINT 'LAMA BANK DATABASE VERIFICATION';
PRINT '========================================';


-- ==========================================
-- Verify Customers table
-- ==========================================

IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL
    PRINT 'Customers table: OK';
ELSE
    PRINT 'Customers table: MISSING';


-- ==========================================
-- Verify Users table
-- ==========================================

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    PRINT 'Users table: OK';
ELSE
    PRINT 'Users table: MISSING';


-- ==========================================
-- Verify Accounts table
-- ==========================================

IF OBJECT_ID('dbo.Accounts', 'U') IS NOT NULL
    PRINT 'Accounts table: OK';
ELSE
    PRINT 'Accounts table: MISSING';


-- ==========================================
-- Verify Transactions table
-- ==========================================

IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL
    PRINT 'Transactions table: OK';
ELSE
    PRINT 'Transactions table: MISSING';


-- ==========================================
-- Verify FraudAlerts table
-- ==========================================

IF OBJECT_ID('dbo.FraudAlerts', 'U') IS NOT NULL
    PRINT 'FraudAlerts table: OK';
ELSE
    PRINT 'FraudAlerts table: MISSING';


-- ==========================================
-- Verify Stored Procedures
-- ==========================================

IF OBJECT_ID('dbo.CreateCustomerProfile', 'P') IS NOT NULL
    PRINT 'CreateCustomerProfile procedure: OK';
ELSE
    PRINT 'CreateCustomerProfile procedure: MISSING';


IF OBJECT_ID('dbo.CreateAccount', 'P') IS NOT NULL
    PRINT 'CreateAccount procedure: OK';
ELSE
    PRINT 'CreateAccount procedure: MISSING';


IF OBJECT_ID('dbo.UserLogin', 'P') IS NOT NULL
    PRINT 'UserLogin procedure: OK';
ELSE
    PRINT 'UserLogin procedure: MISSING';


IF OBJECT_ID('dbo.DepositMoney', 'P') IS NOT NULL
    PRINT 'DepositMoney procedure: OK';
ELSE
    PRINT 'DepositMoney procedure: MISSING';


IF OBJECT_ID('dbo.WithdrawMoney', 'P') IS NOT NULL
    PRINT 'WithdrawMoney procedure: OK';
ELSE
    PRINT 'WithdrawMoney procedure: MISSING';


IF OBJECT_ID('dbo.TransferMoney', 'P') IS NOT NULL
    PRINT 'TransferMoney procedure: OK';
ELSE
    PRINT 'TransferMoney procedure: MISSING';


-- ==========================================
-- Basic Record Counts
-- ==========================================

PRINT '========================================';
PRINT 'CURRENT RECORD COUNTS';
PRINT '========================================';

SELECT
    'Customers' AS TableName,
    COUNT(*) AS RecordCount
FROM Customers

UNION ALL

SELECT
    'Users',
    COUNT(*)
FROM Users

UNION ALL

SELECT
    'Accounts',
    COUNT(*)
FROM Accounts

UNION ALL

SELECT
    'Transactions',
    COUNT(*)
FROM Transactions

UNION ALL

SELECT
    'FraudAlerts',
    COUNT(*)
FROM FraudAlerts;


PRINT '========================================';
PRINT 'DATABASE VERIFICATION COMPLETE';
PRINT '========================================';