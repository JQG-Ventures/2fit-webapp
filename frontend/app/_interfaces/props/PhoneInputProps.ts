interface PhoneInputProps {
    label: string;
    countryCode: string;
    phoneNumber: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    countryCodes: { code: string; abbreviation: string }[];
}
