"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import { ImageUploader } from "@/components/image-uploader";
import type { EventInvitationV1Type } from "@/schemas/event_invitation/v1";
import type { ThemeConfig } from "@/types/theme";
import { PhoneFrame } from "@/components/phone-frame";
import { EventInvitationRenderer } from "@/components/renderers/event-invitation";

export default function EventInvitationForm({
  projectId,
  initial,
  theme,
}: {
  projectId: number;
  initial: EventInvitationV1Type;
  theme?: ThemeConfig | null;
}) {
  const [c, setC] = useState<EventInvitationV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  return (
    <div className="flex gap-6 items-start">
      {/* Sol: Form */}
      <div className="flex-1 min-w-0">
        <FormSection title="Etkinlik Bilgileri" description="Davetiyede gösterilecek ana bilgiler">
          <Field label="Etkinlik Adı *">
            <input
              className={inputCls}
              value={c.event.title}
              onChange={(e) => setC({ ...c, event: { ...c.event, title: e.target.value } })}
              maxLength={120}
              placeholder="Düğün Töreni, Konser, Toplantı…"
            />
          </Field>
          <Field label="Alt Başlık" hint="Opsiyonel — yer, tema veya kısa açıklama">
            <input
              className={inputCls}
              value={c.event.subtitle ?? ""}
              onChange={(e) => setC({ ...c, event: { ...c.event, subtitle: e.target.value } })}
              maxLength={160}
              placeholder="Mutlu günümüze ortak olun"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Başlangıç Tarihi *">
              <input
                className={inputCls}
                type="date"
                value={c.event.date}
                onChange={(e) => setC({ ...c, event: { ...c.event, date: e.target.value } })}
              />
            </Field>
            <Field label="Başlangıç Saati">
              <input
                className={inputCls}
                type="time"
                value={c.event.time ?? ""}
                onChange={(e) => setC({ ...c, event: { ...c.event, time: e.target.value } })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Bitiş Tarihi">
              <input
                className={inputCls}
                type="date"
                value={c.event.endDate ?? ""}
                onChange={(e) => setC({ ...c, event: { ...c.event, endDate: e.target.value } })}
              />
            </Field>
            <Field label="Bitiş Saati">
              <input
                className={inputCls}
                type="time"
                value={c.event.endTime ?? ""}
                onChange={(e) => setC({ ...c, event: { ...c.event, endTime: e.target.value } })}
              />
            </Field>
          </div>
          <Field label="Mekan" hint="Salon adı veya kısa adres">
            <input
              className={inputCls}
              value={c.event.location ?? ""}
              onChange={(e) => setC({ ...c, event: { ...c.event, location: e.target.value } })}
              placeholder="Grand Ballroom, İstanbul"
            />
          </Field>
          <Field label="Google Maps Linki">
            <input
              className={inputCls}
              type="url"
              value={c.event.locationUrl ?? ""}
              onChange={(e) => setC({ ...c, event: { ...c.event, locationUrl: e.target.value } })}
              placeholder="https://maps.google.com/…"
            />
          </Field>
          <Field label="Açıklama" hint="Etkinlik hakkında kısa metin (opsiyonel)">
            <textarea
              className={inputCls}
              rows={3}
              value={c.event.description ?? ""}
              onChange={(e) => setC({ ...c, event: { ...c.event, description: e.target.value } })}
              maxLength={500}
            />
          </Field>
          <Field label="Kapak Görseli">
            <ImageUploader
              value={c.event.coverUrl ?? ""}
              onChange={(url) => setC({ ...c, event: { ...c.event, coverUrl: url } })}
              label=""
              hint="Etkinlik görseli — PNG/JPG, maks. 8 MB"
              shape="square"
            />
          </Field>
        </FormSection>

        <FormSection title="Organizatör" description="İletişim bilgileri (opsiyonel)">
          <Field label="İsim">
            <input
              className={inputCls}
              value={c.organizer.name ?? ""}
              onChange={(e) => setC({ ...c, organizer: { ...c.organizer, name: e.target.value } })}
              placeholder="Ayşe & Mehmet"
            />
          </Field>
          <Field label="Telefon">
            <input
              className={inputCls}
              type="tel"
              value={c.organizer.phone ?? ""}
              onChange={(e) => setC({ ...c, organizer: { ...c.organizer, phone: e.target.value } })}
              placeholder="+90 555 000 00 00"
            />
          </Field>
          <Field label="E-posta">
            <input
              className={inputCls}
              type="email"
              value={c.organizer.email ?? ""}
              onChange={(e) => setC({ ...c, organizer: { ...c.organizer, email: e.target.value } })}
              placeholder="iletisim@etkinlik.com"
            />
          </Field>
        </FormSection>

        <FormSection title="RSVP (Katılım Bildirimi)" description="Misafirler buton aracılığıyla katılım bildiriminde bulunabilir">
          <Field label="RSVP Aktif">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={c.rsvp.enabled}
                onChange={(e) => setC({ ...c, rsvp: { ...c.rsvp, enabled: e.target.checked } })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Katılım butonu göster</span>
            </label>
          </Field>
          {c.rsvp.enabled && (
            <>
              <Field label="Buton Yazısı">
                <input
                  className={inputCls}
                  value={c.rsvp.buttonText}
                  onChange={(e) => setC({ ...c, rsvp: { ...c.rsvp, buttonText: e.target.value } })}
                  maxLength={60}
                  placeholder="Katılacağım"
                />
              </Field>
              <Field label="RSVP URL" hint="Form, WhatsApp veya e-posta linki">
                <input
                  className={inputCls}
                  type="url"
                  value={c.rsvp.url ?? ""}
                  onChange={(e) => setC({ ...c, rsvp: { ...c.rsvp, url: e.target.value } })}
                  placeholder="https://form.com/…"
                />
              </Field>
            </>
          )}
        </FormSection>

        <SaveBar saving={saving} error={error} message={message} onSave={() => save(c)} />
      </div>

      {/* Sağ: Canlı Önizleme */}
      {theme && (
        <div className="hidden lg:block shrink-0 sticky top-6">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium">Canlı Önizleme</p>
          <PhoneFrame>
            <EventInvitationRenderer content={c} theme={theme} />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}
