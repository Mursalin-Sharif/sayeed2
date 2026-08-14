-- Harit Nursery — run this in the Supabase SQL editor
-- Then create a public Storage bucket named: media

create table if not exists products (
  id text primary key,
  name text not null,
  headline text not null default '',
  description text not null default '',
  price numeric not null,
  compare_price numeric,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  category text not null default '',
  stock int not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  items jsonb not null default '[]'::jsonb,
  customer_name text not null,
  phone text not null,
  address text not null,
  district text not null,
  shipping_type text not null,
  shipping_fee numeric not null,
  subtotal numeric not null,
  total numeric not null,
  status text not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists carousel_slides (
  id text primary key,
  image text not null,
  title text not null default '',
  subtitle text not null default '',
  cta_text text not null default '',
  cta_link text not null default '/',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists landing_media (
  id text primary key,
  type text not null check (type in ('image', 'video')),
  url text not null,
  title text not null default '',
  caption text not null default '',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists landing_content (
  id int primary key default 1,
  hero_title text not null default '',
  hero_subtitle text not null default '',
  package_title text not null default '',
  package_items jsonb not null default '[]'::jsonb,
  story_title text not null default '',
  story_body text not null default '',
  why_title text not null default '',
  why_items jsonb not null default '[]'::jsonb,
  payment_title text not null default '',
  payment_number text not null default '',
  payment_note text not null default '',
  offer_product_id text not null default 'prod_offer_pack'
);

alter table products enable row level security;
alter table orders enable row level security;
alter table carousel_slides enable row level security;
alter table landing_media enable row level security;
alter table landing_content enable row level security;

create policy "public read products" on products for select using (true);
create policy "public read slides" on carousel_slides for select using (true);
create policy "public read media" on landing_media for select using (true);
create policy "public read landing" on landing_content for select using (true);
create policy "public insert orders" on orders for select using (true);
create policy "public create orders" on orders for insert with check (true);

create policy "admin all products" on products for all using (auth.role() = 'authenticated');
create policy "admin all orders" on orders for all using (auth.role() = 'authenticated');
create policy "admin all slides" on carousel_slides for all using (auth.role() = 'authenticated');
create policy "admin all media" on landing_media for all using (auth.role() = 'authenticated');
create policy "admin all landing" on landing_content for all using (auth.role() = 'authenticated');
