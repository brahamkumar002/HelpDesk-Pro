
const API_BASE_URL = '/api';

let csrfToken = null;
let csrfRequest = null;

export class ApiError extends Error {
  constructor(message, status, validationErrors = null) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data, status) {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title;
    }
  }

  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 404) {
    return 'The requested resource was not found.';
  }

  if (status >= 500) {
    return 'Something went wrong on the server. Please try again.';
  }

  return 'Unable to complete your request.';
}

async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  if (csrfRequest) {
    return csrfRequest;
  }

  csrfRequest = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await readResponse(response);

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(data, response.status),
        response.status,
        data?.validationErrors ?? null
      );
    }

    // Supports a JSON CSRF response containing the token.
    const token = data?.token;

    if (typeof token !== 'string' || !token.trim()) {
      throw new ApiError(
        'Unable to initialize security token. Please refresh the page.',
        0
      );
    }

    csrfToken = token;
    return token;
  })();

  try {
    return await csrfRequest;
  } finally {
    csrfRequest = null;
  }
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfRequest = null;
}

export async function apiRequest(
  endpoint,
  {
    method = 'GET',
    body,
    headers = {},
    signal,
  } = {}
) {
  const normalizedMethod = method.toUpperCase();
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(
    normalizedMethod
  );

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (isMutation) {
    requestHeaders['X-XSRF-TOKEN'] = await getCsrfToken();
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: normalizedMethod,
      credentials: 'include',
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new ApiError(
      'Unable to connect to the server. Please check your connection.',
      0
    );
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, response.status),
      response.status,
      data?.validationErrors ?? null
    );
  }

  return data;
}

export const api = {
  get(endpoint, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete(endpoint, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};
