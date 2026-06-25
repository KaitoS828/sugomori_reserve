-- 初期シード（ローカル開発用・SUGOMORI / base schema: 0001+0002 適用後）
insert into facility (name, address, phone, check_in_time, check_out_time, cancel_policy)
values ('トレイルハウス SUGOMORI','北海道広尾郡大樹町下大樹','','15:00','10:00','{"7":0,"3":0.5,"0":1.0}'::jsonb);

with rt as (
  insert into room_types (name, description, capacity, base_price, sort_order)
  values ('1LDKトレイルハウス','光害のない星空の下、1LDKを一棟貸切', 2, 20000, 1)
  returning id, name
)
insert into rooms (room_type_id, name)
select rt.id, 'SUGOMORI' from rt;

insert into plans (name, description, meal_type, sort_order)
values ('素泊まりプラン','お食事なし・一棟貸切','none',1);
