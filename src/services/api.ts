// ============================================================
// API Client Configuration
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

async function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
}

async function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }); // Cookies are sent automatically

    if (response.ok) {
      const data = await response.json();
      const newToken = data.metaData.accessToken;
      setAuthToken(newToken);
      return newToken;
    }
  } catch (error) {
    console.error("Failed to refresh token", error);
  }
  return null;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, skipAuth, ...fetchOptions } = options;

  // Build URL with query params
  let url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Get auth token
  const token = !skipAuth ? await getAuthToken() : null;

  // Make request
  const headers = {
    ...(!(fetchOptions.body instanceof FormData) && { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  } as HeadersInit;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include", // Ensure cookies are sent/received (CORS)
  });

  // Handle 401 Unauthorized (Token Expired)
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        // Retry original request
        return apiClient<T>(endpoint, options);
      } else {
        // Refresh failed, logout
        clearAuthToken();
        // Force clear cookies by calling logout endpoint (fire and forget)
        try {
          await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        } catch (e) { console.error("Auto-logout failed", e); }

        if (typeof window !== "undefined" && !window.location.pathname.includes("/get-started")) {
             window.location.href = "/get-started?session_expired=true&view=login";
        }
        throw new ApiError(401, "Session expired");
      }
    } else {
      // Wait for refresh to complete
      return new Promise<T>((resolve) => {
        refreshSubscribers.push(() => {
          resolve(apiClient<T>(endpoint, options));
        });
      });
    }
  }

  // Parse response
  let data;
  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      // Handle non-JSON response (e.g. empty 204 or text error)
      const text = await response.text();
      data = text ? { message: text } : {};
    }
  } catch (error) {
    console.warn("Failed to parse response body", error);
    data = { message: "Failed to parse response" };
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

// Utility methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | null | undefined> | object) =>
    apiClient<T>(endpoint, { method: "GET", params: params as Record<string, string | number | boolean | null | undefined> }),

  post: <T>(endpoint: string, body?: unknown, options: Omit<FetchOptions, "method" | "body"> = {}) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
};

export { ApiError, setAuthToken, clearAuthToken };
