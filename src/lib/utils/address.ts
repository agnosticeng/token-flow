export function isValidAddress(hex: unknown): hex is `0x${string}` {
	return typeof hex === 'string' && /^0x[0-9a-fA-F]{40}$/.test(hex);
}

const SUPPORTED_CHAIN_NAMES = ['ethereum', 'arbitrum', 'base', 'polygon'] as const;

export function isSupportedChainName(r: string): r is (typeof SUPPORTED_CHAIN_NAMES)[number] {
	return (SUPPORTED_CHAIN_NAMES as unknown as string[]).includes(r);
}
