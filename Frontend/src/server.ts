import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { ErrorRequestHandler } from 'express';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.post('/api/contact', express.json({ limit: '10kb' }), async (req, res, next) => {
  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'Please provide valid contact details.' });
    return;
  }

  const { name, email, phone, message } = body as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof message !== 'string'
  ) {
    res.status(400).json({ message: 'Please complete all contact fields.' });
    return;
  }

  const submission = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim(),
  };

  if (
    submission.name.length < 1 ||
    submission.name.length > 100 ||
    submission.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email) ||
    !/^\d{10}$/.test(submission.phone) ||
    submission.message.length < 1 ||
    submission.message.length > 2000
  ) {
    res.status(400).json({ message: 'Please check your contact details and try again.' });
    return;
  }

  const record = {
    ...submission,
    submittedAt: new Date().toISOString(),
  };
  const smtpHost = process.env['SMTP_HOST'] ?? 'smtpout.secureserver.net';
  const smtpPort = Number(process.env['SMTP_PORT'] ?? 465);
  const smtpUser = process.env['EMAIL_USER'] ?? process.env['SMTP_USER'];
  const smtpPass = process.env['EMAIL_PASSWORD'] ?? process.env['SMTP_PASS'];
  const smtpFrom = process.env['SMTP_FROM'] ?? smtpUser;
  const contactTo = process.env['CONTACT_TO'] ?? 'umaprasad@dream2decor.in';
  const smtpSecureSetting = process.env['SMTP_SECURE'];
  const smtpSecure = smtpSecureSetting === undefined
    ? smtpPort === 465
    : smtpSecureSetting.toLowerCase() === 'true';

  if (
    !smtpHost.trim() ||
    !smtpFrom ||
    !contactTo ||
    !Number.isInteger(smtpPort) ||
    smtpPort < 1 ||
    smtpPort > 65535 ||
    Boolean(smtpUser) !== Boolean(smtpPass) ||
    (smtpSecureSetting !== undefined && !['true', 'false'].includes(smtpSecureSetting.toLowerCase()))
  ) {
    console.error('Contact email is unavailable because SMTP configuration is incomplete or invalid.');
    res.status(503).json({ message: 'Contact email is not configured. Please try again later.' });
    return;
  }

  const submissionsFile = resolve(
    process.env['CONTACT_SUBMISSIONS_FILE'] ?? resolve(process.cwd(), 'data', 'contact-submissions.jsonl'),
  );

  try {
    await mkdir(dirname(submissionsFile), { recursive: true });
    await appendFile(submissionsFile, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (error) {
    next(error);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    ...(smtpUser && smtpPass ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
  });

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: contactTo,
      replyTo: submission.email,
      subject: 'New contact form submission',
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `Phone: ${submission.phone}`,
        `Submitted at: ${record.submittedAt}`,
        '',
        'Message:',
        submission.message,
      ].join('\n'),
    });
    res.status(201).json({ message: 'Your message has been sent.' });
  } catch (error) {
    console.error(
      'Contact email delivery failed:',
      error instanceof Error ? error.name : 'Unknown email error',
    );
    res.status(502).json({
      message: 'Your message was saved, but we could not email it. Please try again later.',
    });
  }
});

const apiErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? error.status
    : undefined;

  if (status === 400) {
    console.warn('Contact API rejected malformed JSON.');
    res.status(400).json({ message: 'Please submit valid JSON contact details.' });
    return;
  }
  if (status === 413) {
    console.warn('Contact API rejected a request that exceeded the body size limit.');
    res.status(413).json({ message: 'Your submission is too large. Please shorten your message.' });
    return;
  }

  console.error(
    'Contact API request failed:',
    error instanceof Error ? error.message : 'Unknown server error',
  );
  res.status(500).json({ message: 'We could not save your message. Please try again later.' });
};
app.use('/api', apiErrorHandler);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
