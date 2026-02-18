-- massive_seed_manual.sql
-- Inserta 100 pacientes, 60 especialistas, 70 laboratorios y 100 trabajos random para la clínica indicada

DO $$
DECLARE
  v_clinic_id uuid := '76286946-65e9-4daa-a5ac-5114b67518b6';
  v_patient_ids uuid[] := ARRAY[]::uuid[];
  v_specialist_ids uuid[] := ARRAY[]::uuid[];
  v_laboratory_ids uuid[] := ARRAY[]::uuid[];
  i int;
BEGIN
  -- Pacientes
  FOR i IN 1..100 LOOP
    INSERT INTO patients (id, clinic_id, name, phone, email, code)
    VALUES (gen_random_uuid(), v_clinic_id, 'Paciente ' || i, '+34' || (600000000 + i), 'paciente' || i || '@mail.com', 'P' || i)
    RETURNING id INTO v_patient_ids;
  END LOOP;

  -- Especialistas
  FOR i IN 1..60 LOOP
    INSERT INTO specialists (id, clinic_id, name, specialty, phone, email)
    VALUES (gen_random_uuid(), v_clinic_id, 'Especialista ' || i, 'Especialidad ' || ((i % 10) + 1), '+34' || (700000000 + i), 'especialista' || i || '@mail.com')
    RETURNING id INTO v_specialist_ids;
  END LOOP;

  -- Laboratorios
  FOR i IN 1..70 LOOP
    INSERT INTO laboratories (id, clinic_id, name, phone, email)
    VALUES (gen_random_uuid(), v_clinic_id, 'Laboratorio ' || i, '+34' || (800000000 + i), 'laboratorio' || i || '@mail.com')
    RETURNING id INTO v_laboratory_ids;
  END LOOP;

  -- Trabajos
  FOR i IN 1..100 LOOP
    INSERT INTO jobs (id, clinic_id, patient_id, specialist_id, laboratory_id, job_description, order_date, status)
    VALUES (
      gen_random_uuid(),
      v_clinic_id,
      v_patient_ids[1 + floor(random() * 100)],
      v_specialist_ids[1 + floor(random() * 60)],
      v_laboratory_ids[1 + floor(random() * 70)],
      'Trabajo demo ' || i,
      now() - (interval '1 day' * floor(random() * 30)),
      (ARRAY['En laboratorio','En clinica (sin citar)','En clinica (citado)','Cerrado'])[1 + floor(random() * 4)]
    );
  END LOOP;
END $$;
