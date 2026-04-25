export function relativeDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Demain';
  if (diff === -1) return 'Hier';
  if (diff > 0 && diff <= 6) return `Dans ${diff} j`;
  if (diff < 0 && diff >= -6) return `Il y a ${-diff} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
