begin;

select plan(4);
select has_table('public', 'company', 'company table exists');
select has_table('public', 'branches', 'branches table exists');
select has_table('public', 'users', 'users table exists');
select has_column('public', 'branches', 'timezone', 'branches stores IANA timezone');

select * from finish();
rollback;
