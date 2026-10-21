export const EGYPTIAN_PHONE_REGEX = /^(010|011|012|015)[0-9]{8}$/;

/**
 * Normalizes Egyptian phone number into standard 11-digit local format:
 * Example: "+201040925170" -> "01040925170", "00201040925170" -> "01040925170"
 */
export function normalizeEgyptianPhone(input: string): string {
  if (!input) return '';
  let cleaned = input.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('002')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('20')) {
    cleaned = cleaned.substring(2);
  }
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function isValidEgyptianPhone(phone: string): boolean {
  const normalized = normalizeEgyptianPhone(phone);
  return EGYPTIAN_PHONE_REGEX.test(normalized);
}
