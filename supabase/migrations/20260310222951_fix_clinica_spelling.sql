-- Update jobs table constraint to use correct spelling with tilde
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Update existing records if they have the old values
UPDATE jobs SET status = 'En clínica (sin citar)' WHERE status = 'En clinica (sin citar)';
UPDATE jobs SET status = 'En clínica (citado)' WHERE status = 'En clinica (citado)';

-- Re-apply the constraint
ALTER TABLE jobs ADD CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['En laboratorio'::"text", 'En clínica (sin citar)'::"text", 'En clínica (citado)'::"text", 'Cerrado'::"text"])));
