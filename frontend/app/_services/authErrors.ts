import type { LoginFailureReason } from '@/app/_types/auth';

export class LoginFailureError extends Error {
    readonly reason: LoginFailureReason;

    constructor(reason: LoginFailureReason, message?: string) {
        super(message ?? reason);
        this.name = 'LoginFailureError';
        this.reason = reason;
    }
}
