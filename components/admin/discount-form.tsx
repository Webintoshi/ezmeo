"use client";

import { useMemo, useState } from "react";
import {
  AdminDiscount,
  AdminDiscountPayload,
  DISCOUNT_LIMIT_TYPE_OPTIONS,
  DISCOUNT_SCOPE_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  DISCOUNT_VISIBILITY_OPTIONS,
  DiscountLimitType,
  DiscountScope,
  DiscountType,
  DiscountVisibility,
} from "@/types/discount";

type Props = {
  initial?: AdminDiscount | null;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (payload: AdminDiscountPayload) => Promise<void>;
};

type FormState = {
  name: string;
  description: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  maxUses: number | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  scope: DiscountScope;
  visibility: DiscountVisibility;
  password: string;
  limitType: DiscountLimitType;
  tags: string;
  notes: string;
};

function formatDateInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function buildInitialState(initial?: AdminDiscount | null): FormState {
  if (!initial) {
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      name: "",
      description: "",
      code: "",
      type: "percentage",
      value: 10,
      minOrder: 0,
      maxUses: null,
      startsAt: now.toISOString().slice(0, 10),
      expiresAt: future.toISOString().slice(0, 10),
      isActive: true,
      scope: "all",
      visibility: "public",
      password: "",
      limitType: "unlimited",
      tags: "",
      notes: "",
    };
  }

  return {
    name: initial.name,
    description: initial.description || "",
    code: initial.code,
    type: initial.type,
    value: initial.value,
    minOrder: initial.minOrder || 0,
    maxUses: initial.maxUses,
    startsAt: formatDateInput(initial.startsAt),
    expiresAt: formatDateInput(initial.expiresAt),
    isActive: initial.isActive,
    scope: initial.scope,
    visibility: initial.visibility,
    password: initial.password || "",
    limitType: initial.limitType,
    tags: (initial.tags || []).join(", "),
    notes: initial.notes || "",
  };
}

export function DiscountForm({ initial = null, submitting = false, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
  const [error, setError] = useState<string | null>(null);
  const inputClass = "w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900";
  const textAreaClass = "w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900";

  const payload = useMemo<AdminDiscountPayload>(() => {
    const normalizedMaxUses = form.limitType === "unlimited" ? null : form.maxUses;

    return {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxUses: normalizedMaxUses && normalizedMaxUses > 0 ? normalizedMaxUses : null,
      startsAt: form.startsAt ? new Date(`${form.startsAt}T00:00:00.000Z`).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59.999Z`).toISOString() : null,
      isActive: form.isActive,
      metadata: {
        name: form.name.trim(),
        description: form.description.trim(),
        scope: form.scope,
        visibility: form.visibility,
        password: form.visibility === "password" ? form.password.trim() : "",
        limitType: form.limitType,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: form.notes.trim(),
      },
    };
  }, [form]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!payload.metadata.name) {
      setError("İndirim adı zorunlu.");
      return;
    }

    if (!payload.code) {
      setError("İndirim kodu zorunlu.");
      return;
    }

    if (payload.value <= 0) {
      setError("İndirim değeri 0’dan büyük olmalı.");
      return;
    }

    if (payload.type === "percentage" && payload.value > 100) {
      setError("Yüzde indirimi 100’den büyük olamaz.");
      return;
    }

    if (payload.startsAt && payload.expiresAt && new Date(payload.startsAt) >= new Date(payload.expiresAt)) {
      setError("Bitiş tarihi başlangıç tarihinden sonra olmalı.");
      return;
    }

    if (payload.metadata.visibility === "password" && !payload.metadata.password) {
      setError("Parola korumalı indirim için parola girin.");
      return;
    }

    if (payload.metadata.limitType !== "unlimited" && (!payload.maxUses || payload.maxUses <= 0)) {
      setError("Kullanım limiti zorunlu.");
      return;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="İndirim Adı *">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Kod *">
            <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className={`${inputClass} font-mono`} />
          </Field>
        </div>
        <Field label="Açıklama">
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={textAreaClass} />
        </Field>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">İndirim Ayarları</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Tip">
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as DiscountType })} className={inputClass}>
              {DISCOUNT_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={form.type === "percentage" ? "Yüzde (%)" : "Tutar (₺)"}>
            <input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) || 0 })} className={inputClass} />
          </Field>
          <Field label="Minimum Sipariş (₺)">
            <input type="number" value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: Number(event.target.value) || 0 })} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Başlangıç Tarihi">
            <input type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Bitiş Tarihi">
            <input type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className={inputClass} />
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          İndirimi aktif başlat
        </label>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Kampanya Kuralları</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Kapsam">
            <select value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value as DiscountScope })} className={inputClass}>
              {DISCOUNT_SCOPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Görünürlük">
            <select
              value={form.visibility}
              onChange={(event) => setForm({ ...form, visibility: event.target.value as DiscountVisibility })}
              className={inputClass}
            >
              {DISCOUNT_VISIBILITY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kullanım Tipi">
            <select
              value={form.limitType}
              onChange={(event) => setForm({ ...form, limitType: event.target.value as DiscountLimitType })}
              className={inputClass}
            >
              {DISCOUNT_LIMIT_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {form.visibility === "password" && (
          <Field label="Parola *">
            <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={inputClass} />
          </Field>
        )}

        {form.limitType !== "unlimited" && (
          <Field label="Kullanım Limiti *">
            <input type="number" value={form.maxUses ?? 0} onChange={(event) => setForm({ ...form, maxUses: Number(event.target.value) || 0 })} className={inputClass} />
          </Field>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Etiketler ve Notlar</h2>
        <Field label="Etiketler (virgülle ayırın)">
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Notlar">
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={`${textAreaClass} min-h-[90px]`} />
        </Field>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400"
      >
        {submitting ? "Kaydediliyor..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
