import '@testing-library/jest-dom';

// TextEncoder/TextDecoderのモック（ブラウザ環境のみ）
if (typeof window !== 'undefined') {
  if (typeof TextEncoder === 'undefined') {
    (window as any).TextEncoder = class TextEncoder {
      encode(text: string) {
        return new Uint8Array(Array.from(text, c => c.charCodeAt(0)));
      }
    };
  }
  if (typeof TextDecoder === 'undefined') {
    (window as any).TextDecoder = class TextDecoder {
      decode(bytes: Uint8Array) {
        return String.fromCharCode(...bytes);
      }
    };
  }
}

// モック環境変数
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Vite環境変数のモック（Node.js環境では使用しない）
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'import', {
    value: {
      meta: {
        env: {
          VITE_API_BASE_URL: 'http://localhost:4000',
          VITE_OPENAI_API_KEY: 'test-openai-key',
          VITE_INSTAGRAM_APP_ID: 'test-app-id',
          VITE_INSTAGRAM_APP_SECRET: 'test-app-secret',
          VITE_INSTAGRAM_REDIRECT_URI: 'http://localhost:3001/auth/facebook/callback',
          VITE_API_URL: 'https://api.myservice.com',
          VITE_API_TOKEN: 'your_actual_token_here',
          VITE_DEBUG: 'true',
        }
      }
    }
  });
}

// import.meta.envのグローバルモック（Jest環境用）
(globalThis as any).importMeta = {
  env: {
    VITE_API_BASE_URL: "http://localhost:4000",
    VITE_OPENAI_API_KEY: "test-key",
    VITE_INSTAGRAM_APP_ID: "test-app-id",
    VITE_INSTAGRAM_APP_SECRET: "test-app-secret",
    VITE_INSTAGRAM_REDIRECT_URI: "http://localhost:3001/auth/facebook/callback",
    VITE_API_URL: "http://localhost:4000/api",
    VITE_API_TOKEN: "your_actual_token_here",
    VITE_DEBUG: "true"
  }
};

// グローバルスコープでのimport.meta.envモック
if (typeof globalThis !== 'undefined') {
  try {
    Object.defineProperty(globalThis, 'import', {
      value: {
        meta: {
          env: {
            VITE_API_BASE_URL: "http://localhost:4000",
            VITE_OPENAI_API_KEY: "test-key",
            VITE_INSTAGRAM_APP_ID: "test-app-id",
            VITE_INSTAGRAM_APP_SECRET: "test-app-secret",
            VITE_INSTAGRAM_REDIRECT_URI: "http://localhost:3001/auth/facebook/callback",
            VITE_API_URL: "http://localhost:4000/api",
            VITE_API_TOKEN: "your_actual_token_here",
            VITE_DEBUG: "true"
          }
        }
      },
      writable: true,
      configurable: true
    });
  } catch (error) {
    // 既に定義されている場合は無視
    console.log('import.meta already defined, skipping...');
  }
}

// グローバルスコープでのimport.meta直接定義
if (typeof globalThis !== 'undefined') {
  try {
    (globalThis as any).import = {
      meta: {
        env: {
          VITE_API_BASE_URL: "http://localhost:4000",
          VITE_OPENAI_API_KEY: "test-key",
          VITE_INSTAGRAM_APP_ID: "test-app-id",
          VITE_INSTAGRAM_APP_SECRET: "test-app-secret",
          VITE_INSTAGRAM_REDIRECT_URI: "http://localhost:3001/auth/facebook/callback",
          VITE_API_URL: "http://localhost:4000/api",
          VITE_API_TOKEN: "your_actual_token_here",
          VITE_DEBUG: "true"
        }
      }
    };
  } catch (error) {
    // 既に定義されている場合は無視
    console.log('import.meta already defined, skipping...');
  }
}

// console.logのモック（テスト中のログ出力を抑制）
if (typeof window !== 'undefined') {
  (window as any).console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
} 