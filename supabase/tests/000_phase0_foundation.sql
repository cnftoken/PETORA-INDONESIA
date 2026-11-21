begin;

select plan(8);
select has_table('public', 'company', 'company table exists');
select has_table('public', 'branches', 'branches table exists');
select has_table('public', 'users', 'users table exists');
select has_column('public', 'branches', 'timezone', 'branches stores IANA timezone');
select has_table('public', 'company_setting_history', 'M01-F07 setting history exists');
select has_table('public', 'branch_assignments', 'M01-F06 branch assignments exist');
select has_table('public', 'role_permissions', 'M01-F04 role permissions exist');
select has_table('public', 'user_permissions', 'M01-F05 staff permissions exist');

select * from finish();
rollback;
