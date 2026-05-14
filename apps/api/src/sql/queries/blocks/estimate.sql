-- Capped exact count: returns LEAST(real, ${cap}); frontend renders "+" when at the cap.
SELECT
  approximate_row_count ('blocks')::TEXT AS count,
  '0'::TEXT AS cost
