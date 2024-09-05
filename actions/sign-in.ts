'use server';

import { signIn as nextAuthSignIn } from "next-auth/react";

export async function signIn(provider: string, options: any) {
  return nextAuthSignIn(provider, options);
}
