'use server';
import * as auth from '@/auth';

export async function signIn(formData: FormData) {
    const identifier = formData.get('identifier') ?? formData.get('email');

    return (await auth.signIn('credentials', {
        identifier,
        password: formData.get('password'),
        redirect: false,
    })) as unknown;
}
