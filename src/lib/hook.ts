// lib/utils.ts
export function createQueryString(
  params: URLSearchParams,
  name: string,
  value: string
) {
  const newParams = new URLSearchParams(params.toString());
  newParams.set(name, value);
  return newParams.toString();
}
