const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5384";

export async function apiFetch(path: string, options: RequestInit = {}){
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_BASE_URL}${path}`,{
        ...options,
        headers: {
            "Content-Type" : "application/json",
            ...(token ? {Autherization: `Bearer ${token}`} : {}),
            ...options.headers,
        },
    });

    if(!res.ok){
        const error = await res.json().catch(() => ({message: "Something went wrong" }));
        throw new Error(error.message || "Request failed")
    }

    return res.status === 204 ? null : res.json();
}