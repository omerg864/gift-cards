import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import type { Device } from '../../../../shared/types/device.types';
import type {
  CreateUserDto,
  LoginUserDto,
} from '../../../../shared/types/user.types';
import { EMAIL_SUBJECTS } from '../email/constants';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private settingsService: SettingsService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      'postmessage',
    );
  }

  private async createUserLogin(user: UserDocument, device: Device) {
    const accessToken = this.jwtService.sign(
      { id: user._id.toString() },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    const unique = uuid();
    const refreshToken = this.jwtService.sign(
      { id: user._id.toString(), device: device.id, unique },
      {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
        expiresIn: '30d',
      },
    );

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    if (!user.tokens) {
      user.tokens = [];
    }

    const existingToken = user.tokens.find((t) => t.device_id === device.id);

    if (existingToken) {
      const index = user.tokens.findIndex((t) => t.device_id === device.id);
      if (index !== -1 && user.tokens[index]) {
        user.tokens[index] = {
          device_id: existingToken.device_id,
          type: existingToken.type,
          name: existingToken.name,
          createdAt: existingToken.createdAt,
          token: hashedToken,
          unique,
        };
      }
    } else {
      user.tokens.push({
        token: hashedToken,
        device_id: device.id,
        createdAt: new Date(),
        name: device.name,
        type: device.type,
        unique,
      });

      // Send email notification for new device if settings.emailOnNewDevice is true
      const settings = await this.settingsService.findOne(user._id.toString());
      if (settings?.emailOnNewDevice) {
        await this.emailService.sendEmail(EMAIL_SUBJECTS.NEW_DEVICE, {
          to: user.email,
          template: EMAIL_SUBJECTS.NEW_DEVICE,
          context: {
            name: user.name,
            deviceName: device.name,
            deviceType: device.type,
            time: new Date().toLocaleString(),
          },
        });
      }
    }

    await user.save();

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified,
        admin: user.admin,
        salt: user.salt,
        verifyToken: user.verifyToken,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: Omit<LoginUserDto, 'device'>, device: Device) {
    const { email, password } = loginDto;

    if (!device || !device.id || !device.name || !device.type) {
      throw new BadRequestException('Invalid device information');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Please verify your email');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createUserLogin(user, device);
  }

  async register(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      tokens: [],
    } as unknown as UserDocument);

    const verifyUrl = `${this.configService.get('CLIENT_URL')}/verify-email/${user._id.toString()}`;
    await this.emailService.sendEmail(EMAIL_SUBJECTS.VERIFY_EMAIL, {
      to: email,
      template: EMAIL_SUBJECTS.VERIFY_EMAIL,
      context: {
        name: user.name,
        verifyUrl,
      },
    });

    return {
      success: true,
      message:
        'User created successfully. Please check your email to verify your account.',
    };
  }

  async googleLogin(code: string, device: Device) {
    if (!code) {
      throw new BadRequestException('No code provided');
    }

    if (!device || !device.id || !device.name || !device.type) {
      throw new BadRequestException('Invalid device');
    }

    const response = await this.googleClient.getToken(code);
    const ticket = await this.googleClient.verifyIdToken({
      idToken: response.tokens.id_token!,
      audience: this.configService.get('GOOGLE_CLIENT_ID')!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new BadRequestException('Invalid code');
    }

    let user = await this.userService.findByEmail(payload.email);

    if (!user) {
      // Create new user
      const password = uuid();
      user = await this.userService.create({
        name: `${payload.given_name} ${payload.family_name}`,
        email: payload.email,
        password,
        image: payload.picture,
        isVerified: true,
        tokens: [],
      } as unknown as UserDocument);
      await user.save();
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    return this.createUserLogin(user, device);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    let decoded: {
      id: string;
      device: string;
      unique: string;
    };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findById(decoded.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tokens) {
      user.tokens = [];
    }
    const index = user.tokens.findIndex((t) => t.device_id === decoded.device);
    if (index === -1) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const auth = user.tokens[index];

    const isValidToken = await bcrypt.compare(refreshToken, auth.token);
    if (!isValidToken || auth.unique !== decoded.unique) {
      // Clear all tokens on security breach
      user.tokens = [];
      await user.save();
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwtService.sign(
      { id: decoded.id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    const unique = uuid();
    const newRefreshToken = this.jwtService.sign(
      { id: decoded.id, device: auth.device_id, unique },
      {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
        expiresIn: '30d',
      },
    );

    const newHashedToken = await bcrypt.hash(newRefreshToken, 10);
    user.tokens[index] = {
      ...user.tokens[index],
      token: newHashedToken,
      unique,
    };
    await user.save();

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    let decoded: {
      id: string;
      device: string;
      unique: string;
    };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      });
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findById(decoded.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tokens) {
      user.tokens = [];
    }
    const device = user.tokens.find((t) => t.device_id === decoded.device);
    if (!device) {
      throw new UnauthorizedException('Invalid token');
    }

    const isValidToken = await bcrypt.compare(refreshToken, device.token);
    if (!isValidToken || device.unique !== decoded.unique) {
      // Clear all tokens on security breach
      user.tokens = [];
      await user.save();
      throw new UnauthorizedException('Invalid refresh token');
    }

    user.tokens = user.tokens.filter((t) => t.device_id !== decoded.device);
    await user.save();

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async verifyEmail(id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = true;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verifyUrl = `${this.configService.get('CLIENT_URL')}/verify-email/${user._id.toString()}`;
    await this.emailService.sendEmail(EMAIL_SUBJECTS.VERIFY_EMAIL, {
      to: email,
      template: EMAIL_SUBJECTS.VERIFY_EMAIL,
      context: {
        name: user.name,
        verifyUrl,
      },
    });

    return {
      success: true,
      message: 'Verification email sent',
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuid();
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(token, salt);

    user.verificationToken = hashedToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${this.configService.get('CLIENT_URL')}/reset-password/${email}/${token}`;
    await this.emailService.sendEmail(EMAIL_SUBJECTS.RESET_PASSWORD, {
      to: email,
      template: EMAIL_SUBJECTS.RESET_PASSWORD,
      context: {
        name: user.name,
        resetUrl,
      },
    });

    return {
      success: true,
      message: 'Password reset email sent',
      token: this.configService.get('NODE_ENV') === 'test' ? token : undefined,
    };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (!user.verificationToken) {
      throw new BadRequestException('Invalid token');
    }

    if (
      user.resetPasswordTokenExpiry &&
      user.resetPasswordTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Token expired');
    }

    const isValidToken = await bcrypt.compare(token, user.verificationToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid token');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.verificationToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    user.tokens = []; // Log out from all devices
    await user.save();

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async changePassword(userId: string, newPassword: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async getConnectedDevices(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tokens) {
      user.tokens = [];
    }
    const devices = user.tokens.map((t) => ({
      device_id: t.device_id,
      type: t.type,
      name: t.name,
      createdAt: t.createdAt,
    }));

    return {
      success: true,
      devices,
    };
  }

  async disconnectDevice(userId: string, deviceId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tokens) {
      user.tokens = [];
    }
    const device = user.tokens.find((t) => t.device_id === deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    user.tokens = user.tokens.filter((t) => t.device_id !== deviceId);
    await user.save();

    return {
      success: true,
      message: 'Device disconnected successfully',
    };
  }

  async disconnectAllDevices(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.tokens = [];
    await user.save();

    return {
      success: true,
      message: 'All devices disconnected successfully',
    };
  }
}
