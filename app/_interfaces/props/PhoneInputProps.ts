export interface CountryCode {
    name: string;
    code: string;
    abbreviation: string;
    flag: string;
}

export interface PhoneInputProps {
    countryCode: string;
    phoneNumber: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    countryCodes: CountryCode[];
}
