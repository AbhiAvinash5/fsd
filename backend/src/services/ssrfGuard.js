import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data',
  'kubernetes.default.svc'
];

/**
 * Checks whether an IP address is private, loopback, link-local, or cloud metadata.
 * @param {string} ip
 * @returns {boolean} true if blocked
 */
export function isBlockedIp(ip) {
  try {
    const parsed = ipaddr.parse(ip);
    const range = parsed.range();

    // Specific cloud metadata addresses
    if (ip === '169.254.169.254' || ip === '100.100.100.200') {
      return true;
    }

    const blockedRanges = [
      'loopback',
      'private',
      'linkLocal',
      'broadcast',
      'carrierGradeNat',
      'uniqueLocal',
      'unspecified'
    ];

    if (blockedRanges.includes(range)) {
      return true;
    }

    // IPv4-mapped IPv6 check
    if (parsed.kind() === 'ipv6' && parsed.isIPv4MappedAddress()) {
      const v4 = parsed.toIPv4Address();
      return isBlockedIp(v4.toString());
    }

    return false;
  } catch (err) {
    return true; // If parsing fails, fail closed for security
  }
}

/**
 * Validates a target URL against SSRF vulnerabilities:
 * - Checks protocol (http/https only)
 * - Checks blocked domain names
 * - Resolves DNS and checks all resulting IP addresses
 * 
 * @param {string} urlString
 * @returns {Promise<{ safe: boolean, normalizedUrl: string, hostname: string, resolvedIps: string[] }>}
 */
export async function validateSafeUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('Please provide a valid website URL.');
  }

  let parsedUrl;
  let normalized = urlString.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  try {
    parsedUrl = new URL(normalized);
  } catch (e) {
    throw new Error(`Invalid URL format: ${urlString}`);
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Security policy violation: Only HTTP and HTTPS protocols are permitted.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Check username/password in URL (e.g. http://user:pass@example.com)
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('Security policy violation: URLs containing user credentials are not allowed.');
  }

  // Check blacklist hosts
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new Error(`Security policy violation: Access to '${hostname}' is prohibited (SSRF protection).`);
  }

  // Check raw IP in hostname
  if (ipaddr.isValid(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new Error(`Security policy violation: Direct access to private/internal IP '${hostname}' is blocked.`);
    }
  }

  // Resolve DNS to verify all destination IPs
  let addresses = [];
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    addresses = lookupResults.map(r => r.address);
  } catch (dnsErr) {
    // If DNS resolution fails, throw friendly message
    throw new Error(`Unable to resolve host '${hostname}'. Check the domain name or network connectivity.`);
  }

  if (addresses.length === 0) {
    throw new Error(`No IP addresses found for host '${hostname}'.`);
  }

  for (const ip of addresses) {
    if (isBlockedIp(ip)) {
      throw new Error(`Security policy violation: Domain '${hostname}' resolves to private/internal IP address (${ip}). Request aborted.`);
    }
  }

  return {
    safe: true,
    normalizedUrl: parsedUrl.toString(),
    hostname,
    resolvedIps: addresses
  };
}

