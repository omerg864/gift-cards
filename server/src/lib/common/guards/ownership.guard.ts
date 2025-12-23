import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  OWNERSHIP_CONFIG_KEY,
  type OwnershipConfig,
} from '../decorators/check-ownership.decorator';

interface ResourceWithUser {
  user?: any;
  [key: string]: any;
}

interface ResourceService {
  findOne(id: string): Promise<ResourceWithUser | null>;
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private moduleRef: ModuleRef,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<OwnershipConfig>(
      OWNERSHIP_CONFIG_KEY,
      context.getHandler(),
    );

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const resourceId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!resourceId) {
      return true;
    }

    // Get the service instance
    const service: ResourceService = this.moduleRef.get(config.service, {
      strict: false,
    });
    const resource = await service.findOne(resourceId);

    if (!resource) {
      throw new NotFoundException(`${config.resourceName} not found`);
    }

    // Determine operation type
    const method = request.method;
    const isReadOperation = method === 'GET';
    const isWriteOperation = ['PUT', 'PATCH', 'DELETE'].includes(method);

    // Check ownership
    console.log('OwnershipGuard Debug:', {
      userId,
      resourceId,
      resourceUser: resource.user,
      resourceUserType: typeof resource.user,
      resourceUserString: resource.user?.toString(),
      config,
      isReadOperation,
    });

    if (config.allowSharedRead && isReadOperation) {
      // Allow read if no user or belongs to current user
      if (resource.user && resource.user.toString() !== userId) {
        throw new ForbiddenException(
          `You do not have permission to access this ${config.resourceName}`,
        );
      }
    } else if (isWriteOperation && config.allowSharedRead) {
      // For shared resources: disallow write if no user or wrong user
      if (!resource.user || resource.user.toString() !== userId) {
        throw new ForbiddenException(
          `You do not have permission to modify this ${config.resourceName}`,
        );
      }
    } else {
      // Default: must own the resource
      if (!resource.user || resource.user.toString() !== userId) {
        throw new ForbiddenException(
          `You do not have permission to access this ${config.resourceName}`,
        );
      }
    }

    return true;
  }
}
