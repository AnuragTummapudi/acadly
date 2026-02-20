type FetchOptions = RequestInit & { data?: any };

export async function apiRequest(url: string, options: FetchOptions = {}) {
    const { data, ...fetchOptions } = options;

    const config: RequestInit = {
        ...fetchOptions,
        headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
        },
        credentials: "include",
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: (url: string) => apiRequest(url),
    post: (url: string, data?: any) => apiRequest(url, { method: "POST", data }),
    patch: (url: string, data?: any) => apiRequest(url, { method: "PATCH", data }),
    delete: (url: string) => apiRequest(url, { method: "DELETE" }),
};
