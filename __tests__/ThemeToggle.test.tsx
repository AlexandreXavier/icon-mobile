import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

// Test component to inspect theme value
function ThemeInspector() {
  const { theme } = useTheme();
  return <span data-testid="theme-value">{theme}</span>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    document.documentElement.classList.remove('dark');
  });

  it('should provide default light theme', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('should load saved theme from localStorage', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('dark');

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
  });

  it('should save theme to localStorage when changed', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
          <ThemeInspector />
        </ThemeProvider>
      );
    });

    const toggleButton = screen.getByTestId('theme-toggle');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ThemeInspector />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    document.documentElement.classList.remove('dark');
  });

  it('should render a toggle button', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('should have correct aria-label for light mode', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('light');

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    );
  });

  it('should have correct aria-label for dark mode', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('dark');

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    );
  });

  it('should toggle theme when clicked', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('light');

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
          <ThemeInspector />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');

    await act(async () => {
      fireEvent.click(screen.getByTestId('theme-toggle'));
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');

    await act(async () => {
      fireEvent.click(screen.getByTestId('theme-toggle'));
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('should add dark class to document when in dark mode', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('light');

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await act(async () => {
      fireEvent.click(screen.getByTestId('theme-toggle'));
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
