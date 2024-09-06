import { isSupportedChainName } from '$lib/utils/address';

export function match(param: string) {
	return isSupportedChainName(param);
}
