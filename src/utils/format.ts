export function formatTL(amount: number): string {
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatPercentage(value: number): string {
  return `%${value.toFixed(1)}`;
}

export function formatMinute(minute: number): string {
  return `${minute}'`;
}

export function calculateReturn(stake: number, totalOdds: number): number {
  return parseFloat((stake * totalOdds).toFixed(2));
}
