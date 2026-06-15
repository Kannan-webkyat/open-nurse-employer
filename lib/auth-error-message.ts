type AuthErrorContext = 'forgot-password' | 'reset-password' | 'login';

const TECHNICAL_ERROR_PATTERNS = [
  /smtp/i,
  /symfony\\/i,
  /transportexception/i,
  /expected response code/i,
  /mailer/i,
  /stream_socket_client/i,
  /connection could not be established/i,
  /535-/i,
  /badcredentials/i,
  /swift_/i,
  /curl error/i,
  /sqlstate/i,
  /stack trace/i,
];

function isTechnicalErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (trimmed.length > 180) return true;

  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function getFirstValidationError(
  errors?: Record<string, string[] | string> | null
): string | null {
  if (!errors) return null;

  const first = Object.values(errors).flat()[0];
  return typeof first === 'string' && first.trim() ? first.trim() : null;
}

function getDefaultMessage(context?: AuthErrorContext): string {
  switch (context) {
    case 'forgot-password':
      return "We couldn't send the reset email right now. Please try again in a few minutes or contact support if the problem continues.";
    case 'reset-password':
      return "We couldn't reset your password. The link may have expired, so please request a new reset link.";
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function sanitizeAuthErrorMessage(
  message?: string | null,
  errors?: Record<string, string[] | string> | null,
  context?: AuthErrorContext
): string {
  const validationError = getFirstValidationError(errors);
  if (validationError && !isTechnicalErrorMessage(validationError)) {
    return validationError;
  }

  const trimmed = message?.trim();
  if (!trimmed || isTechnicalErrorMessage(trimmed)) {
    return getDefaultMessage(context);
  }

  return trimmed;
}

export function getForgotPasswordErrorDisplay(
  message?: string | null,
  errors?: Record<string, string[] | string> | null
): { title: string; message: string } {
  const sanitized = sanitizeAuthErrorMessage(message, errors, 'forgot-password');
  const lower = sanitized.toLowerCase();

  if (lower.includes("can't find an employer")) {
    return { title: 'Account not found', message: sanitized };
  }

  if (lower.includes('valid email')) {
    return { title: 'Invalid email address', message: sanitized };
  }

  if (lower.includes('temporarily unavailable')) {
    return { title: 'Service unavailable', message: sanitized };
  }

  return { title: 'Unable to send reset email', message: sanitized };
}
