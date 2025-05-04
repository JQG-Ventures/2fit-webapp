import { IconType } from 'react-icons';

export interface SelectInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    icon?: IconType;
}
