import express from 'express';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import nodemailer from 'nodemailer';

const app = express();
const allowedContactOrigins = new Set([
  'https://dream2decor.in',
  'https://www.dream2decor.in',
]);

if (process.env.NODE_ENV !== 'production') {
  allowedContactOrigins.add('http://localhost:4200');
}

async function sendWithBrevo(apiKey, senderEmail, senderName, contactTo, submission, submittedAt) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: contactTo }],
      replyTo: { email: submission.email },
      subject: 'New contact form submission',
      textContent: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `Phone: ${submission.phone}`,
        `Submitted at: ${submittedAt}`,
        '',
        'Message:',
        submission.message,
      ].join('\n'),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const error = new Error(`Brevo email API returned HTTP ${response.status}`);
    error.code = `BREVO_HTTP_${response.status}`;
    throw error;
  }
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', (req, res, next) => {
  const origin = req.get('Origin');
  if (origin && !allowedContactOrigins.has(origin)) {
    res.status(403).json({ message: 'This origin is not allowed to submit contact requests.' });
    return;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.post('/api/contact', express.json({ limit: '10kb' }), async (req, res, next) => {
  const body = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'Please provide valid contact details.' });
    return;
  }

  const { name, email, phone, message } = body;
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
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoFromEmail = process.env.BREVO_FROM_EMAIL ?? process.env.EMAIL_USER;
  const brevoFromName = process.env.BREVO_FROM_NAME ?? 'Dream2Decor Website';
  const smtpHost = process.env.SMTP_HOST ?? 'smtpout.secureserver.net';
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpUser = process.env.EMAIL_USER ?? process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASSWORD ?? process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM ?? smtpUser;
  const contactTo = process.env.CONTACT_TO ?? 'umaprasad@dream2decor.in';
  const smtpSecureSetting = process.env.SMTP_SECURE;
  const smtpSecure = smtpSecureSetting === undefined
    ? smtpPort === 465
    : smtpSecureSetting.toLowerCase() === 'true';

  const validEmail = (value) =>
    typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const brevoSender = brevoApiKey && validEmail(brevoFromEmail)
    ? { apiKey: brevoApiKey, email: brevoFromEmail }
    : undefined;

  if (!contactTo) {
    console.error('Contact email is unavailable because its recipient is not configured.');
    res.status(503).json({ message: 'Contact email is not configured. Please try again later.' });
    return;
  }
  if (brevoApiKey && !brevoSender) {
    console.error('Contact email is unavailable because its verified sender is not configured.');
    res.status(503).json({ message: 'Contact email is not configured. Please try again later.' });
    return;
  }

  if (
    !brevoSender &&
    (
      !smtpHost.trim() ||
      !smtpUser ||
      !smtpPass ||
      !smtpFrom ||
      !Number.isInteger(smtpPort) ||
      smtpPort < 1 ||
      smtpPort > 65535 ||
      (smtpSecureSetting !== undefined && !['true', 'false'].includes(smtpSecureSetting.toLowerCase()))
    )
  ) {
    console.error('Contact email is unavailable because SMTP configuration is incomplete or invalid.');
    res.status(503).json({ message: 'Contact email is not configured. Please try again later.' });
    return;
  }

  const submissionsFile = resolve(
    process.env.CONTACT_SUBMISSIONS_FILE ?? resolve(process.cwd(), 'data', 'contact-submissions.jsonl'),
  );

  try {
    await mkdir(dirname(submissionsFile), { recursive: true });
    await appendFile(submissionsFile, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (error) {
    next(error);
    return;
  }

  try {
    if (brevoSender) {
      await sendWithBrevo(
        brevoSender.apiKey,
        brevoSender.email,
        brevoFromName,
        contactTo,
        submission,
        record.submittedAt,
      );
    } else {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 15_000,
      });
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
    }

    res.status(201).json({ message: 'Your message has been sent.' });
  } catch (error) {
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown email error',
    };
    const cause = typeof error === 'object' && error !== null && 'cause' in error
      ? error.cause
      : undefined;

    if (typeof error === 'object' && error !== null) {
      if ('code' in error && typeof error.code === 'string') {
        errorDetails.code = error.code;
      }
      if ('responseCode' in error && typeof error.responseCode === 'number') {
        errorDetails.responseCode = error.responseCode;
      }
      if ('command' in error && typeof error.command === 'string') {
        errorDetails.command = error.command;
      }
    }
    if (typeof cause === 'object' && cause !== null && 'code' in cause && typeof cause.code === 'string') {
      errorDetails.causeCode = cause.code;
    }

    console.error('Contact email delivery failed:', errorDetails);
    res.status(502).json({
      message: 'Your message was saved, but we could not email it. Please try again later.',
    });
  }
});

app.use('/api', (error, _req, res, _next) => {
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
});

const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new RangeError('PORT must be an integer between 0 and 65535.');
}

app.listen(port, () => {
  console.log(`Contact API listening on port ${port}`);
});
