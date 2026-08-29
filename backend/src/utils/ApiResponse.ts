

// My interface for api response : since in response data can be of any time that's why use generics
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    data?: T;
}

// Error response is same everytime
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: unknown;
}

export const successResponse = <T>(
    message: string,
    data?: T
): ApiSuccessResponse<T> => {
    // response without data
    const response: ApiSuccessResponse<T> = {
        success: true,
        message,
    };

    // if data exists include it in response
    if (data !== undefined) {
        response.data = data;
    }

    return response;
};

export const errorResponse = (
    message: string,
    error?: unknown
): ApiErrorResponse => {
    // response without error
    const response: ApiErrorResponse = {
        success: false,
        message,
    };

    // if erorr exists include it in response
    if (error !== undefined) {
        response.error = error;
    }

    return response;
};