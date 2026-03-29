UPDATE public.notifications
SET body = REPLACE(body, ' tiene un trabajo asignado que ha alcanzado 10 días transcurridos.', ' tiene un trabajo que ha alcanzado 10 días transcurridos.')
WHERE type = 'job_elapsed_ten_days'
  AND recipient_role = 'laboratory';