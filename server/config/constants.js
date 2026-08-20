/**
 * Constants
 * Centralized terminology 
 */

const TOKEN_TYPES = {
    VERIFICATION: "verification",
    RESET: "reset",
    OAUTH: "oauth",
};

const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
};

const MAIL_CONFIGS = {
    [ TOKEN_TYPES.VERIFICATION ]: {
        pageBadge: "EMAIL VERIFICATION",
        heroTitle: "Verify Your Email Address",
        heroDescription:
            "We've sent a verification link to your email address. Verify your account to start sharing recipes.",
        emailActionText: "We've sent an email to:",
        footerText: "Already verified your account?",
        footerLink: { text: "Sign In", href: "/sign-in" },
        resendAction: "Resend verification email",
        tokenExpiryHours: 24,
    },
    [ TOKEN_TYPES.RESET ]: {
        pageBadge: "PASSWORD RECOVERY",
        heroTitle: "Password Reset Sent Successfully",
        heroDescription:
            "We've securely sent a password reset link to your email address.",
        emailActionText: "We've sent an email to:",
        footerText: "Remember your password?",
        footerLink: { text: "Sign In", href: "/sign-in" },
        resendAction: "Resend reset link",
        tokenExpiryHours: 1,
    },
};

const COOKIE_NAMES = {
    MAIL_CONFIRM: "mailConfirm",
    JWT: "jwt",
};

const ERROR_MESSAGES = {
    SESSION_EXPIRED: "Session expired. Please try again.",
    INVALID_SESSION: "Invalid session. Please try again.",
    USER_NOT_FOUND: "User not found. Please register again.",
    TOKEN_NOT_FOUND: "Token not found or expired. Please try again.",
};

const MAIL_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes

module.exports = {
    TOKEN_TYPES,
    USER_ROLES,
    MAIL_CONFIGS,
    COOKIE_NAMES,
    ERROR_MESSAGES,
    MAIL_COOKIE_MAX_AGE,
};