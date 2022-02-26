/**
 * Ensure `o` has a value.
 *
 * @param o
 * @returns
 */
export const notNullish = <T>(o: T | null | undefined): o is NonNullable<T> => o != null
