import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EmailConstraintError } from '../user/user.service';

import { AuthService } from './auth.service';
import { GetUser, GetUserId } from './decorators';
import { SignInUserDto, SignUpUserDto } from './dto';
import { TokenDto } from './dto/token.dto';
import { InvalidCredentials, InvalidToken } from './exceptions';
import { AccessGuard, RefreshGuard } from './guards';
import { JwtPayloadWithRefreshToken } from './types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Создает аккаунт пользователя' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('signup')
  async signUp(@Body() user: SignUpUserDto) {
    try {
      return await this.authService.signUp(user);
    } catch (error) {
      if (error instanceof EmailConstraintError) {
        throw new BadRequestException(error.message);
      }

      const resolvedError = error instanceof Error ? error : new Error('Unknown error');
      throw new InternalServerErrorException(resolvedError.message, { cause: resolvedError });
    }
  }

  @ApiOperation({ summary: 'Выполняет авторизацию пользователя' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post('signin')
  async signIn(@Body() user: SignInUserDto) {
    try {
      return await this.authService.signIn(user);
    } catch (error) {
      if (error instanceof InvalidCredentials) {
        throw new UnauthorizedException(error.message);
      }

      throw new BadRequestException(error);
    }
  }

  @ApiOperation({ summary: 'Выполняет выход пользователя из аккаунта' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  @Post('logout')
  async logout(@GetUserId() userId: string) {
    try {
      await this.authService.logout(userId);
    } catch {
      throw new UnauthorizedException('Credentials incorrect');
    }
  }

  @ApiOperation({ summary: 'Обновляет токены пользователя' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refreshTokens(@GetUser() user: JwtPayloadWithRefreshToken) {
    try {
      return await this.authService.refreshTokens(user);
    } catch (error) {
      if (error instanceof InvalidToken) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }
}
