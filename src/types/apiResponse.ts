export interface ApiResponse<T> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: T;
}