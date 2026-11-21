begin;

select plan(7);
select has_table('public', 'catalog_categories', 'M06-F03 category table exists');
select has_table('public', 'products', 'M06-F01 product table exists');
select has_table('public', 'services', 'M06-F02 service table exists');
select has_table('public', 'price_history', 'M06-F03 price history exists');
select has_column('public', 'products', 'sale_price', 'BR-008 product price is stored in integer Rupiah');
select has_column('public', 'products', 'taxable', 'BR-020 product tax status exists');
select has_column('public', 'services', 'performer', 'M06-F02 service performer exists');

select * from finish();
rollback;
