import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    login(dto: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
}
