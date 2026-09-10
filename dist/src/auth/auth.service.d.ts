import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: {
        email: string;
        password: String;
        name: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    login(dto: {
        email: string;
        password: String;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    private generateToken;
}
