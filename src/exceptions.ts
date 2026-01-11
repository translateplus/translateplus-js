/**
 * Custom exceptions for TranslatePlus client.
 */

export class TranslatePlusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslatePlusError';
    Object.setPrototypeOf(this, TranslatePlusError.prototype);
  }
}

export class TranslatePlusAPIError extends TranslatePlusError {
  public statusCode?: number;
  public response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'TranslatePlusAPIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, TranslatePlusAPIError.prototype);
  }
}

export class TranslatePlusAuthenticationError extends TranslatePlusAPIError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'TranslatePlusAuthenticationError';
    Object.setPrototypeOf(this, TranslatePlusAuthenticationError.prototype);
  }
}

export class TranslatePlusRateLimitError extends TranslatePlusAPIError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'TranslatePlusRateLimitError';
    Object.setPrototypeOf(this, TranslatePlusRateLimitError.prototype);
  }
}

export class TranslatePlusInsufficientCreditsError extends TranslatePlusAPIError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'TranslatePlusInsufficientCreditsError';
    Object.setPrototypeOf(this, TranslatePlusInsufficientCreditsError.prototype);
  }
}

export class TranslatePlusValidationError extends TranslatePlusError {
  constructor(message: string) {
    super(message);
    this.name = 'TranslatePlusValidationError';
    Object.setPrototypeOf(this, TranslatePlusValidationError.prototype);
  }
}
