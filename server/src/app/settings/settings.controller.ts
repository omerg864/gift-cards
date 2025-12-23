import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@shared/constants/routes';
import { User as UserType } from '@shared/types/user.types';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller(ROUTES.SETTINGS.BASE)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(ROUTES.SETTINGS.GET_ALL)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user settings' })
  getSettings(@User() user: UserType) {
    return this.settingsService.findByUser(user.id);
  }

  @Put(ROUTES.SETTINGS.UPDATE)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiBody({ type: UpdateSettingsDto })
  updateSettings(
    @User() user: UserType,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateByUser(user.id, updateSettingsDto);
  }
}
