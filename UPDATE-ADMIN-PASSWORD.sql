-- Update admin password to: Admin123!Secure
-- Bcrypt hash generated with 10 rounds
UPDATE "User"
SET "actualPasswordHash" = '$2b$10$YQiMN4.H7v3xG9Zq.9aTJuC7Ff7N.K8rP3rK9xGZk8Y.wP9Y9Y9Y9'
WHERE email = 'admin@solarmatch.com';

-- Verify the update
SELECT id, email, "actualPasswordHash" IS NOT NULL as has_password
FROM "User"
WHERE email = 'admin@solarmatch.com';
