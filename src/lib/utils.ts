import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const dateToString = (dateInput: Date | string): string => {
	const date = new Date(dateInput);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const formateDate = (date: string | Date) => {
	return new Intl.DateTimeFormat('en-US', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		weekday: 'short'
	}).format(new Date(date));
};

export function isWeekend(date: Date): boolean {
	return date.getDay() === 0 || date.getDay() === 6;
}

export const slugify = (title: string): string => {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '') // remove special chars
		.trim()
		.replace(/\s+/g, '-') // spaces → dashes
		.replace(/-+/g, '-'); // collapse multiple dashes
};

export const unslugify = (slug: string): string => {
	return slug
		.replace(/-/g, ' ') // dashes → spaces
		.replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};

export const containsSpecialChar = (str: string): boolean => {
	const regex = /[^a-zA-Z0-9-\s]/;
	return regex.test(str);
};
