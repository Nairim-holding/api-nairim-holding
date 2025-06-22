export default function verifyDate(input: string): Date | null {
  const date = new Date(input);

  if (isNaN(date.getTime())) return null; 

  const year = date.getUTCFullYear();
  if (year < 1900 || year > 2100) return null; 

  return date;
}