CREATE TRIGGER trg_FraudAlerts ON Transactions 
AFTER INSERT 
AS 
BEGIN      
    SET NOCOUNT ON;          
    
    -- Check for transactions exceeding the safety threshold (e.g., $10,000)
    IF EXISTS (
        SELECT 1                
        FROM inserted                
        WHERE Amount > 10000
    )      

    -- Check for multiple transactions within a short timeframe (Velocity check)
    BEGIN          
        UPDATE Accounts          
        SET AccountStatus = 'FROZEN'          
        WHERE AccountId IN (
            SELECT AccountId                              
            FROM inserted                              
            WHERE Amount > 10000
        );          
        
        INSERT INTO FraudAlerts(AccountId, SuspiciousAmount, Status)          
        SELECT AccountId, Amount, 'ACTIVE'          
        FROM inserted          
        WHERE Amount > 10000;     
    END 
END;
