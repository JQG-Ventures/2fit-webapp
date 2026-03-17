'use server';
import * as auth from '@/auth';

export async function signIn(formData: FormData) {
    return (await auth.signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
    })) as unknown;
}
