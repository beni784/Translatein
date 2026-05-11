/**
 * Centralized, user-friendly error classification for Gemini API errors.
 * No raw error messages, no stack traces, no API keys leaked to the client.
 */

import { NextResponse } from "next/server";

export type ErrorType =
  | "RATE_LIMIT"
  | "QUOTA_EXCEEDED"
  | "AUTH_ERROR"
  | "INVALID_JSON"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "EMPTY_RESPONSE"
  | "VALIDATION"
  | "SERVER_ERROR";

export interface ApiErrorResponse {
  success: false;
  type: ErrorType;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const ERROR_MESSAGES: Record<ErrorType, string> = {
  RATE_LIMIT:
    "Kamu terlalu sering menerjemahkan. Tunggu beberapa detik lalu coba lagi.",
  QUOTA_EXCEEDED:
    "Kuota AI sedang penuh. Coba lagi beberapa saat lagi atau gunakan mode hemat (Quick Translate).",
  AUTH_ERROR:
    "Konfigurasi AI belum valid. Periksa API key di environment variables.",
  INVALID_JSON:
    "Respons AI belum sesuai format. Silakan coba lagi.",
  TIMEOUT:
    "AI membutuhkan waktu terlalu lama. Coba pendekkan kalimatmu atau coba lagi.",
  NETWORK_ERROR:
    "Koneksi ke layanan AI gagal. Coba lagi beberapa saat.",
  EMPTY_RESPONSE:
    "AI tidak mengembalikan hasil. Coba lagi dengan kalimat berbeda.",
  VALIDATION:
    "Input tidak valid. Periksa kembali teks yang kamu masukkan.",
  SERVER_ERROR:
    "Terjadi kesalahan internal. Coba lagi beberapa saat.",
};

/**
 * Create a typed error response.
 */
export function errorResponse(
  type: ErrorType,
  status: number,
  customMessage?: string,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      type,
      message: customMessage || ERROR_MESSAGES[type],
    },
    { status },
  );
}

/**
 * Create a typed success response.
 */
export function successResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true as const, data },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Classify a raw Gemini error into a user-friendly ErrorType.
 * This prevents any raw Google API messages from reaching the user.
 */
export function classifyGeminiError(err: unknown): {
  type: ErrorType;
  status: number;
} {
  if (!(err instanceof Error)) {
    return { type: "SERVER_ERROR", status: 500 };
  }

  const msg = err.message.toLowerCase();

  // 429 Too Many Requests — quota exceeded.
  if (msg.includes("429") || msg.includes("too many requests") || msg.includes("quota")) {
    return { type: "QUOTA_EXCEEDED", status: 429 };
  }

  // 403 Forbidden — API key issues.
  if (msg.includes("403") || msg.includes("forbidden") || msg.includes("denied access")) {
    return { type: "AUTH_ERROR", status: 403 };
  }

  // 401 Unauthorized.
  if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("invalid api key")) {
    return { type: "AUTH_ERROR", status: 401 };
  }

  // 503 Service Unavailable — temporary Google outage.
  if (msg.includes("503") || msg.includes("service unavailable") || msg.includes("overloaded")) {
    return { type: "NETWORK_ERROR", status: 503 };
  }

  // Timeout / abort.
  if (err.name === "AbortError" || msg.includes("timeout") || msg.includes("abort")) {
    return { type: "TIMEOUT", status: 504 };
  }

  // Network-level failures.
  if (
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("network") ||
    msg.includes("fetch failed")
  ) {
    return { type: "NETWORK_ERROR", status: 502 };
  }

  return { type: "SERVER_ERROR", status: 500 };
}
