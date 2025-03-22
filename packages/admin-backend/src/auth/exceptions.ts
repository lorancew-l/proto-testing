export class InvalidCredentials extends Error {
  constructor() {
    super('Invalid password or email');
  }
}

export class InvalidToken extends Error {
  constructor() {
    super('Invalid token');
  }
}
