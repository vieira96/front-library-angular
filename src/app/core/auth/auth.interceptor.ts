import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from './auth-context';
import { AccessTokenStoreService } from './access-token-store.service';
import { SessionRefreshService } from './session-refresh.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const accessTokenStore = inject(AccessTokenStoreService);
  const sessionRefresh = inject(SessionRefreshService);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isNotificationRequest = request.url.startsWith(
    environment.notificationsApiBaseUrl
  );
  const shouldSkipAuth = request.context.get(SKIP_AUTH);

  if (isNotificationRequest) {
    const notificationToken = accessTokenStore.token();
    return next(
      notificationToken
        ? request.clone({
            setHeaders: {
              Authorization: `Bearer ${notificationToken}`,
            },
          })
        : request
    );
  }

  if (!isApiRequest) {
    return next(request);
  }

  const requestWithCredentials = request.clone({ withCredentials: true });

  if (shouldSkipAuth) {
    return next(requestWithCredentials);
  }

  const accessToken = accessTokenStore.token();
  const authenticatedRequest = accessToken
    ? requestWithCredentials.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : requestWithCredentials;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return sessionRefresh.refresh().pipe(
        switchMap(() => {
          const refreshedAccessToken = accessTokenStore.token();

          if (!refreshedAccessToken) {
            return throwError(() => error);
          }

          return next(
            requestWithCredentials.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedAccessToken}`,
              },
            }),
          );
        }),
      );
    }),
  );
};
