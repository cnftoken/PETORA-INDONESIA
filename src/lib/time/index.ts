import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export function toLocalTime(utcDate: Date | string, zone: string): Date {
  return toZonedTime(new Date(utcDate), zone);
}

export function toUtcTime(localDate: Date | string, zone: string): Date {
  return fromZonedTime(new Date(localDate), zone);
}

export function formatLocal(date: Date | string, zone: string, fmt = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatInTimeZone(new Date(date), zone, fmt);
}

export function startOfLocalDay(date: Date | string, zone: string): Date {
  const local = toZonedTime(new Date(date), zone);
  return new Date(local.getFullYear(), local.getMonth(), local.getDate());
}
