export function isValidAddress(hex: unknown): hex is `0x${string}` {
	return typeof hex === 'string' && /^0x[0-9a-fA-F]{40}$/.test(hex);
}
