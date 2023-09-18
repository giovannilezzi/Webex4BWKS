import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

/** Pass untouched request through to the next request handler. */

@Injectable()
export class Interceptor implements HttpInterceptor {
  token =
    "ZWU2MzE0MDUtMzNhMi00MWYxLWEwMzUtNjFmZDI1MmY2ZjhmZmE4MTJhN2MtZTg2_PE93_e198e006-171b-40f6-9199-afb6f54fe5a5";

  constructor(public router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.token}`
        }
      });
    } catch (e) {
      console.log(e);
    }

    if (!req.headers.has("Content-Type")) {
      req = req.clone({
        headers: req.headers.set("Content-Type", "application/json")
      });
    }

    req = req.clone({ headers: req.headers.set("Accept", "application/json") });

    return next.handle(req).pipe(
      map((evt: HttpResponse<any>) => {
        if (evt && evt.headers)
          // console.log("Heades: ", evt.headers.get('link'));

          return evt;
      })
    );
  }
}
