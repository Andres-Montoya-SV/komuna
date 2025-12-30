import { login, register, deleteAccount, validatePassword } from './auth';
import { LoginCredentials, RegisterData } from '@/types/auth.types';

describe('Auth Utilities', () => {
  describe('login', () => {
    it('returns user for valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await login(credentials);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    it('returns null for invalid email', async () => {
      const credentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      const user = await login(credentials);
      expect(user).toBeNull();
    });
  });

  describe('register', () => {
    it('creates new user with valid data', async () => {
      const data: RegisterData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        role: 'buyer',
      };

      const user = await register(data);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('john@example.com');
      expect(user?.name).toBe('John Doe');
    });

    it('throws error for password mismatch', async () => {
      const data: RegisterData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
        role: 'buyer',
      };

      await expect(register(data)).rejects.toThrow('Passwords do not match');
    });
  });

  describe('validatePassword', () => {
    it('validates strong password', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('identifies weak password issues', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('deleteAccount', () => {
    it('deletes account successfully', async () => {
      const result = await deleteAccount('user123');
      expect(result).toBe(true);
    });
  });
});
