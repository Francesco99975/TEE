export class HttpException extends Error {
    code: number;
    message: string;
    error: string | null;

    constructor(code: number, message: string, error?: string) {
        super(message);
        this.code = code;
        this.message = message;
        this.error = error || null;
    }
}