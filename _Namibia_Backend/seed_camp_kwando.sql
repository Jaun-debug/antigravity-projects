-- ============================================================
-- Seed: Camp Kwando (reference lodge)
-- Run AFTER schema.sql. Rack = STO ÷ 0.80 (the 20% STO discount).
-- ============================================================

insert into public.lodges (slug, name, region)
values ('camp-kwando', 'Camp Kwando', 'Zambezi & Caprivi')
on conflict (slug) do nothing;

-- Rack rate rows (tier prices are computed at request time: rack * (1 - tier/100))
insert into public.rates (lodge_id, section, room_type, rack_price, sort)
select l.id, v.section, v.room_type, v.rack_price, v.sort
from public.lodges l,
(values
  ('Bed & Breakfast (per person, per night)', 'Tented River Chalet — Single',            2015, 1),
  ('Bed & Breakfast (per person, per night)', 'Tented River Chalet — Double (pp sharing)',1725, 2),
  ('Bed & Breakfast (per person, per night)', 'Tented Chalet — Single',                  1510, 3),
  ('Bed & Breakfast (per person, per night)', 'Tented Chalet — Double (pp sharing)',      1340, 4),
  ('Bed & Breakfast (per person, per night)', 'Tree House — Single',                      3375, 5),
  ('Bed & Breakfast (per person, per night)', 'Tree House — Double (pp sharing)',         2565, 6),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tented River Chalet — Single',            2540, 7),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tented River Chalet — Double (pp sharing)',2250, 8),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tented Chalet — Single',                  2035, 9),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tented Chalet — Double (pp sharing)',      1865, 10),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tree House — Single',                      3900, 11),
  ('Dinner, Bed & Breakfast (per person, per night)', 'Tree House — Double (pp sharing)',         3090, 12),
  ('Activities (per person)', 'Game Drive (min 2 / max 10 pax)', 950, 13),
  ('Activities (per person)', 'Boat Cruise (morning or sunset)', 690, 14),
  ('Activities (per person)', 'Bird Cruise (mornings only)',     690, 15)
) as v(section, room_type, rack_price, sort)
where l.slug = 'camp-kwando';

-- A placeholder global contract template (replace body with your real agreement text)
insert into public.contract_templates (lodge_id, version, body)
values (null, 1, 'Standard Namibia Rates Lodge–Agent Agreement v1. By signing, the agent agrees to the supplier''s trade terms, payment and cancellation policies. [Replace with final legal wording.]')
on conflict do nothing;
