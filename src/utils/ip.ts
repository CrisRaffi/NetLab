export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

export function maskToCidr(mask: string): number {
  const num = ipToNumber(mask);
  let cidr = 0;
  let temp = num;
  while (temp & 0x80000000) {
    cidr++;
    temp = (temp << 1) >>> 0;
  }
  return cidr;
}

export function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return numberToIp(mask);
}

export function getNetworkAddress(ip: string, mask: string): string {
  return numberToIp((ipToNumber(ip) & ipToNumber(mask)) >>> 0);
}

export function getBroadcastAddress(ip: string, mask: string): string {
  return numberToIp((ipToNumber(ip) | ~ipToNumber(mask)) >>> 0);
}

export function isSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  return getNetworkAddress(ip1, mask) === getNetworkAddress(ip2, mask);
}

export function getUsableHosts(cidr: number): number {
  if (cidr >= 31) return cidr === 31 ? 2 : 1;
  return Math.pow(2, 32 - cidr) - 2;
}

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const num = Number(p);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === p;
  });
}

export function isValidMask(mask: string): boolean {
  if (!isValidIp(mask)) return false;
  const num = ipToNumber(mask);
  const inverted = (~num) >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

export function generateMac(): string {
  const hex = '0123456789ABCDEF';
  const segments = Array.from({ length: 6 }, () =>
    hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
  );
  return segments.join(':');
}
