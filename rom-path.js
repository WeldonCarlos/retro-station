export function isRomPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/roms/') || /[?#\\\u0000-\u001f]/.test(value)) return false;
  try {
    const decoded = decodeURIComponent(value);
    const segments = decoded.split('/');
    if (/[\\\u0000-\u001f]/.test(decoded) || segments.slice(1).some(part => !part || part === '.' || part === '..')) return false;
    return /\.(zip|nes|sfc|smc|md|gen|smd|bin|gb|gbc|chd|pbp|iso)$/i.test(decoded);
  } catch { return false; }
}
