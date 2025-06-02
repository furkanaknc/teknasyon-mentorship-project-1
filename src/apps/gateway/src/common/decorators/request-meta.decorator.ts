import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestMeta = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return {
    body: request.body,
    reqMeta: request.reqMeta,
    clientMeta: request.clientMeta,
    headers: request.headers,
    query: request.query,
    params: request.params,
  };
});
