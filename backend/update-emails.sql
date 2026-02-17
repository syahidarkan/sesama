-- Update all admin emails (emails ending with @sobatbantu.com) to syhd.acan@gmail.com
-- Run this SQL in your database

-- First, let's see which emails will be affected
SELECT id, name, email, role
FROM users
WHERE email LIKE '%@sobatbantu.com';

-- Update all @sobatbantu.com emails to syhd.acan@gmail.com
UPDATE users
SET email = 'syhd.acan@gmail.com'
WHERE email LIKE '%@sobatbantu.com';

-- Verify the update
SELECT id, name, email, role
FROM users
WHERE email = 'syhd.acan@gmail.com'
ORDER BY created_at;
