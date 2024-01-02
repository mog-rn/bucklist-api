declare module Express {
    export interface Request {
        user?: {
            userId: string;
            email: string;
            role: string;
        };
    }
}