import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  const messageDate = new Date(date);

  // Check if date is valid
  if (isNaN(messageDate.getTime())) {
    return '';
  }

  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }

  if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, 'HH:mm')}`;
  }

  return format(messageDate, 'MMM dd, HH:mm');
};

export const formatLastSeen = (date: Date | string | null | undefined): string => {
  if (!date) return 'Never';
  
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatPhoneNumber = (phone: string): string => {
  // Format +919876543210 to +91 98765 43210
  if (phone.startsWith('+91')) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

