import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginModal from './LoginModal';
import { GlobalContext } from '../context/GlobalContext';

describe('LoginModal', () => {
  const mockSetLoggedIn = jest.fn();
  const mockSetLoginModalOpen = jest.fn();

  const renderWithContext = (isLoginModalOpen = true) => {
    return render(
      <GlobalContext.Provider
        value={{
          setLoggedIn: mockSetLoggedIn,
          isLoginModalOpen,
          setLoginModalOpen: mockSetLoginModalOpen,
          loggedIn: false,
          cart: [],
          setCart: jest.fn(),
        } as any}
      >
        <LoginModal />
      </GlobalContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  it('should not render when isLoginModalOpen is false', () => {
    const { container } = renderWithContext(false);
    expect(container.firstChild).toBeNull();
  });

  it('should render the login form correctly', () => {
    renderWithContext(true);
    expect(screen.getByText('Access your One Choice Kitchen subscription')).toBeTruthy();
    expect(screen.getByPlaceholderText('customer@test.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('should show validation errors on empty submission', async () => {
    renderWithContext(true);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email address is required')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });
  });

  it('should toggle to register mode', async () => {
    renderWithContext(true);
    const signUpLink = screen.getByText('Sign Up');
    fireEvent.click(signUpLink);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('John Doe')).toBeTruthy();
      expect(screen.getByText('Create a new account')).toBeTruthy();
    });
  });

  it('should handle successful login via API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'test-jwt-token' }),
    });

    renderWithContext(true);

    fireEvent.change(screen.getByPlaceholderText('customer@test.com'), { target: { value: 'customer@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'test123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
      expect(mockSetLoginModalOpen).toHaveBeenCalledWith(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('customer_token', 'test-jwt-token');
    });
  });

  it('should handle failed login with wrong credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid email or password' }),
    });

    renderWithContext(true);

    fireEvent.change(screen.getByPlaceholderText('customer@test.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeTruthy();
      expect(mockSetLoggedIn).not.toHaveBeenCalled();
    });
  });
});
