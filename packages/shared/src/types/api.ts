export type ApiSuccessResponse<T> = {
  data: T
}

export type ApiErrorResponse = {
  error: string
  message: string
}
