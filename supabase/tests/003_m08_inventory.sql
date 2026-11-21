begin;

select plan(9);
select has_table('public', 'stock_batches', 'M08-F02 batch table exists');
select has_table('public', 'stock_movements', 'M08-F01/F04 stock movement table exists');
select has_table('public', 'stock_adjustments', 'M08-F03 adjustment table exists');
select has_table('public', 'stock_transfers', 'M08-F05 transfer table exists');
select has_table('public', 'stock_transfer_items', 'M08-F05 transfer item table exists');
select has_table('public', 'stock_count_sessions', 'M08-F07 opname session exists');
select has_table('public', 'stock_count_items', 'M08-F07 opname items exist');
select has_function('public', 'reduce_stock_fefo', array['uuid','uuid','integer','text','text','text'], 'BR-006/007 FEFO reduction function exists');
select has_function('public', 'inventory_balance', array['uuid','uuid'], 'BR-006 inventory balance function exists');

select * from finish();
rollback;
