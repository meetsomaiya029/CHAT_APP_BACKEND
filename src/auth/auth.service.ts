import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { email: string; password: String; name: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password as string, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    return this.generateToken(user.id, user.email, user.name);
  }

  async login(dto: { email: string; password: String }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password as string, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.email, user.name);
  }

  private generateToken(userId: string, email: string, name: string) {
    const payload = { sub: userId, email, name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email, name },
    };
  }
}