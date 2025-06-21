export function formatTime(time: string): string {
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}


// export function isSlotInPast(date: string, startTime: string): boolean {
//   const now = new Date();
//   const slotStart = new Date(`${date}T${startTime}`);
//   return slotStart < now && isSameDay(now, slotStart);
// }
