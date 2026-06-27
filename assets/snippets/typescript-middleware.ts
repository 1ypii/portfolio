type NextFunction = () => Promise<void>;

interface RequestContext<TState = Record<string, unknown>> {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Map<string, string>;
  body: unknown;
  state: TState;
  startedAt: number;
}

interface ResponseContext {
  status: number;
  headers: Map<string, string>;
  body: unknown;
}

type Middleware<TState = Record<string, unknown>> = (
  req: RequestContext<TState>,
  res: ResponseContext,
  next: NextFunction
) => Promise<void>;

type RouteHandler<TState = Record<string, unknown>> = (
  req: RequestContext<TState>,
  res: ResponseContext
) => Promise<void>;

type MethodRoutes<TState> = Map<string, RouteHandler<TState>>;

class Pipeline<TState = Record<string, unknown>> {
  private middlewares: Middleware<TState>[] = [];
  private routes: Map<string, MethodRoutes<TState>> = new Map();

  use(middleware: Middleware<TState>): this {
    this.middlewares.push(middleware);
    return this;
  }

  route(method: RequestContext["method"], path: string, handler: RouteHandler<TState>): this {
    if (!this.routes.has(path)) {
      this.routes.set(path, new Map());
    }

    this.routes.get(path)!.set(method, handler);
    return this;
  }

  async handle(req: RequestContext<TState>, res: ResponseContext): Promise<ResponseContext> {
    let index = 0;

    const executeNext = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const current = this.middlewares[index];
        index++;
        await current(req, res, executeNext);
        return;
      }

      const methodRoutes = this.routes.get(req.path);
      if (!methodRoutes) {
        res.status = 404;
        res.body = { error: "Route not found" };
        return;
      }

      const handler = methodRoutes.get(req.method);
      if (!handler) {
        res.status = 405;
        res.body = { error: "Method not allowed" };
        return;
      }

      await handler(req, res);
    };

    try {
      await executeNext();
    } catch (err) {
      res.status = 500;
      res.body = { error: err instanceof Error ? err.message : "Internal server error" };
    }

    return res;
  }
}

function createRequest<TState>(
  method: RequestContext["method"],
  path: string,
  state: TState,
  body?: unknown
): RequestContext<TState> {
  return {
    path,
    method,
    headers: new Map(),
    body: body ?? null,
    state,
    startedAt: Date.now(),
  };
}

function createResponse(): ResponseContext {
  return {
    status: 200,
    headers: new Map(),
    body: null,
  };
}

interface AppState {
  requestId: string;
  authenticated: boolean;
  userId: string | null;
}

const generateId = (): string =>
  Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

const logger: Middleware<AppState> = async (req, _res, next) => {
  req.state.requestId = generateId();
  const label = `[${req.state.requestId}] ${req.method} ${req.path}`;
  console.log(`${label} started`);
  await next();
  const duration = Date.now() - req.startedAt;
  console.log(`${label} completed in ${duration}ms`);
};

const auth: Middleware<AppState> = async (req, res, next) => {
  const token = req.headers.get("authorization");

  if (!token || !token.startsWith("Bearer ")) {
    res.status = 401;
    res.body = { error: "Missing or invalid token" };
    return;
  }

  req.state.authenticated = true;
  req.state.userId = token.replace("Bearer ", "");
  await next();
};

const rateLimiter = (() => {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const limit = 100;
  const windowMs = 60_000;

  const middleware: Middleware<AppState> = async (req, res, next) => {
    const key = req.state.userId ?? "anonymous";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= limit) {
      res.status = 429;
      res.body = { error: "Rate limit exceeded", retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
      return;
    }

    entry.count++;
    await next();
  };

  return middleware;
})();

const app = new Pipeline<AppState>()
  .use(logger)
  .use(auth)
  .use(rateLimiter)
  .route("GET", "/api/profile", async (req, res) => {
    res.status = 200;
    res.body = { userId: req.state.userId, requestId: req.state.requestId };
  })
  .route("POST", "/api/echo", async (req, res) => {
    res.status = 200;
    res.body = { received: req.body, processedBy: req.state.userId };
  });

const defaultState: AppState = { requestId: "", authenticated: false, userId: null };

(async () => {
  const req = createRequest<AppState>("GET", "/api/profile", { ...defaultState });
  req.headers.set("authorization", "Bearer user_42");

  const res = await app.handle(req, createResponse());
  console.log("Response:", JSON.stringify(res.body, null, 2));
})();
