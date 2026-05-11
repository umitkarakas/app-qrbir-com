import { useState } from 'react';
import type { ContactFormContent } from '../../../types/blocks';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import { Check } from 'lucide-react';

interface ContactFormProps {
  content: ContactFormContent;
  blockId: string;
  siteId?: string;
}

export default function ContactForm({ content, blockId, siteId }: ContactFormProps) {
  void blockId;
  void siteId;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setSubmitted(true);
    } catch {
      setError('Gönderim başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--theme-success)', opacity: 0.2 }}>
          <Check className="w-6 h-6" style={{ color: 'var(--theme-success)' }} />
        </div>
        <p className="theme-text font-medium">
          {content.successMessage || 'Mesajınız başarıyla gönderildi!'}
        </p>
      </div>
    );
  }

  const fields = content.fields || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {content.title && (
        <h3 className="text-lg font-semibold theme-text">{content.title}</h3>
      )}

      {fields.map((field) => {
        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.name}
              label={field.label}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={field.required}
              rows={4}
            />
          );
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type === 'email' ? 'email' : 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
          />
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        {content.submitText || 'Mesaj Gönder'}
      </Button>
    </form>
  );
}
