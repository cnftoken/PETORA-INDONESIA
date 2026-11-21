begin;

select plan(8);
select has_table('public', 'customers', 'M02-F01 customer table exists');
select has_table('public', 'animals', 'M02-F03 animal table exists');
select has_table('public', 'animal_owner_history', 'M02-F03 ownership history exists');
select has_table('public', 'animal_timeline', 'M02-F04 timeline exists');
select has_table('public', 'animal_attachments', 'M02-F05 attachments exist');
select has_column('public', 'customers', 'phone_normalized', 'M02-F01 normalized phone exists');
select has_column('public', 'animals', 'patient_number', 'M02-F03 unique patient number exists');
select has_column('public', 'animals', 'status', 'M02-F03 active/deceased status exists');

select * from finish();
rollback;
