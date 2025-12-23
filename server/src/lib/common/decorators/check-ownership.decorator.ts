import { SetMetadata, Type } from '@nestjs/common';

export interface OwnershipConfig {
  service: Type<any>;
  resourceName: string;
  allowSharedRead?: boolean;
}

export const OWNERSHIP_CONFIG_KEY = 'ownership:config';

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_CONFIG_KEY, config);
