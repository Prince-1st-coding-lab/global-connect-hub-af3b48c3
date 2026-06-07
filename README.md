# Noble Spaces — Interior Design, Furniture & Renovation in Kigali, Rwanda

Marketing + booking site for **Noble Spaces**, a multi-service interior design,
custom furniture, kitchen, ceiling, painting and renovation company based in
Kigali, Rwanda. Built with React 18, Vite 5, TypeScript 5, Tailwind v3 and
shadcn/ui. Backend data (admin, promoters, payments, payment links) lives in
an external Supabase project; the site also ships with Lovable Cloud (managed
Supabase) for edge functions.

- Live site: https://noblespaces.rw
- Stack: React + Vite + Tailwind + shadcn/ui + i18next (EN / FR / RW)
- Contact: **+250 793 521 437** · info@noblespaces.rw

---

## 1. Local setup

```bash
bun install         # or: npm install / pnpm install
cp .env.example .env
# fill in the values (see section 2)
bun run dev         # starts Vite on http://localhost:5173
```

---

## 2. Environment variables

All env vars are prefixed `VITE_` so they are bundled into the client.
Copy `.env.example` → `.env` and fill in:

| Variable                          | Where to get it                                       | Purpose                              |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| `VITE_SUPABASE_URL`               | Lovable Cloud (managed automatically)                 | Edge functions runtime               |
| `VITE_SUPABASE_PUBLISHABLE_KEY`   | Lovable Cloud (managed automatically)                 | Edge functions runtime               |
| `VITE_SUPABASE_PROJECT_ID`        | Lovable Cloud (managed automatically)                 | Edge functions runtime               |
| `VITE_EXTERNAL_SUPABASE_URL`      | External Supabase → Project Settings → API → URL      | Admin panel, promoters, payments     |
| `VITE_EXTERNAL_SUPABASE_ANON_KEY` | External Supabase → Project Settings → API → anon key | Admin panel, promoters, payments     |

> ⚠️ The "publishable / anon" keys above are **public** by design (they only
> grant access constrained by Row Level Security). Never commit a `service_role`
> key.

After editing `.env`, restart `bun run dev`.

---

## 3. External Supabase — full database setup

The admin panel (`/admin`) and the booking dialog talk to an **external**
Supabase project (separate from Lovable Cloud). When you spin up a new
Supabase project, run the SQL below in **SQL Editor → New query**. It is
idempotent (`if not exists` / `create or replace`).

### 3.1 Enums + helper function

```sql
-- Roles enum
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null; end $$;

-- Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger language plpgsql
set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;
```

### 3.2 `user_roles` (admin authentication)

Roles must live in a **separate table** (never on profiles) to prevent
privilege escalation.

```sql
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.app_role not null,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all    on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- Security-definer helper: avoids recursive RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());
```

To grant admin access, create an Auth user (Authentication → Users) then:

```sql
insert into public.user_roles (user_id, role)
values ('<paste-user-uuid-here>', 'admin');
```

### 3.3 `promoters`

```sql
create table if not exists public.promoters (
  id             uuid primary key default gen_random_uuid(),
  name           text,
  phone          text,
  referral_code  text not null unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

grant select, insert, update, delete on public.promoters to authenticated;
grant all on public.promoters to service_role;

alter table public.promoters enable row level security;

create policy "Admins manage promoters"
  on public.promoters for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_promoters_updated_at
  before update on public.promoters
  for each row execute function public.update_updated_at_column();
```

### 3.4 `payments`

```sql
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text,
  customer_phone  text,
  amount          numeric not null check (amount >= 0),
  referral_code   text,
  promoter_id     uuid references public.promoters(id) on delete set null,
  payment_status  text not null default 'pending'
                  check (payment_status in ('pending','completed','failed','cancelled')),
  transaction_id  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

grant select on public.payments to authenticated;
grant all    on public.payments to service_role;

alter table public.payments enable row level security;

create policy "Admins read payments"
  on public.payments for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at_column();
```

### 3.5 `payment_links` (NEW — used by admin + booking dialog)

The admin panel manages a list of payment links (label + amount + URL).
The booking dialog reads the **active** ones publicly and renders them as
buttons that open in a new tab.

```sql
create table if not exists public.payment_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  amount      numeric not null check (amount > 0),
  url         text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

grant select on public.payment_links to anon, authenticated;
grant insert, update, delete on public.payment_links to authenticated;
grant all on public.payment_links to service_role;

alter table public.payment_links enable row level security;

-- Public can read only the active ones (shown in the booking dialog)
create policy "Public reads active payment links"
  on public.payment_links for select
  to anon, authenticated
  using (active = true);

-- Admins can do everything
create policy "Admins manage payment links"
  on public.payment_links for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_payment_links_updated_at
  before update on public.payment_links
  for each row execute function public.update_updated_at_column();
```

### 3.6 Auth settings

In the external project: **Authentication → Providers → Email** → disable
"Confirm email" if you want admins to sign in immediately, or leave it on
and confirm via the email link. The site uses **email + password** for the
`/admin` route (see `src/pages/Admin.tsx`).

---

## 4. Switching to a new Supabase account

When you provision a fresh external Supabase project:

1. Run **all** the SQL in section 3 in the new project's SQL editor.
2. Create an admin user (Authentication → Users → Add user) and add a row
   in `user_roles` with `role = 'admin'` (see section 3.2).
3. Copy the new project's **URL** and **anon key** from
   *Project Settings → API*.
4. Paste them into your local `.env`:

   ```env
   VITE_EXTERNAL_SUPABASE_URL=https://<new-ref>.supabase.co
   VITE_EXTERNAL_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Restart `bun run dev`. The admin panel, booking payment links and
   promoters dashboard will now point at the new project.

> `src/integrations/external-supabase.ts` reads these env vars and falls
> back to hard-coded defaults only when they are missing — so the moment
> `.env` is filled in, the new project takes over.

---

## 5. Admin panel (`/admin`)

After logging in with an admin email, you can:

- **Payment Links** — create / edit / delete labelled amounts with their
  payment URL. Active links appear instantly in the booking dialog and
  open in a new tab when a customer clicks them.
- **Promoters** — manage referral codes used in promotional campaigns.
- **Payments** — read-only history of recorded payments.

---

## 6. Project structure

```
src/
  components/
    BookingDialog.tsx       ← booking + payment links UI
    SiteLayout.tsx          ← per-route SEO meta
    sections/               ← home page sections (Hero, Services, …)
  integrations/
    external-supabase.ts    ← external project client (configurable via env)
    supabase/client.ts      ← Lovable Cloud client (auto-generated, do not edit)
  pages/
    Home.tsx · ServicesPage.tsx · ServiceDetail.tsx
    AboutPage.tsx · GalleryPage.tsx · ContactPage.tsx
    Admin.tsx               ← /admin dashboard
  data/services.ts          ← canonical service catalog
  i18n.ts                   ← EN / FR / RW translations
public/
  robots.txt · sitemap.xml · favicon.png
supabase/
  functions/                ← Lovable Cloud edge functions (xentripay-*)
```

---

## 7. SEO

Per-route `<title>`, `<meta description>`, keywords, canonical, OG tags
and JSON-LD are set in `src/components/SiteLayout.tsx` and `index.html`.
The site exposes `LocalBusiness` + `WebSite` structured data and ships
with `sitemap.xml` and `robots.txt`.

Keyword strategy targets **services + location** (e.g. *modern kitchen
installation Kigali*, *bespoke wardrobes Rwanda*, *interior design
Gikondo*), not the brand name alone.

---

## 8. Scripts

```bash
bun run dev       # start dev server
bun run build     # production build (handled by the platform)
bunx vitest run   # run unit tests
```

---

## 9. Paypack Checkout integration (Rwanda)

The site accepts online payments through **Paypack** (MTN MoMo, Airtel
Money, cards). The amount each customer pays is **set by the admin** in
`/admin → Payment Links` — there are no hard-coded prices in code.

### 9.1 Architecture

```
Browser ──▶ Edge fn  initiate-paypack-checkout
                       │  1. inserts row into `orders` (status=pending)
                       │  2. POST  https://payments.paypack.rw/api/checkout/initiate
                       ▼
                     Paypack hosted checkout
                       │  customer pays with MoMo / Airtel / card
                       ▼
            Edge fn  paypack-webhook   ◀── HMAC-SHA256 signed POST
                       │  verifies x-paypack-signature
                       │  updates `orders.status` → completed | failed | cancelled
                       ▼
              Browser is redirected to
                /payment-success   or   /payment-cancelled
```

### 9.2 Files

| Path                                                    | Purpose                                        |
| ------------------------------------------------------- | ---------------------------------------------- |
| `supabase/functions/initiate-paypack-checkout/index.ts` | Create order + request hosted checkout        |
| `supabase/functions/paypack-webhook/index.ts`           | HEAD probe + HMAC verification + status update |
| `docs/sql/orders.sql`                                   | `orders` table schema (already applied)        |
| `src/components/PayNowButton.tsx`                       | Reusable Pay Now button                        |
| `src/components/BookingDialog.tsx`                      | Booking dialog pay buttons (admin amounts)     |
| `src/pages/PaymentSuccess.tsx`                          | Success landing page                           |
| `src/pages/PaymentCancelled.tsx`                        | Cancelled landing page                         |

### 9.3 Required edge function secrets

Add these in **Lovable → Project Settings → Functions → Secrets**:

| Secret name                | Where it comes from                                  |
| -------------------------- | ---------------------------------------------------- |
| `PAYPACK_APP_ID`           | Paypack dashboard → Applications → `application_id`  |
| `PAYPACK_WEBHOOK_SIGN_KEY` | A signing key you choose; paste the same value into Paypack's webhook configuration |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected — do
not add them manually.

### 9.4 Configure the webhook in Paypack

In the Paypack dashboard, set the webhook URL to:

```
https://<your-cloud-project-ref>.functions.supabase.co/paypack-webhook
```

Paypack pings the URL with a HEAD request first; our function responds
200 to that. Real events come as `POST` with header
`x-paypack-signature: <hex or base64 HMAC-SHA256 of the raw body>`.

### 9.5 `orders` table

```sql
-- See docs/sql/orders.sql for the full, idempotent script.
create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,
  email       text,
  item_name   text,
  amount      integer not null,
  status      text not null default 'pending'
              check (status in ('pending','completed','failed','cancelled')),
  paypack_ref text,
  session_id  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

RLS: authenticated users can read their own orders (`user_id =
auth.uid()`). Writes happen only from the edge functions via the
service role.

### 9.6 Admin-driven pricing

In `/admin → Payment Links` create entries like:

| Label                        | Amount (RWF) |
| ---------------------------- | ------------ |
| Site visit & consultation    | 30 000       |
| Kitchen design deposit       | 250 000      |
| Custom wardrobe deposit      | 150 000      |

Each active link shows up in the booking dialog. Clicking it invokes
`initiate-paypack-checkout` with that exact amount and opens the
Paypack-hosted payment page in a new tab.

### 9.7 Using `PayNowButton` elsewhere

```tsx
import { PayNowButton } from "@/components/PayNowButton";

<PayNowButton amount={30000} itemName="Consultation" email={user?.email} />
```

### 9.8 Local testing

```bash
# Test the webhook responds to Paypack's HEAD probe
curl -I https://<ref>.functions.supabase.co/paypack-webhook
# → HTTP/2 200
```

You can also invoke the initiate function from the browser console:

```js
const { data, error } = await window.supabase.functions.invoke(
  "initiate-paypack-checkout",
  { body: { amount: 1000, item_name: "Test", email: "you@example.com" } },
);
console.log(data, error);
```

---

## 10. Scripts

```bash
bun run dev       # start dev server
bun run build     # production build (handled by the platform)
bunx vitest run   # run unit tests
```

---

## 11. License

© Noble Spaces. All rights reserved.

