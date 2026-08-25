-- 0008/0009/0011 で移植した nissei 由来のデータ更新migrationは、
-- plans.name = '素泊まりプラン' という「名前一致」でSUGOMORI側の同名プラン・
-- room_typeまで巻き込んで上書きしてしまっていた(2026-08-25 発覚)。
-- SUGOMORIの本来の値(定員2名・¥20,000/棟固定)へ、UUID指定で確実に復元する。

update room_types
set capacity = 2
where id = '2f5cfa1f-818d-449a-bb92-a3f1cbfc5cdc';

update plan_prices
set
  price_per_night = 20000,
  guest_prices = '{"1":20000,"2":20000}'::jsonb,
  pricing_rule = '{}'::jsonb
where id = 'a9fd6b47-c62e-4f58-aea5-c234251daf03';
