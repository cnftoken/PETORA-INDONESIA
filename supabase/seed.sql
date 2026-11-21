insert into public.branches (code, name, timezone) values
  ('JKT01', 'PETORA Jakarta', 'Asia/Jakarta'),
  ('MKS01', 'PETORA Makassar', 'Asia/Makassar'),
  ('JYP01', 'PETORA Jayapura', 'Asia/Jayapura')
on conflict (code) do nothing;
