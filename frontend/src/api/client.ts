import type {
  DocumentDetail,
  DocumentMetadata,
  DocumentStats,
  DocumentUpdateFieldsPayload,
  DocumentApprovePayload,
  DocumentRejectPayload,
  DocumentFilterOptions,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export const apiClient = {
  async getDocuments(params?: DocumentFilterOptions): Promise<DocumentMetadata[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }
    if (params?.doc_type && params.doc_type !== 'ALL') {
      searchParams.set('doc_type', params.doc_type);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.sortBy) {
      searchParams.set('sort_by', params.sortBy);
    }
    if (params?.sortOrder) {
      searchParams.set('sort_order', params.sortOrder);
    }

    const qs = searchParams.toString();
    const endpoint = `/api/documents${qs ? `?${qs}` : ''}`;
    const data = await request<DocumentMetadata[] | { documents: DocumentMetadata[] }>(endpoint);
    return Array.isArray(data) ? data : data.documents;
  },

  async getDocumentById(id: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/documents/${id}`);
  },

  async uploadDocument(file: File, docType?: string): Promise<DocumentDetail> {
    const formData = new FormData();
    formData.append('file', file);
    if (docType) {
      formData.append('doc_type', docType);
    }

    return request<DocumentDetail>('/api/documents', {
      method: 'POST',
      body: formData,
    });
  },

  async updateFields(id: string, payload: DocumentUpdateFieldsPayload): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/documents/${id}/fields`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async approveDocument(id: string, payload?: DocumentApprovePayload): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async rejectDocument(id: string, payload: DocumentRejectPayload): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/documents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getStats(): Promise<DocumentStats> {
    return request<DocumentStats>('/api/stats');
  },
};

