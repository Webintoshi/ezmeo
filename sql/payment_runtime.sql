-- Payment runtime tables for hosted checkout, callback and webhook processing
-- Run this in Supabase SQL editor before enabling live card-based providers.

create extension if not exists "uuid-ossp";

create table if not exists payment_attempts (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    gateway_id text not null,
    provider text not null,
    status text not null default 'initiated',
    amount numeric(12,2) not null,
    currency text not null default 'TRY',
    idempotency_key text not null unique,
    checkout_token text unique,
    redirect_url text,
    provider_payment_id text,
    provider_reference_id text,
    conversation_id text,
    customer_email text,
    customer_ip inet,
    error_code text,
    error_message text,
    request_payload jsonb not null default '{}'::jsonb,
    response_payload jsonb not null default '{}'::jsonb,
    callback_payload jsonb not null default '{}'::jsonb,
    callback_received_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists payment_webhook_events (
    id uuid primary key default uuid_generate_v4(),
    provider text not null,
    gateway_id text,
    payment_attempt_id uuid references payment_attempts(id) on delete set null,
    order_id uuid references orders(id) on delete set null,
    event_type text,
    status text not null default 'received',
    signature text,
    headers jsonb not null default '{}'::jsonb,
    payload jsonb not null default '{}'::jsonb,
    error_message text,
    processed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_payment_attempts_order_id on payment_attempts(order_id);
create index if not exists idx_payment_attempts_provider on payment_attempts(provider);
create index if not exists idx_payment_attempts_status on payment_attempts(status);
create index if not exists idx_payment_webhook_events_provider on payment_webhook_events(provider);
create index if not exists idx_payment_webhook_events_attempt on payment_webhook_events(payment_attempt_id);

alter table payment_attempts enable row level security;
alter table payment_webhook_events enable row level security;

drop policy if exists "Service role has full access to payment_attempts" on payment_attempts;
create policy "Service role has full access to payment_attempts"
on payment_attempts for all
using (auth.role() = 'service_role');

drop policy if exists "Service role has full access to payment_webhook_events" on payment_webhook_events;
create policy "Service role has full access to payment_webhook_events"
on payment_webhook_events for all
using (auth.role() = 'service_role');

drop trigger if exists update_payment_attempts_updated_at on payment_attempts;
create trigger update_payment_attempts_updated_at
before update on payment_attempts
for each row execute function update_updated_at_column();
