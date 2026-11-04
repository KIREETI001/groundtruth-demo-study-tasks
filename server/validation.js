export function taskTitle(value) {
  if (typeof value !== 'string') return null;
  const title = value.trim();
  if (title.length < 1 || title.length > 80) return null;
  return title;
}

export function taskId(value) {
  if (!/^[1-9][0-9]*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
