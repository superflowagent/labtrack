-- Force PostgREST schema cache reload
-- The columns exist but PostgREST cache needs to be invalidated

NOTIFY pgrst, 'reload schema';
