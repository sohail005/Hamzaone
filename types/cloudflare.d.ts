/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace Cloudflare {
  interface PagesFunctionContext<T = any> {
    request: Request;
    env: T;
    waitUntil: (promise: Promise<any>) => void;
    next?: () => Promise<Response | null>;
    params: { [key: string]: string };
  }

  type PagesFunction<T = any> = (
    context: PagesFunctionContext<T>,
  ) => Response | Promise<Response>;

  type PagesMiddlewareFunction<T = any> = (
    context: PagesFunctionContext<T>,
  ) => Response | Promise<Response | null>;
}

declare type PagesFunction = Cloudflare.PagesFunction;
declare type PagesMiddlewareFunction = Cloudflare.PagesMiddlewareFunction;

interface PagesFunctionExport {
  onRequest?: PagesMiddlewareFunction;
  onRequestGet?: PagesFunction;
  onRequestPost?: PagesFunction;
  onRequestPut?: PagesFunction;
  onRequestDelete?: PagesFunction;
  onRequestPatch?: PagesFunction;
  onRequestHead?: PagesFunction;
  onRequestOptions?: PagesFunction;
}
