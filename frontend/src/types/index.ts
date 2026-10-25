export type DocType = 'RTC' | 'SALE_DEED' | 'ESTAMP' | 'OTHER';

export type DocumentStatus = 'PROCESSING' | 'NEEDS_REVIEW' | 'VALIDATED' | 'REJECTED';

export type ValidationSeverity = 'PASS' | 'WARN' | 'FAIL';

export interface DocumentMetadata {
  id: string;
  filename: string;
  doc_type: DocType;
  status: DocumentStatus;
  uploaded_at: string;
  page_count: number;
  image_url: string;
  overall_confidence: number;
  ocr_engine: string;
  preprocessing: string;
}

export interface DocumentField {
  key: string;
  label_en: string;
  label_kn: string;
  value: string;
  original_value: string;
  confidence: number;
  needs_review: boolean;
  page: number;
  // Bounding box as [x, y, width, height] or [x1, y1, x2, y2]
  bbox: [number, number, number, number];
  corrected_by_user: boolean;
}

export interface ValidationResult {
  rule_id: string;
  severity: ValidationSeverity;
  message: string;
  field_keys: string[];
}

export interface DocumentDetail {
  document: DocumentMetadata;
  fields: DocumentField[];
  validation: ValidationResult[];
}

export interface DocumentUpdateFieldsPayload {
  fields: Record<string, string>;
}

export interface DocumentApprovePayload {
  notes?: string;
  override_failures?: boolean;
}

export interface DocumentRejectPayload {
  reason: string;
}

export interface ValidationFailureStat {
  rule_id: string;
  message: string;
  count: number;
}

export interface DocumentStats {
  total: number;
  needs_review: number;
  validated: number;
  rejected: number;
  processing: number;
  avg_confidence: number;
  status_counts: {
    PROCESSING: number;
    NEEDS_REVIEW: number;
    VALIDATED: number;
    REJECTED: number;
  };
  common_validation_failures: ValidationFailureStat[];
}

export type SortField = 'uploaded_at' | 'filename' | 'overall_confidence' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface DocumentFilterOptions {
  status?: DocumentStatus | 'ALL';
  search?: string;
  doc_type?: DocType | 'ALL';
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

