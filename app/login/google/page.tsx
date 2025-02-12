"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GoogleLoginCallback() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (status === "unauthenticated") {
            setError("No authenticated session found");
            setLoading(false);
            return;
        }

        async function handleGoogleLogin() {
            // @ts-ignore
            if (!session?.googleIdToken && status === "unauthenticated") {
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // @ts-ignore
                    body: JSON.stringify({ id_token: session?.googleIdToken })
                });

                if (!res.ok) {

                    if (res.status === 404) {
                        setError("Invalid user");
                    } else if (res.status === 400) {
                        setError("There was an error contacting google, please try again later");
                    } else if (res.status === 400) {
                        setError("User not registered with Google");
                    } 

                    setError("There was a login error, try again later")
                    
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                await signIn("flaskgoogle", {
                    access_token: data.message.access_token,
                    refresh_token: data.message.refresh_token,
                    expires_at: data.message.expires_at,
                    user_id: data.message.user_id,
                    user_name: data.message.name,
                    redirect: false
                });

                window.location.href = '/home';
            } catch {
                setError("Network error");
            }
            setLoading(false);
        }

        handleGoogleLogin();
    }, [status, session]);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Verifying Google login...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.push("/login")}
                    className="bg-black text-white px-6 py-3 rounded-md"
                >
                    Go back to Login
                </button>
            </div>
        );
    }

    return null;
}
