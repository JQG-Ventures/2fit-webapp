import { signIn as signInClient, signOut as signOutClient } from "next-auth/react";

export async function signOutF() {
  await signOutClient({ redirect: false });
}

export async function signInF(formData: any) {
  try {
    const response = await signInClient("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    console.log("response", response);
    return response;
  } catch (err) {
    throw err;
  }
}
