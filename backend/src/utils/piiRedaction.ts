/**
 * PII Redaction Utilities for Safe Logging
 * Provides functions to redact or hash PII before logging.
 */

/**
 * Redact email address for safe logging.
 * 
 * Examples:
 *   user@example.com -> u***@e***.com
 *   john.doe@company.org -> j***@c***.org
 */
export function redactEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }

  try {
    const [local, domain] = email.split('@', 2);
    const domainParts = domain.split('.', 2);
    
    // Show first character of local and domain
    const localRedacted = local && local.length > 0 ? `${local[0]}***` : '***';
    const domainRedacted = domainParts[0] && domainParts[0].length > 0 
      ? `${domainParts[0][0]}***` 
      : '***';
    const domainExt = domainParts[1] || 'com';
    
    return `${localRedacted}@${domainRedacted}.${domainExt}`;
  } catch (error) {
    return '***@***.***';
  }
}

/**
 * Redact phone number for safe logging.
 * 
 * Examples:
 *   +1-555-123-4567 -> ***-***-4567
 *   (555) 123-4567 -> ***-***-4567
 *   5551234567 -> ***-***-4567
 */
export function redactPhone(phone: string): string {
  if (!phone) {
    return '***-***-****';
  }

  // Extract only digits
  const digits = phone.replace(/\D/g, '');

  if (digits.length >= 4) {
    return `***-***-${digits.slice(-4)}`;
  } else if (digits.length > 0) {
    return `***-***-${digits}`;
  } else {
    return '***-***-****';
  }
}

/**
 * Redact authentication token for logging.
 * Shows first few characters to help identify token in logs.
 */
export function redactToken(token: string, showChars: number = 6): string {
  if (!token) {
    return '***';
  }

  if (token.length <= showChars) {
    return token;
  }

  return `${token.slice(0, showChars)}***`;
}

/**
 * Redact IP address for logging.
 * Shows first 2 octets for IPv4, first 2 groups for IPv6.
 */
export function redactIPAddress(ip: string): string {
  if (!ip) {
    return '*.*.*.*';
  }

  // IPv4
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
    return '*.*.*.*';
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:*:*:*:*:*:*`;
    }
    return '*:*:*:*:*:*:*:*';
  }

  return '*.*.*.*';
}

