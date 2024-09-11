export function capitalize(str: string) {
	return str.slice(0, 1).toUpperCase() + str.slice(1);
}

type TruncatePosition = 'start' | 'middle' | 'end';

export function truncate(str: string, length = 8, position: TruncatePosition = 'middle') {
	const trimmed = str.trim();
	if (trimmed.length <= length) return str;

	if (position === 'start') {
		return `...${trimmed.slice(-length)}`;
	}

	if (position === 'middle') {
		const [first_part, second_part] = get_parts(length);
		return `${trimmed.slice(0, first_part)}...${trimmed.slice(-second_part)}`;
	}

	if (position === 'end') {
		return `${trimmed.slice(0, length)}...`;
	}

	throw new TypeError(`Unsupported position for truncate: ${position}`);
}

function get_parts(length: number): [number, number] {
	const mid = length / 2;
	if (length % 2 === 0) return [mid, mid];

	return [Math.ceil(mid), Math.floor(mid)];
}
