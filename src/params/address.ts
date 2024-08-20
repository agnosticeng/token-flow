import { isValidAddress } from '$lib/utils/address';

export function match(param: string) {
	return isValidAddress(param);
}
