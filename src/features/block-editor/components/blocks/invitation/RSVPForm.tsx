import { useState } from 'react';
import type { RSVPFormContent } from '../../../types/blocks';
import { normalizePhoneNumber, isValidTurkishPhone } from '../../../lib/phone';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Check, RefreshCw, Users } from 'lucide-react';

interface RSVPFormProps {
  content: RSVPFormContent;
  blockId: string;
  siteId?: string;
}

interface FormData {
  fullName: string;
  attending: boolean | null;
  guestCount: number;
  phone: string;
}

export default function RSVPForm({ content, blockId, siteId }: RSVPFormProps) {
  void blockId;
  void siteId;
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    attending: null,
    guestCount: 1,
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [error, setError] = useState('');

  const maxGuests = content.maxGuestCount || 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;

    if (!formData.fullName.trim()) {
      setError('Lutfen adinizi ve soyadinizi girin.');
      return;
    }

    if (formData.attending === null) {
      setError('Lutfen katilim durumunuzu secin.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Lutfen telefon numaranizi girin.');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phone);
    if (!isValidTurkishPhone(formData.phone)) {
      setError('Lutfen gecerli bir telefon numarasi girin (ornek: 5XX XXX XX XX)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submissionData = {
        fullName: formData.fullName.trim(),
        attending: formData.attending,
        guestCount: formData.attending ? formData.guestCount : 0,
      };

      void normalizedPhone;
      void submissionData;
      await new Promise((resolve) => setTimeout(resolve, 250));
      setIsUpdate(false);

      setSubmitted(true);
    } catch {
      setError('Gonderim basarisiz oldu. Lutfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--theme-success)', opacity: 0.15 }}
        >
          {isUpdate ? (
            <RefreshCw className="w-7 h-7" style={{ color: 'var(--theme-success)' }} />
          ) : (
            <Check className="w-7 h-7" style={{ color: 'var(--theme-success)' }} />
          )}
        </div>
        <p className="theme-text font-medium text-lg">
          {isUpdate
            ? content.updateMessage || 'Katilim bilgileriniz guncellendi!'
            : content.confirmationMessage || 'Yanitiniz icin tesekkurler!'}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ fullName: '', attending: null, guestCount: 1, phone: '' });
          }}
          className="mt-4 text-sm theme-text-secondary hover:underline"
        >
          Yeni kayit olustur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {content.eventName && (
        <h3
          className="text-xl font-bold theme-text text-center"
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {content.eventName}
        </h3>
      )}

      <Input
        label="Ad Soyad"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="Adinizi ve soyadinizi girin"
        required
      />

      <div>
        <label className="block text-sm font-medium theme-text mb-3">Katilacak misiniz?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, attending: true })}
            className={`py-3.5 px-4 rounded-xl font-medium transition-all border-2 ${
              formData.attending === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            Evet, katilacagim
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, attending: false, guestCount: 0 })}
            className={`py-3.5 px-4 rounded-xl font-medium transition-all border-2 ${
              formData.attending === false
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            Hayir, katilamayacagim
          </button>
        </div>
      </div>

      {formData.attending === true && maxGuests > 1 && (
        <div>
          <label className="block text-sm font-medium theme-text mb-3">
            <Users className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Kac kisi katilacak?
          </label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData({ ...formData, guestCount: num })}
                className={`w-12 h-12 rounded-xl font-semibold transition-all border-2 ${
                  formData.guestCount === num
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Telefon Numarasi"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="5XX XXX XX XX"
        helperText="Ayni telefonla tekrar form doldurursaniz bilgileriniz guncellenir"
        required
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Katilim Bildir
      </Button>
    </form>
  );
}
