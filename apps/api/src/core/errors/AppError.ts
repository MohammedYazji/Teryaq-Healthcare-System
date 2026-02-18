// ONLY FOR OPERATIONAL ERRORS (EXPECTED ERRORS FROM USERS OR EXTERNAL SYSTEMS)
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly status: 'fail' | 'error';
    public readonly isOperational: boolean = true;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; 
        Error.captureStackTrace(this, this.constructor);
    }
}