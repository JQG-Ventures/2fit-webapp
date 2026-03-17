export interface ApiResponse<TMessage> {
    status: string;
    message: TMessage;
    errors?: Record<string, string | string[] | undefined>;
}

export type ApiStatusResponse = ApiResponse<string>;

export type QueryParams = Record<string, string | number | boolean>;
