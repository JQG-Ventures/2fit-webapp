import type { IconType } from 'react-icons';

export interface FormField {
    label: string;
    name: string;
    type: string;
    placeholder?: string;
    icon?: IconType;
    options?: { value: string | number; label: string }[];
}
