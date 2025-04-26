import { IconType } from 'react-icons';

export interface InputWithIconProps {
    label: string;
    name: string;
    type: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    icon?: IconType;
}
