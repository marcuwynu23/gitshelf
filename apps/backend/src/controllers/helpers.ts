export function isSingleParam(
  param: string | string[] | undefined,
): param is string {
  return typeof param === "string";
}
