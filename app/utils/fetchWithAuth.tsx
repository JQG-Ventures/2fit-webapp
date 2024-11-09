import { getSession } from "next-auth/react";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const session = await getSession();

    let response = await fetch(url, options);

    if (response.ok) {
        return response;
    }

    if (response.status === 401) {
        console.log("Access token expired, attempting to refresh...");

        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session?.refreshToken}`,
            },
        });

        if (refreshResponse.ok) {
            const refreshedTokens = await refreshResponse.json();
            const newAccessToken = refreshedTokens.access_token;

            const headers = new Headers(options.headers || {});
            headers.set("Authorization", `Bearer ${newAccessToken}`);

            response = await fetch(url, {
                ...options,
                headers,
            });

            return response;
        } else {
            console.error("Refresh token failed, redirecting to login...");
        }
    }

    return response;
};
