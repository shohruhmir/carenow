import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// Errors also come back in the { data, status, message, success } shape —
// Service.ts's catch block reads `err.response?.data?.message`.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const messageText = typeof message === 'string' ? message : (message as { message?: string | string[] }).message;

    response.status(status).json({
      data: null,
      status,
      message: Array.isArray(messageText) ? messageText.join(', ') : messageText,
      success: false,
    });
  }
}
