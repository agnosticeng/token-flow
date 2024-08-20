export type ResultSet = {
	column_descriptors: ColumnDescriptor[];
	rows?: Row[] | null;
};

interface ColumnDescriptor {
	name: string;
	type: string;
}

type Row = Value[];
export type Value = string | string[] | Record<string, string>;
