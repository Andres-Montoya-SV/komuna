import { User, LoginCredentials, RegisterData } from '@/types/auth.types';
import { isValidEmail, sanitizeInput } from './security';

/**
 * Simulates user authentication (in production, this would call an API)
 */
export async function login(credentials: LoginCredentials): Promise<User | null> {
  // Validate input
  if (!isValidEmail(credentials.email) || !credentials.password) {
    return null;
  }

  // In a real app, this would be an API call
  // For now, simulate authentication
  const sanitizedEmail = sanitizeInput(credentials.email.toLowerCase());

  // Mock user - in production, verify password hash
  const mockUser: User = {
    id: '1',
    email: sanitizedEmail,
    name: 'John Doe',
    role: 'seller',
    createdAt: new Date().toISOString(),
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockUser;
}

/**
 * Simulates user registration
 */
export async function register(data: RegisterData): Promise<User | null> {
  // Validate input
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email address');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // In a real app, this would create a user via API
  const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
  const sanitizedName = sanitizeInput(data.name);

  const newUser: User = {
    id: Date.now().toString(),
    email: sanitizedEmail,
    name: sanitizedName,
    role: data.role,
    phone: data.phone ? sanitizeInput(data.phone) : undefined,
    createdAt: new Date().toISOString(),
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return newUser;
}

/**
 * Simulates account deletion
 */
export async function deleteAccount(_userId: string): Promise<boolean> {
  // In a real app, this would delete the user via API
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
