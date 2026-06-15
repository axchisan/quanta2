-- 0002_seed_free_fall.sql
-- Siembra el reto predefinido "Caída Libre" (Física / cinemática, Easy).
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- La `solution` es server-only (RLS bloquea su SELECT al cliente); el server
-- valida `predicted_time_seconds` contra t = sqrt(2*h/g) con tolerancia.

insert into public.challenges (
  slug, title, subject, topic, difficulty, kind, statement,
  payload, solution, is_predefined, status, published_at
)
values (
  'caida-libre',
  'Caída Libre',
  'physics',
  'kinematics',
  'easy',
  'simulation',
  'Ajustá la altura y la gravedad, predecí cuánto tarda el objeto en caer, y soltalo para comprobarlo.',
  jsonb_build_object(
    'type', 'free_fall',
    'params', jsonb_build_object(
      'initial_height_range', jsonb_build_array(5, 100),
      'gravity_range', jsonb_build_array(1, 20),
      'object_sprite', 'apple',
      'presets', jsonb_build_array(
        jsonb_build_object('label', 'Tierra', 'gravity', 9.8),
        jsonb_build_object('label', 'Luna', 'gravity', 1.6),
        jsonb_build_object('label', 'Marte', 'gravity', 3.7)
      )
    ),
    'user_input', 'predicted_time_seconds'
  ),
  jsonb_build_object('formula', 'sqrt(2*h/g)', 'tolerance_pct', 10),
  true,
  'published',
  now()
)
on conflict (slug) do nothing;
