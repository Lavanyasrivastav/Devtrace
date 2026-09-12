// Defined as a static spec object rather than scattering @openapi JSDoc
// comments across every route file — faster to keep in sync as routes
// change, and just as valid an input to swagger-ui-express.
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DevTrace API',
    version: '1.0.0',
    description: 'Developer error intelligence and monitoring platform API.',
  },
  servers: [{ url: '/api', description: 'Current environment' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          400: { description: 'Validation failed' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Logged in' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange the httpOnly refresh cookie for a new access token',
        security: [],
        responses: { 200: { description: 'New access token issued' }, 401: { description: 'No/invalid refresh token' } },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Revoke refresh tokens and clear the session cookie', responses: { 200: { description: 'Logged out' } } },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Get the current authenticated user', responses: { 200: { description: 'Current user' }, 401: { description: 'Not authenticated' } } },
    },
    '/projects': {
      get: { tags: ['Projects'], summary: 'List projects the caller is a member of', responses: { 200: { description: 'Projects retrieved' } } },
      post: {
        tags: ['Projects'],
        summary: 'Create a project (returns a one-time-visible API key)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  environment: { type: 'string', enum: ['development', 'staging', 'production'] },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Project created' } },
      },
    },
    '/projects/{id}': {
      get: { tags: ['Projects'], summary: 'Get project details', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project retrieved' } } },
      patch: { tags: ['Projects'], summary: 'Update project fields (owner/admin only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project updated' } } },
      delete: { tags: ['Projects'], summary: 'Delete a project (owner only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project deleted' } } },
    },
    '/projects/{id}/regenerate-key': {
      post: { tags: ['Projects'], summary: 'Regenerate the ingestion API key (invalidates the old one)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Key regenerated' } } },
    },
    '/projects/{id}/members': {
      get: { tags: ['Team'], summary: 'List project members', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Members retrieved' } } },
      post: { tags: ['Team'], summary: 'Invite an existing user to the project', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Member added' } } },
    },
    '/ingest/error': {
      post: {
        tags: ['Ingestion'],
        summary: 'Report an error from your application (authenticated by project API key, not JWT)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectKey', 'message'],
                properties: {
                  projectKey: { type: 'string', example: 'dvt_live_...' },
                  message: { type: 'string' },
                  stackTrace: { type: 'string' },
                  severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
                  environment: { type: 'string' },
                  service: { type: 'string' },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { 202: { description: 'Error ingested and grouped' }, 401: { description: 'Invalid project key' } },
      },
    },
    '/errors': {
      get: {
        tags: ['Errors'],
        summary: 'List/filter/search/sort error groups across accessible projects',
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'severity', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['recent', 'frequent', 'critical', 'oldest'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Errors retrieved' } },
      },
    },
    '/errors/{id}': {
      get: { tags: ['Errors'], summary: 'Get error detail including parsed stack trace', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Error detail retrieved' } } },
      patch: { tags: ['Errors'], summary: 'Update status and/or severity', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Error updated' } } },
    },
    '/errors/{id}/occurrences': {
      get: { tags: ['Errors'], summary: 'List raw occurrences for an error group', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Occurrences retrieved' } } },
    },
    '/analytics/overview': {
      get: { tags: ['Analytics'], summary: 'Dashboard summary metrics', parameters: [{ name: 'projectId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Overview retrieved' } } },
    },
    '/analytics/frequency': {
      get: {
        tags: ['Analytics'],
        summary: 'Error frequency over time (for the timeline chart)',
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'range', in: 'query', schema: { type: 'string', enum: ['24h', '7d', '30d'] } },
        ],
        responses: { 200: { description: 'Frequency retrieved' } },
      },
    },
    '/monitors': {
      get: { tags: ['Monitors'], summary: 'List monitors', parameters: [{ name: 'projectId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Monitors retrieved' } } },
      post: { tags: ['Monitors'], summary: 'Create a monitor (owner/admin only)', responses: { 201: { description: 'Monitor created' } } },
    },
    '/monitors/{id}/results': {
      get: { tags: ['Monitors'], summary: 'Get recent check results and uptime percentage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Results retrieved' } } },
    },
  },
};
