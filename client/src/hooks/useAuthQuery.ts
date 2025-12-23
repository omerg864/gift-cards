import { ROUTES } from '@shared/constants/routes';
import { CreateUserDto, LoginUserDto } from '@shared/types/user.types';
import { useMutation } from '@tanstack/react-query';
import { EMAIL, USER } from '../lib/constants';
import { generatePath } from '../lib/utils';
import { axiosErrorHandler, client } from '../services/client';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginUserDto) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.LOGIN] }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      localStorage.setItem(USER, JSON.stringify(data.user));
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.REGISTER] }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      localStorage.setItem(USER, JSON.stringify(data.user));
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.LOGOUT] })
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      localStorage.removeItem(USER);
      localStorage.removeItem(EMAIL);
      localStorage.setItem('isAuthenticated', 'false');
      window.location.href = '/login';
    },
  });
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: async (data: { code: string; device: any }) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.GOOGLE] }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      localStorage.setItem(USER, JSON.stringify(data.user));
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      try {
        const response = await client.get(
          generatePath({
            route: [ROUTES.AUTH.BASE, ROUTES.AUTH.VERIFY_EMAIL],
            params: { id: token },
          })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.RESEND_EMAIL] }),
          { email }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.FORGOT_PASSWORD] }),
          { email }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, password, email }: { token: string; password: string; email: string }) => {
      try {
        const response = await client.post(
          generatePath({
            route: [ROUTES.AUTH.BASE, ROUTES.AUTH.RESET_PASSWORD],
            params: { email },
          }),
          { token, password }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};
