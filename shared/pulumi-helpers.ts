export function truncatePulumiResourceName(name: string) {
  return name.substring(
    0,
    64 - 1 - 7 /* maximum 64 - 1 dash - 7 random chars */
  );
}
