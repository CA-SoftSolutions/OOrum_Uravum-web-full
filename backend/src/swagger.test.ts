import { describe, expect, it } from 'vitest';
import { swaggerSpec } from './swagger';

const expectedRoutes = [
  'POST /auth/login',
  'POST /auth/refresh',
  'POST /auth/reset-password',
  'POST /auth/logout',
  'GET /articles',
  'POST /articles',
  'GET /articles/{idOrSlug}',
  'PUT /articles/{idOrSlug}',
  'DELETE /articles/{idOrSlug}',
  'GET /categories',
  'GET /categories/with-latest',
  'GET /categories/meta/icons',
  'POST /categories',
  'POST /categories/icon',
  'PUT /categories/{id}',
  'DELETE /categories/{id}',
  'GET /tags',
  'POST /tags',
  'PUT /tags/{id}',
  'DELETE /tags/{id}',
  'GET /users',
  'POST /users',
  'PUT /users/{id}',
  'DELETE /users/{id}',
  'GET /media',
  'POST /media/upload',
  'GET /media/{id}/image',
  'DELETE /media/{id}',
  'POST /comments',
  'GET /comments/admin/all',
  'GET /comments/{articleId}',
  'PUT /comments/{id}/approve',
  'PUT /comments/{id}/reject',
  'GET /settings/public',
  'GET /settings',
  'PUT /settings',
  'GET /obituaries',
  'POST /obituaries',
  'POST /obituaries/submit',
  'GET /obituaries/slug/{slug}',
  'GET /obituaries/{id}/image',
  'PUT /obituaries/{id}',
  'DELETE /obituaries/{id}',
  'GET /ads',
  'GET /ads/meta/icons',
  'GET /ads/{id}',
  'POST /ads',
  'PUT /ads/{id}',
  'DELETE /ads/{id}',
  'POST /visitors/ping',
  'GET /visitors/stats',
  'GET /search',
  'GET /authors',
  'GET /authors/{slug}',
  'POST /ingest',
  'GET /videos/categories',
  'POST /videos/categories',
  'DELETE /videos/categories/{id}',
  'GET /videos',
  'GET /videos/{idOrSlug}',
  'POST /videos',
  'PUT /videos/{idOrSlug}',
  'DELETE /videos/{idOrSlug}',
  'GET /public-auth/config',
  'POST /public-auth/register/request-code',
  'POST /public-auth/register/verify-code',
  'POST /public-auth/google',
  'POST /public-auth/login',
  'GET /public-auth/me',
  'GET /public-auth/admin/list',
  'PUT /public-auth/admin/{id}/toggle',
  'PUT /public-auth/admin/{id}/unlock',
  'DELETE /public-auth/admin/{id}',
  'GET /notifications',
  'GET /notifications/unread-count',
  'PUT /notifications/{id}/read',
  'PUT /notifications/read-all',
  'GET /dashboard/stats',
  'GET /feed/rss',
  'GET /feed/json',
  'GET /sitemap',
  'GET /health',
  'GET /docs.json',
];

describe('OpenAPI route coverage', () => {
  it('documents every registered API method and path', () => {
    const documentedRoutes = Object.entries(swaggerSpec.paths).flatMap(([path, pathItem]) =>
      Object.keys(pathItem).map((method) => `${method.toUpperCase()} ${path}`),
    );

    expect(documentedRoutes.sort()).toEqual(expectedRoutes.sort());
  });

  it('does not define duplicate paths that differ only by parameter names', () => {
    const normalizedPaths = Object.keys(swaggerSpec.paths).map((path) =>
      path.replace(/\{[^}]+\}/g, '{}'),
    );

    expect(new Set(normalizedPaths).size).toBe(normalizedPaths.length);
  });
});
