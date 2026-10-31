export function scoreOf(observations) {
  const list = Array.isArray(observations) ? observations : [];
  if (!list.length) return 0;
  return Math.round((list.filter((item) => item.passed).length / list.length) * 100);
}