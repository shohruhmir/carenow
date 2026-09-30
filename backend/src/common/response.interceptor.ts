import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

// Wraps every response in the shape frontend/types/api.types.ts already
// expects: { data, status, message, success }. Keeps the frontend's
// existing Service.ts get/post/delete helpers working unmodified.
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const response = http.getResponse();

    return next.handle().pipe(
      map((data) => ({
        data: data ?? null,
        status: response.statusCode,
        message: 'OK',
        success: true,
      })),
    );
  }
}
