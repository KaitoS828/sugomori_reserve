-- SUGOMORIの宿泊定員を2名→4名に拡大。料金は引き続き¥20,000/棟の固定制。

update room_types
set capacity = 4
where id = '2f5cfa1f-818d-449a-bb92-a3f1cbfc5cdc';

update plan_prices
set guest_prices = '{"1":20000,"2":20000,"3":20000,"4":20000}'::jsonb
where id = 'a9fd6b47-c62e-4f58-aea5-c234251daf03';
