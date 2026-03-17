import type { IconType } from 'react-icons';

export interface SelectInputProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    options: { value: string | number; label: string }[];
    icon?: IconType;
}
