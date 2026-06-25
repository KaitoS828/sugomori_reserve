-- 実データ投入（トレイルハウス SUGOMORI）
-- サンプル/テストデータを全削除して実データに差し替える。

delete from reservation_options;
delete from reservations;
delete from rooms;
delete from plan_prices;
delete from plans;
delete from room_types;
delete from facility;

-- 施設
insert into facility (name, address, phone, check_in_time, check_out_time, cancel_policy)
values (
  'トレイルハウス SUGOMORI',
  '北海道広尾郡大樹町下大樹',
  '',
  '15:00',
  '10:00',
  '{"7":0,"3":0.5,"0":1.0}'::jsonb
);

-- 客室タイプ（1日1組・1棟貸し）
with rt as (
  insert into room_types (name, description, capacity, base_price, amenities, sort_order)
  values (
    'SUGOMORI（1日1組限定）',
    '南十勝・大樹町下大樹。光害のない星空の下、1LDKのトレイルハウスを一棟貸切。',
    2,
    20000,
    '["キッチン","洗面台","冷蔵庫","電子レンジ","調理器具・食器","タオル","基本アメニティ","焚き火・BBQ可","敷地内無料駐車場"]'::jsonb,
    1
  )
  returning id
)
insert into rooms (room_type_id, name)
select id, 'SUGOMORI' from rt;

-- プラン（素泊まりのみ）
insert into plans (name, description, long_description, meal_type, tags, discounts, sort_order)
values
(
  '素泊まりプラン',
  '【素泊まり】1LDKのトレイルハウスを一棟貸切。自然の音に耳を澄ませる静かなステイ。',
  E'【素泊まり】南十勝・大樹町下大樹の1LDKトレイルハウスを一棟まるごと貸切。\n\n幹線道路から少し離れた静寂の地で、光害のない満天の星と、焚き火・BBQを楽しめます。\nキッチン・洗面台・冷蔵庫・電子レンジを完備し、タオル・基本アメニティ付き。\n\n※本プランにお食事は含まれません。キッチンでの自炊、または焚き火・BBQをお楽しみください。',
  'none',
  '["1棟貸し","禁煙","焚き火可"]'::jsonb,
  '[{"min":7,"max":27,"rate":0.10},{"min":28,"max":null,"rate":0.20}]'::jsonb,
  1
);

-- プラン料金（プラン×客室タイプ）
insert into plan_prices (plan_id, room_type_id, price_per_night)
select p.id, rt.id, 20000
from plans p cross join room_types rt;
