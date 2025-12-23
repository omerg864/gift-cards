import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ROUTES } from '@shared/constants/routes';
import type { Device } from '@shared/types/device.types';
import { User as UserType } from '@shared/types/user.types';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { COOKIE_NAMES } from '../../lib/constants';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller(ROUTES.AUTH.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(ROUTES.AUTH.LOGIN)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Return tokens' })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { device, ...credentials } = loginUserDto;
    const data = await this.authService.login(credentials, device);
    this.setCookies(res, data.accessToken, data.refreshToken, device.id);
    return data.user;
  }

  @Post(ROUTES.AUTH.REGISTER)
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post(ROUTES.AUTH.GOOGLE)
  @ApiOperation({ summary: 'Google Login' })
  @ApiBody({
    schema: {
      properties: { code: { type: 'string' }, device: { type: 'object' } },
    },
  })
  async googleLogin(
    @Body() body: { code: string; device: Device },
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { code, device } = body;
    const data = await this.authService.googleLogin(code, device);
    this.setCookies(res, data.accessToken, data.refreshToken, device.id);
    return data.user;
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] as
      | string
      | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const data = await this.authService.refresh(refreshToken);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return { success: true };
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] as
      | string
      | undefined;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    this.clearCookies(res);
    return { success: true };
  }

  private setCookies(
    res: ExpressResponse,
    accessToken: string,
    refreshToken: string,
    deviceId?: string,
  ) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    if (deviceId) {
      res.cookie(COOKIE_NAMES.DEVICE_ID, deviceId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });
    }
  }

  private clearCookies(res: ExpressResponse) {
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
    res.clearCookie(COOKIE_NAMES.DEVICE_ID);
  }

  @Get('/verify/:id')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Param('id') id: string) {
    return this.authService.verifyEmail(id);
  }

  @Post('/resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('/forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('/reset-password/:email')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({
    schema: {
      properties: { token: { type: 'string' }, password: { type: 'string' } },
    },
  })
  async resetPassword(
    @Param('email') email: string,
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(email, token, password);
  }

  @Post('/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ schema: { properties: { password: { type: 'string' } } } })
  async changePassword(
    @User() user: UserType,
    @Body('password') password: string,
  ) {
    return this.authService.changePassword(user.id, password);
  }

  @Get('/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get connected devices' })
  async getDevices(@User() user: UserType) {
    return this.authService.getConnectedDevices(user.id);
  }

  @Delete('/devices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect device' })
  async disconnectDevice(
    @User() user: UserType,
    @Param('id') deviceId: string,
  ) {
    return this.authService.disconnectDevice(user.id, deviceId);
  }

  @Delete('/devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect all devices' })
  async disconnectAllDevices(@User() user: UserType) {
    return this.authService.disconnectAllDevices(user.id);
  }
}
