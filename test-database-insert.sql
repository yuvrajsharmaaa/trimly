-- Check the exact structure of the urls table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'urls'
ORDER BY ordinal_position;

-- Check if there are any constraints or issues
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'urls';

-- Try a test insert to see if it works
INSERT INTO urls (
    id,
    original_url,
    short_url,
    custom_url,
    title,
    clicks,
    user_id
) VALUES (
    gen_random_uuid(),
    'https://example.com',
    'test123',
    NULL,
    'Test URL',
    0,
    NULL
);

-- Check if the insert worked
SELECT * FROM urls WHERE short_url = 'test123';

-- Clean up test
DELETE FROM urls WHERE short_url = 'test123';
