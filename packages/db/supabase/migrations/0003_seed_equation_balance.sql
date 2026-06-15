-- 0003_seed_equation_balance.sql
-- Siembra retos predefinidos de "Balanceo de Ecuaciones" (Química, Medium).
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- El server valida que los coeficientes balanceen todos los elementos y estén
-- en forma reducida (gcd=1); `solution.coefficients` es la forma canónica (feedback).

insert into public.challenges (
  slug, title, subject, topic, difficulty, kind, statement,
  payload, solution, is_predefined, status, published_at
)
values
  (
    'balanceo-agua',
    'Síntesis del agua',
    'chemistry',
    'equation_balance',
    'easy',
    'drag_drop',
    'Ajustá los coeficientes para que la ecuación quede balanceada: misma cantidad de átomos de cada elemento a ambos lados.',
    jsonb_build_object(
      'type', 'equation_balance',
      'equation', 'H₂ + O₂ → H₂O',
      'species', jsonb_build_array(
        jsonb_build_object('formula', 'H₂', 'side', 'reactant', 'atoms', jsonb_build_object('H', 2)),
        jsonb_build_object('formula', 'O₂', 'side', 'reactant', 'atoms', jsonb_build_object('O', 2)),
        jsonb_build_object('formula', 'H₂O', 'side', 'product', 'atoms', jsonb_build_object('H', 2, 'O', 1))
      ),
      'elements', jsonb_build_array('H', 'O'),
      'max_coefficient', 8
    ),
    jsonb_build_object('coefficients', jsonb_build_array(2, 1, 2)),
    true,
    'published',
    now()
  ),
  (
    'balanceo-metano',
    'Combustión del metano',
    'chemistry',
    'equation_balance',
    'medium',
    'drag_drop',
    'Balanceá la combustión del metano: ajustá los coeficientes hasta igualar los átomos de cada elemento.',
    jsonb_build_object(
      'type', 'equation_balance',
      'equation', 'CH₄ + O₂ → CO₂ + H₂O',
      'species', jsonb_build_array(
        jsonb_build_object('formula', 'CH₄', 'side', 'reactant', 'atoms', jsonb_build_object('C', 1, 'H', 4)),
        jsonb_build_object('formula', 'O₂', 'side', 'reactant', 'atoms', jsonb_build_object('O', 2)),
        jsonb_build_object('formula', 'CO₂', 'side', 'product', 'atoms', jsonb_build_object('C', 1, 'O', 2)),
        jsonb_build_object('formula', 'H₂O', 'side', 'product', 'atoms', jsonb_build_object('H', 2, 'O', 1))
      ),
      'elements', jsonb_build_array('C', 'H', 'O'),
      'max_coefficient', 8
    ),
    jsonb_build_object('coefficients', jsonb_build_array(1, 2, 1, 2)),
    true,
    'published',
    now()
  )
on conflict (slug) do nothing;
