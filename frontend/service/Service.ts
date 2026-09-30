import { isAxiosError, type AxiosError } from "axios";
import type { ApiResponse } from "~/types/api.types";
import API from "./API";


function isAxiosUnauthorized(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as AxiosError).response?.status === 401
  );
}


function fixUnauthorized() {
  // const token = useToken();
  localStorage.removeItem("");
  localStorage.setItem("isLogged", JSON.stringify(false));
  // token.value = null;
}

// The backend (backend/src/common/http-exception.filter.ts) always returns
// { data:null, status, message, success:false } on error, but axios rejects
// the promise for any non-2xx before that body reaches a plain `res.data`
// read — the formatted error lives on err.response.data. Extract it so
// callers get the real backend message instead of a thrown axios error.
function formatError<T>(err: unknown): ApiResponse<T> {
  if (isAxiosUnauthorized(err)) {
    fixUnauthorized();
  }
  if (isAxiosError(err)) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Unknown error',
      data: null,
    } as ApiResponse<T>;
  }
  return {
    success: false,
    message: err instanceof Error ? err.message : 'Unknown error',
    data: null,
  } as ApiResponse<T>;
}

export default {
  async get<T>(
    url: string,
    lang: string,
    token: string | null = null
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await API().get<ApiResponse<T>>(url, { headers });
      return res.data;
    } catch (err: unknown) {
      return formatError<T>(err);
    }
  },

  async post<T, B>(
    url: string,
    lang: string,
    body: B,
    token: string | null = null
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await API().post<ApiResponse<T>>(url, body, { headers });
      return res.data;
    } catch (err: unknown) {
      return formatError<T>(err);
    }
  },
  async delete<T>(
    url: string,
    lang: string,
    token: string | null = null
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await API().delete<ApiResponse<T>>(url, { headers });
      return res.data;
    } catch (err: unknown) {
      return formatError<T>(err);
    }
  },

  async patch<T, B>(
    url: string,
    lang: string,
    body: B,
    token: string | null = null
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await API().patch<ApiResponse<T>>(url, body, { headers });
      return res.data;
    } catch (err: unknown) {
      return formatError<T>(err);
    }
  }
};
