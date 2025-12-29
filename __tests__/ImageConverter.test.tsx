import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ImageConverter } from '@/components/ImageConverter';

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/png;base64,test',
  onload: jest.fn(),
};

Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockFileReader),
});

// Mock fetch
global.fetch = jest.fn();

describe('ImageConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('should render the drop zone', () => {
    render(<ImageConverter />);
    expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    expect(
      screen.getByText(/Drop your image here or click to browse/i)
    ).toBeInTheDocument();
  });

  it('should render the file input', () => {
    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp,image/gif');
  });

  it('should render convert button in disabled state initially', () => {
    render(<ImageConverter />);
    const convertButton = screen.getByTestId('convert-button');
    expect(convertButton).toBeInTheDocument();
    expect(convertButton).toBeDisabled();
  });

  it('should render category checkboxes', () => {
    render(<ImageConverter />);
    expect(screen.getByTestId('category-icon')).toBeInTheDocument();
    expect(screen.getByTestId('category-feature')).toBeInTheDocument();
    expect(screen.getByTestId('category-splash')).toBeInTheDocument();
    expect(screen.getByTestId('category-screenshot')).toBeInTheDocument();
    expect(screen.getByTestId('category-tv')).toBeInTheDocument();
  });

  it('should have default categories selected', () => {
    render(<ImageConverter />);
    expect(screen.getByTestId('category-icon')).toBeChecked();
    expect(screen.getByTestId('category-feature')).toBeChecked();
    expect(screen.getByTestId('category-splash')).toBeChecked();
    expect(screen.getByTestId('category-screenshot')).not.toBeChecked();
    expect(screen.getByTestId('category-tv')).not.toBeChecked();
  });

  it('should toggle category selection', () => {
    render(<ImageConverter />);
    const iconCheckbox = screen.getByTestId('category-icon');

    expect(iconCheckbox).toBeChecked();
    fireEvent.click(iconCheckbox);
    expect(iconCheckbox).not.toBeChecked();
    fireEvent.click(iconCheckbox);
    expect(iconCheckbox).toBeChecked();
  });

  it('should render color picker with default white color', () => {
    render(<ImageConverter />);
    const colorPicker = screen.getByTestId('color-picker');
    const colorInput = screen.getByTestId('color-input');

    expect(colorPicker).toBeInTheDocument();
    expect(colorInput).toBeInTheDocument();
    expect(colorPicker).toHaveValue('#ffffff');
    expect(colorInput).toHaveValue('#ffffff');
  });

  it('should update color when picker changes', () => {
    render(<ImageConverter />);
    const colorPicker = screen.getByTestId('color-picker');
    const colorInput = screen.getByTestId('color-input');

    fireEvent.change(colorPicker, { target: { value: '#000000' } });

    expect(colorPicker).toHaveValue('#000000');
    expect(colorInput).toHaveValue('#000000');
  });

  it('should update color when text input changes', () => {
    render(<ImageConverter />);
    const colorPicker = screen.getByTestId('color-picker');
    const colorInput = screen.getByTestId('color-input');

    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(colorPicker).toHaveValue('#ff0000');
    expect(colorInput).toHaveValue('#ff0000');
  });

  it('should show error for invalid file type', async () => {
    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      /Please upload a valid image file/i
    );
  });

  it('should accept valid image files', async () => {
    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });
      }
    });

    // Convert button should be enabled after file selection
    await waitFor(() => {
      expect(screen.getByTestId('convert-button')).not.toBeDisabled();
    });
  });

  it('should show error when converting with no categories selected', async () => {
    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    // Add a file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Deselect all categories
    fireEvent.click(screen.getByTestId('category-icon'));
    fireEvent.click(screen.getByTestId('category-feature'));
    fireEvent.click(screen.getByTestId('category-splash'));

    // Try to convert
    await act(async () => {
      fireEvent.click(screen.getByTestId('convert-button'));
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      /Please select at least one asset category/i
    );
  });

  it('should handle drag over events', () => {
    render(<ImageConverter />);
    const dropZone = screen.getByTestId('drop-zone');

    fireEvent.dragEnter(dropZone);
    expect(dropZone.className).toContain('border-primary');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).toContain('border-border');
  });

  it('should handle file drop', async () => {
    render(<ImageConverter />);
    const dropZone = screen.getByTestId('drop-zone');

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    const dataTransfer = {
      files: [file],
    };

    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer });
    });

    await waitFor(() => {
      expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
    });
  });

  it('should show clear button after file selection', async () => {
    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    // Initially no clear button
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('clear-button')).toBeInTheDocument();
    });
  });

  it('should call API when convert button is clicked', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/zip' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify([{ name: 'test', success: true }])),
      },
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });
      }
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('convert-button'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/convert', expect.any(Object));
    });
  });

  it('should show error when API returns error', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Conversion failed' }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<ImageConverter />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });
      }
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('convert-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Conversion failed');
    });
  });
});
