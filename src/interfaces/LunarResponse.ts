export interface LunarResponse<T>
{
    error: T extends null ? string | null : null;
    success: boolean;
    result: T;
}