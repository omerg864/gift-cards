import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@shared/constants/routes';
import { User as UserType } from '@shared/types/user.types';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ResetEncryptionKeyDto,
  UpdateEncryptionKeyDto,
} from './dto/encryption.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller(ROUTES.USER.BASE)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(ROUTES.USER.PROFILE)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@User() user: UserType) {
    return this.userService.findById(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create({
      ...createUserDto,
      isVerified: false,
      admin: false,
    });
  }

  @Get(ROUTES.USER.GET_ALL)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(ROUTES.USER.GET_ONE)
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(ROUTES.USER.UPDATE)
  @ApiOperation({ summary: 'Update user' })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, file);
  }

  @Delete(ROUTES.USER.DELETE)
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(ROUTES.USER.CREATE_ENCRYPTION_KEY)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set encryption key' })
  setEncryptionKey(
    @User() user: UserType,
    @Body() body: { salt: string; verifyToken: string },
  ) {
    return this.userService.setEncryptionKey(
      user.id,
      body.salt,
      body.verifyToken,
    );
  }

  @Patch(ROUTES.USER.CHANGE_ENCRYPTION_KEY)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update encryption key' })
  updateEncryptionKey(
    @User() user: UserType,
    @Body() body: UpdateEncryptionKeyDto,
  ) {
    return this.userService.updateEncryptionKey(
      user.id,
      body.salt,
      body.verifyToken,
      body.cards,
    );
  }

  @Patch(ROUTES.USER.RESET_ENCRYPTION_KEY)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset encryption key' })
  resetEncryptionKey(
    @User() user: UserType,
    @Body() body: ResetEncryptionKeyDto,
  ) {
    return this.userService.resetEncryptionKey(
      user.id,
      body.salt,
      body.verifyToken,
    );
  }
}
