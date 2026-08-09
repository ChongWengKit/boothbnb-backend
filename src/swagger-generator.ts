import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { signupSchema, verifySchema, signinSchema, googleSignUpSchema, googleSignInSchema, forgotPasswordSchema, resetPasswordSchema, adminSignupSchema, updateProfilePhotoSchema } from './lib/schemas/auth.schema.js';
import { registerAdminSchema, updateAdminApprovalSchema, getApprovalRequestsQuerySchema } from './lib/schemas/admin.schema.js';
import { paginationQuerySchema, idParamSchema, slugParamSchema } from './lib/schemas/common.schema.js';
import { addFavoriteSchema, deleteFavoriteSchema } from './lib/schemas/bookmark.schema.js';
import { cloudinarySignatureSchema } from './lib/schemas/cloudinary.schema.js';
import { getCurrencyQuerySchema, getAllCurrencyDetailsQuerySchema, updateCurrencyStatusSchema } from './lib/schemas/currency.schema.js';
import { checkoutSchema } from './lib/schemas/booking.schema.js';
import { createEventSchema, updateEventSchema } from './lib/event.schema.js';
import { resendEmailSchema, resendWebhookSchema } from './lib/schemas/mail.schema.js';

const registry = new OpenAPIRegistry();

const authBasePath = '/auth';
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/signup`,
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: { '200': { description: 'User signed up' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/verify`,
  request: { body: { content: { 'application/json': { schema: verifySchema } } } },
  responses: { '200': { description: 'Token verified' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/signin`,
  request: { body: { content: { 'application/json': { schema: signinSchema } } } },
  responses: { '200': { description: 'User signed in' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/google-signup`,
  request: { body: { content: { 'application/json': { schema: googleSignUpSchema } } } },
  responses: { '200': { description: 'Google signup' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/google-signin`,
  request: { body: { content: { 'application/json': { schema: googleSignInSchema } } } },
  responses: { '200': { description: 'Google signin' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/forgot-password`,
  request: { body: { content: { 'application/json': { schema: forgotPasswordSchema } } } },
  responses: { '200': { description: 'Password reset email sent' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/reset-password`,
  request: { body: { content: { 'application/json': { schema: resetPasswordSchema } } } },
  responses: { '200': { description: 'Password reset' } },
});
registry.registerPath({
  method: 'post',
  path: `${authBasePath}/admin-signup`,
  request: { body: { content: { 'application/json': { schema: adminSignupSchema } } } },
  responses: { '200': { description: 'Admin signed up' } },
});
registry.registerPath({
  method: 'put',
  path: `${authBasePath}/photo`,
  request: { body: { content: { 'application/json': { schema: updateProfilePhotoSchema } } } },
  responses: { '200': { description: 'Profile photo updated' } },
});

const adminBasePath = '/admin';
registry.registerPath({
  method: 'post',
  path: `${adminBasePath}/register`,
  request: { body: { content: { 'application/json': { schema: registerAdminSchema } } } },
  responses: { '200': { description: 'Admin registered' } },
});
registry.registerPath({
  method: 'post',
  path: `${adminBasePath}/email`,
  request: { body: { content: { 'application/json': { schema: resendEmailSchema } } } },
  responses: { '200': { description: 'Email resent' } },
});
registry.registerPath({
  method: 'get',
  path: `${adminBasePath}/email`,
  request: { query: paginationQuerySchema },
  responses: { '200': { description: 'Email logs' } },
});
registry.registerPath({
  method: 'put',
  path: `${adminBasePath}/approval`,
  request: { body: { content: { 'application/json': { schema: updateAdminApprovalSchema } } } },
  responses: { '200': { description: 'Approval updated' } },
});
registry.registerPath({
  method: 'get',
  path: `${adminBasePath}/`,
  request: { query: getApprovalRequestsQuerySchema },
  responses: { '200': { description: 'Approval requests' } },
});
registry.registerPath({
  method: 'get',
  path: `${adminBasePath}/currency`,
  request: { query: getAllCurrencyDetailsQuerySchema },
  responses: { '200': { description: 'Currency details' } },
});
registry.registerPath({
  method: 'put',
  path: `${adminBasePath}/currency`,
  request: { body: { content: { 'application/json': { schema: updateCurrencyStatusSchema } } } },
  responses: { '200': { description: 'Currency status updated' } },
});

const bookingBasePath = '/booking';
registry.registerPath({
  method: 'get',
  path: `${bookingBasePath}/`,
  request: { query: paginationQuerySchema },
  responses: { '200': { description: 'User paid bookings' } },
});
registry.registerPath({
  method: 'get',
  path: `${bookingBasePath}/{id}`,
  request: { params: idParamSchema },
  responses: { '200': { description: 'Booking by ID' } },
});

const bookmarkBasePath = '/bookmark';
registry.registerPath({
  method: 'get',
  path: `${bookmarkBasePath}/favorite`,
  request: { query: paginationQuerySchema },
  responses: { '200': { description: 'Favorite events' } },
});
registry.registerPath({
  method: 'post',
  path: `${bookmarkBasePath}/add-favorite`,
  request: { body: { content: { 'application/json': { schema: addFavoriteSchema } } } },
  responses: { '200': { description: 'Favorite added' } },
});
registry.registerPath({
  method: 'post',
  path: `${bookmarkBasePath}/delete-favorite`,
  request: { body: { content: { 'application/json': { schema: deleteFavoriteSchema } } } },
  responses: { '200': { description: 'Favorite deleted' } },
});

const currencyBasePath = '/currency';
registry.registerPath({
  method: 'get',
  path: `${currencyBasePath}/`,
  request: { query: getCurrencyQuerySchema },
  responses: { '200': { description: 'Currency query' } },
});
registry.registerPath({
  method: 'get',
  path: `${currencyBasePath}/all`,
  responses: { '200': { description: 'All currency details' } },
});

const eventBasePath = '/event';
registry.registerPath({
  method: 'get',
  path: `${eventBasePath}/{slug}`,
  request: { params: slugParamSchema },
  responses: { '200': { description: 'Get event by slug' } },
});
registry.registerPath({
  method: 'get',
  path: `${eventBasePath}/{slug}/detail`,
  request: { params: slugParamSchema },
  responses: { '200': { description: 'Event details' } },
});
registry.registerPath({
  method: 'get',
  path: `${eventBasePath}/{slug}/edit`,
  request: { params: slugParamSchema },
  responses: { '200': { description: 'Event edit data' } },
});
registry.registerPath({
  method: 'post',
  path: `${eventBasePath}/`,
  request: { body: { content: { 'application/json': { schema: createEventSchema } } } },
  responses: { '200': { description: 'Event created' } },
});
registry.registerPath({
  method: 'put',
  path: `${eventBasePath}/{slug}`,
  request: { params: slugParamSchema, body: { content: { 'application/json': { schema: updateEventSchema } } } },
  responses: { '200': { description: 'Event updated' } },
});
registry.registerPath({
  method: 'put',
  path: `${eventBasePath}/{slug}/publish`,
  request: { params: slugParamSchema },
  responses: { '200': { description: 'Event published' } },
});
registry.registerPath({
  method: 'put',
  path: `${eventBasePath}/{slug}/close`,
  request: { params: slugParamSchema },
  responses: { '200': { description: 'Event closed' } },
});
registry.registerPath({
  method: 'post',
  path: `${eventBasePath}/{slug}/checkout`,
  request: { params: slugParamSchema, body: { content: { 'application/json': { schema: checkoutSchema } } } },
  responses: { '200': { description: 'Checkout' } },
});

registry.registerPath({
  method: 'post',
  path: '/upload/signature',
  request: { body: { content: { 'application/json': { schema: cloudinarySignatureSchema } } } },
  responses: { '200': { description: 'Cloudinary signature' } },
});

registry.registerPath({
  method: 'post',
  path: '/webhook/resend',
  request: { body: { content: { 'application/json': { schema: resendWebhookSchema } } } },
  responses: { '200': { description: 'Resend webhook call' } },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const createSwaggerDocument = () =>
  generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Boothbnb API', version: '1.0.0', description: 'Boothbnb API documentation' },
    servers: [{ url: 'https://localhost:3001' }],
  });
