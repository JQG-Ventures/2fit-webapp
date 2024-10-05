
import countryCodes from '@/app/data/countryCodes.json';

export const detectCountryCode = (fullNumber: string) => {
  const sanitizedNumber = fullNumber.replace(/\s/g, ''); 

  for (const country of countryCodes) {
    const codeWithoutPlus = country.code.replace('+', '');
    if (sanitizedNumber.startsWith(codeWithoutPlus)) {
      const numberWithoutCode = sanitizedNumber.slice(codeWithoutPlus.length);
      return {
        code: country.code,
        number: numberWithoutCode.trim(), 
      };
    }
  }
  return { code: "", number: sanitizedNumber };
};
