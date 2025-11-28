-- Grant privileges to financeuser from any host (for Docker networking)
-- The MySQL container creates the user from MYSQL_USER/MYSQL_PASSWORD env vars,
-- but only for localhost. This script extends it to work from Docker containers.

-- MySQL 8.0 syntax: CREATE USER first, then GRANT
-- Create user if not exists (the Docker entrypoint may have already created it)
CREATE USER IF NOT EXISTS 'financeuser'@'%' IDENTIFIED BY 'financepass';

-- Grant all privileges on the finance_tracker database to financeuser from any host
GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeuser'@'%';

-- Also ensure root can connect from any host (useful for debugging)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Flush privileges to apply changes
FLUSH PRIVILEGES;
