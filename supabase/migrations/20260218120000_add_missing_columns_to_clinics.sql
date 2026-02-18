-- Force PostgREST schema cache reload
-- (moved later in the migration timeline to avoid insertion-before-last error on CI)

NOTIFY pgrst, 'reload schema';
