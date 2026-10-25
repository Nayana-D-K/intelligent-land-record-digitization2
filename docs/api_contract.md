{
  "document": {
    "id": "doc_0001",
    "filename": "rtc_sample.jpg",
    "doc_type": "RTC | SALE_DEED | ESTAMP | OTHER",
    "status": "PROCESSING | NEEDS_REVIEW | VALIDATED | REJECTED",
    "uploaded_at": "2026-10-25T10:30:00Z",
    "page_count": 1,
    "image_url": "/api/documents/doc_0001/pages/1.png",
    "overall_confidence": 0.78,
    "ocr_engine": "easyocr",
    "preprocessing": "clahe"
  },
  "fields": [
    {
      "key": "survey_number",
      "label_en": "Survey Number",
      "label_kn": "ಸರ್ವೆ ನಂಬರ್",
      "value": "45/2",
      "original_value": "45/2",
      "confidence": 0.91,
      "needs_review": false,
      "page": 1,
      "bbox": [120, 340, 260, 372],
      "corrected_by_user": false
    }
  ],
  "validation": [
    {
      "rule_id": "DATE_SANITY",
      "severity": "PASS | WARN | FAIL",
      "message": "Execution date is before registration date.",
      "field_keys": ["execution_date", "registration_date"]
    }
  ]
}