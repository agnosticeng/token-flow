export interface SourceLocation {
	readonly line: number;
	readonly column: number;
}

export interface GraphQLError {
	/**
	 * A short, human-readable summary of the problem that **SHOULD NOT** change
	 * from occurrence to occurrence of the problem, except for purposes of
	 * localization.
	 */
	readonly message: string;
	/**
	 * If an error can be associated to a particular point in the requested
	 * GraphQL document, it should contain a list of locations.
	 */
	readonly locations?: ReadonlyArray<SourceLocation>;
	/**
	 * If an error can be associated to a particular field in the GraphQL result,
	 * it _must_ contain an entry with the key `path` that details the path of
	 * the response field which experienced the error. This allows clients to
	 * identify whether a null result is intentional or caused by a runtime error.
	 */
	readonly path?: ReadonlyArray<string | number>;
	/**
	 * Reserved for implementors to extend the protocol however they see fit,
	 * and hence there are no additional restrictions on its contents.
	 */
	readonly extensions?: { [key: string]: unknown };
}

export interface ExecutionResult<TData = ObjMap<unknown>, TExtensions = ObjMap<unknown>> {
	errors?: ReadonlyArray<GraphQLError>;
	data?: TData | null;
	extensions?: TExtensions;
}

export interface ObjMap<T> {
	[key: string]: T;
}
