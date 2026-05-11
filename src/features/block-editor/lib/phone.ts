export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('+90')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('0090')) {
    cleaned = cleaned.slice(4);
  } else if (cleaned.startsWith('90') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return cleaned;
  }

  return cleaned;
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length === 10) {
    return `+90 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`;
  }
  return phone;
}

export function isValidTurkishPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return normalized.length === 10 && normalized.startsWith('5');
}
