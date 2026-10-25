import type {
  DocumentDetail,
  DocumentMetadata,
  DocumentStats,
  DocumentUpdateFieldsPayload,
  DocumentApprovePayload,
  DocumentRejectPayload,
  DocumentFilterOptions,
} from '../types';

// In-memory mock database populated with 6 realistic Karnataka land records
let mockDocuments: DocumentDetail[] = [
  {
    document: {
      id: 'doc_0001',
      filename: 'rtc_sample.jpg',
      doc_type: 'SALE_DEED',
      status: 'NEEDS_REVIEW',
      uploaded_at: '2026-10-25T10:30:00Z',
      page_count: 1,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.78,
      ocr_engine: 'easyocr',
      preprocessing: 'clahe',
    },
    fields: [
      {
        key: 'document_title',
        label_en: 'Document Title',
        label_kn: 'ದಾಖಲೆಯ ಶೀರ್ಷಿಕೆ',
        value: 'AGREEMENT OF SALE',
        original_value: 'AGREEMENT OF SALE',
        confidence: 0.94,
        needs_review: false,
        page: 1,
        bbox: [180, 520, 480, 550], // [ymin, xmin, ymax, xmax] in relative/image pixels
        corrected_by_user: false,
      },
      {
        key: 'execution_date',
        label_en: 'Execution Date',
        label_kn: 'ಒಪ್ಪಂದದ ದಿನಾಂಕ',
        value: '16/11/2010',
        original_value: '16.11.2010',
        confidence: 0.88,
        needs_review: false,
        page: 1,
        bbox: [210, 100, 240, 720],
        corrected_by_user: false,
      },
      {
        key: 'registration_date',
        label_en: 'Registration Date',
        label_kn: 'ನೋಂದಣಿ ದಿನಾಂಕ',
        value: '10/11/2010',
        original_value: '10/11/2010',
        confidence: 0.85,
        needs_review: true,
        page: 1,
        bbox: [245, 100, 275, 450],
        corrected_by_user: false,
      },
      {
        key: 'seller_name',
        label_en: 'Seller / Executant Name',
        label_kn: 'ಮಾರಾಟಗಾರರ ಹೆಸರು',
        value: 'SRI. G. PRABHAKAR',
        original_value: 'BRi, G,PRABHAKAR',
        confidence: 0.62,
        needs_review: true,
        page: 1,
        bbox: [290, 150, 325, 480],
        corrected_by_user: false,
      },
      {
        key: 'seller_relative_name',
        label_en: "Seller's Father / Guardian",
        label_kn: 'ತಂದೆ / ಪೋಷಕರ ಹೆಸರು',
        value: 'S/o G. Obalesu',
        original_value: 'Slo . G, Obalesu',
        confidence: 0.72,
        needs_review: false,
        page: 1,
        bbox: [325, 150, 355, 380],
        corrected_by_user: false,
      },
      {
        key: 'seller_address',
        label_en: 'Seller Address',
        label_kn: 'ಮಾರಾಟಗಾರರ ವಿಳಾಸ',
        value: 'No.3, Patel House, Audugodi, Bangalore-560030',
        original_value: 'Co3;or: Patel House, Audugodi; Banga"ore-560 030.',
        confidence: 0.54,
        needs_review: true,
        page: 1,
        bbox: [355, 150, 410, 680],
        corrected_by_user: false,
      },
      {
        key: 'survey_number',
        label_en: 'Survey Number',
        label_kn: 'ಸರ್ವೆ ನಂಬರ್',
        value: '45/2',
        original_value: '45/2',
        confidence: 0.91,
        needs_review: false,
        page: 1,
        bbox: [430, 200, 460, 350],
        corrected_by_user: false,
      },
      {
        key: 'village',
        label_en: 'Village',
        label_kn: 'ಗ್ರಾಮ',
        value: 'ಬೆಳ್ಳಂದೂರು (Bellandur)',
        original_value: 'ಬೆಳ್ಳಂದೂರು (Bellandur)',
        confidence: 0.89,
        needs_review: false,
        page: 1,
        bbox: [465, 200, 495, 420],
        corrected_by_user: false,
      },
      {
        key: 'extent_acres',
        label_en: 'Land Extent (Acres-Guntas)',
        label_kn: 'ವಿಸ್ತೀರ್ಣ (ಎಕರೆ-ಗುಂಟೆ)',
        value: '1-24',
        original_value: '1-24',
        confidence: 0.83,
        needs_review: false,
        page: 1,
        bbox: [500, 200, 530, 360],
        corrected_by_user: false,
      },
      {
        key: 'consideration_amount',
        label_en: 'Sale Consideration (INR)',
        label_kn: 'ಕ್ರಯದ ಮೊತ್ತ (ರೂ)',
        value: '45,00,000',
        original_value: '45,00,000',
        confidence: 0.95,
        needs_review: false,
        page: 1,
        bbox: [540, 200, 570, 430],
        corrected_by_user: false,
      },
      {
        key: 'stamp_duty_paid',
        label_en: 'Stamp Duty Paid (INR)',
        label_kn: 'ಮುದ್ರಾಂಕ ಶುಲ್ಕ (ರೂ)',
        value: '1,50,000',
        original_value: '1,50,000',
        confidence: 0.88,
        needs_review: false,
        page: 1,
        bbox: [575, 200, 605, 410],
        corrected_by_user: false,
      },
    ],
    validation: [
      {
        rule_id: 'DATE_SANITY',
        severity: 'FAIL',
        message: 'Registration date (10/11/2010) cannot be earlier than execution date (16/11/2010).',
        field_keys: ['execution_date', 'registration_date'],
      },
      {
        rule_id: 'STAMP_DUTY_CALC',
        severity: 'WARN',
        message: 'Stamp duty (1,50,000) is 3.33% of sale consideration, which is below the statutory 5% rate for Karnataka.',
        field_keys: ['stamp_duty_paid', 'consideration_amount'],
      },
      {
        rule_id: 'CONFIDENCE_THRESHOLD',
        severity: 'WARN',
        message: 'Seller address OCR confidence is 0.54, which is below the 0.70 review threshold.',
        field_keys: ['seller_address'],
      },
      {
        rule_id: 'SURVEY_NO_FORMAT',
        severity: 'PASS',
        message: 'Survey number 45/2 complies with Karnataka Revenue Department Bhoomi format.',
        field_keys: ['survey_number'],
      },
    ],
  },
  {
    document: {
      id: 'doc_0002',
      filename: 'rtc_pahani_mandya_102.jpg',
      doc_type: 'RTC',
      status: 'VALIDATED',
      uploaded_at: '2026-10-24T14:15:00Z',
      page_count: 1,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.93,
      ocr_engine: 'easyocr',
      preprocessing: 'adaptive',
    },
    fields: [
      {
        key: 'survey_number',
        label_en: 'Survey Number',
        label_kn: 'ಸರ್ವೆ ನಂಬರ್',
        value: '102/3B',
        original_value: '102/3B',
        confidence: 0.96,
        needs_review: false,
        page: 1,
        bbox: [120, 300, 160, 450],
        corrected_by_user: false,
      },
      {
        key: 'owner_name',
        label_en: 'Owner / Pattadar Name',
        label_kn: 'ಖಾತೆದಾರರ ಹೆಸರು',
        value: 'ಮಂಜೇಗೌಡ (Manjegowda)',
        original_value: 'ಮಂಜೇಗೌಡ (Manjegowda)',
        confidence: 0.94,
        needs_review: false,
        page: 1,
        bbox: [170, 200, 210, 520],
        corrected_by_user: false,
      },
      {
        key: 'extent_acres',
        label_en: 'Total Extent (Acres-Guntas)',
        label_kn: 'ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ (ಎಕರೆ-ಗುಂಟೆ)',
        value: '3-12',
        original_value: '3-12',
        confidence: 0.92,
        needs_review: false,
        page: 1,
        bbox: [220, 200, 260, 380],
        corrected_by_user: false,
      },
      {
        key: 'soil_type',
        label_en: 'Soil Classification',
        label_kn: 'ಮಣ್ಣಿನ ವಿವರಣೆ',
        value: 'ಖುಷ್ಕಿ (Dry Land)',
        original_value: 'ಖುಷ್ಕಿ (Dry Land)',
        confidence: 0.90,
        needs_review: false,
        page: 1,
        bbox: [270, 200, 310, 420],
        corrected_by_user: false,
      },
    ],
    validation: [
      {
        rule_id: 'SURVEY_NO_FORMAT',
        severity: 'PASS',
        message: 'Survey number 102/3B matches Mandya district registry standards.',
        field_keys: ['survey_number'],
      },
      {
        rule_id: 'BHOOMI_MATCH',
        severity: 'PASS',
        message: 'Owner name cross-referenced successfully against Bhoomi database.',
        field_keys: ['owner_name'],
      },
    ],
  },
  {
    document: {
      id: 'doc_0003',
      filename: 'estamp_cert_mysore_2024.png',
      doc_type: 'ESTAMP',
      status: 'NEEDS_REVIEW',
      uploaded_at: '2026-10-25T08:20:00Z',
      page_count: 1,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.65,
      ocr_engine: 'easyocr',
      preprocessing: 'contrast',
    },
    fields: [
      {
        key: 'certificate_number',
        label_en: 'e-Stamp Certificate No',
        label_kn: 'ಇ-ಮುದ್ರಾಂಕ ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ',
        value: 'IN-KA99120384729103V',
        original_value: 'IN-KA99120384729103V',
        confidence: 0.91,
        needs_review: false,
        page: 1,
        bbox: [100, 150, 140, 550],
        corrected_by_user: false,
      },
      {
        key: 'purchased_by',
        label_en: 'Purchased By',
        label_kn: 'ಖರೀದಿಸಿದವರು',
        value: 'ಎಚ್. ಎಸ್. ರಮೇಶ್ (H.S. Ramesh)',
        original_value: 'ಎಚ್. ಎಸ್. ರಮೇಶ (H.S. Rarnesh)',
        confidence: 0.61,
        needs_review: true,
        page: 1,
        bbox: [150, 150, 190, 500],
        corrected_by_user: false,
      },
      {
        key: 'stamp_duty_amount',
        label_en: 'Stamp Duty Amount (INR)',
        label_kn: 'ಮುದ್ರಾಂಕ ಶುಲ್ಕ ಮೊತ್ತ (ರೂ)',
        value: '500',
        original_value: '500',
        confidence: 0.88,
        needs_review: false,
        page: 1,
        bbox: [200, 150, 240, 320],
        corrected_by_user: false,
      },
    ],
    validation: [
      {
        rule_id: 'CERT_CHECKSUM',
        severity: 'PASS',
        message: 'e-Stamp certificate number checksum is valid.',
        field_keys: ['certificate_number'],
      },
      {
        rule_id: 'CONFIDENCE_THRESHOLD',
        severity: 'WARN',
        message: 'Purchaser name has low OCR confidence (0.61). Manual verification suggested.',
        field_keys: ['purchased_by'],
      },
    ],
  },
  {
    document: {
      id: 'doc_0004',
      filename: 'deed_bangalore_rural_77.pdf',
      doc_type: 'SALE_DEED',
      status: 'REJECTED',
      uploaded_at: '2026-10-23T16:45:00Z',
      page_count: 2,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.44,
      ocr_engine: 'easyocr',
      preprocessing: 'grayscale',
    },
    fields: [
      {
        key: 'survey_number',
        label_en: 'Survey Number',
        label_kn: 'ಸರ್ವೆ ನಂಬರ್',
        value: '???',
        original_value: '???',
        confidence: 0.22,
        needs_review: true,
        page: 1,
        bbox: [130, 250, 170, 380],
        corrected_by_user: false,
      },
      {
        key: 'seller_name',
        label_en: 'Seller Name',
        label_kn: 'ಮಾರಾಟಗಾರರ ಹೆಸರು',
        value: 'ಅಸ್ಪಷ್ಟ (Unreadable)',
        original_value: 'XXXXXX',
        confidence: 0.35,
        needs_review: true,
        page: 1,
        bbox: [180, 250, 220, 480],
        corrected_by_user: false,
      },
    ],
    validation: [
      {
        rule_id: 'IMAGE_QUALITY',
        severity: 'FAIL',
        message: 'Document scan resolution is under 150 DPI with severe motion blur and ink bleed.',
        field_keys: ['survey_number', 'seller_name'],
      },
      {
        rule_id: 'MISSING_MANDATORY_FIELD',
        severity: 'FAIL',
        message: 'Survey number could not be resolved from scanned deed.',
        field_keys: ['survey_number'],
      },
    ],
  },
  {
    document: {
      id: 'doc_0005',
      filename: 'rtc_belagavi_farm_88.jpg',
      doc_type: 'RTC',
      status: 'PROCESSING',
      uploaded_at: '2026-10-25T13:00:00Z',
      page_count: 1,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.0,
      ocr_engine: 'easyocr',
      preprocessing: 'clahe',
    },
    fields: [],
    validation: [],
  },
  {
    document: {
      id: 'doc_0006',
      filename: 'mutation_register_hassan_14.jpg',
      doc_type: 'OTHER',
      status: 'VALIDATED',
      uploaded_at: '2026-10-22T11:10:00Z',
      page_count: 1,
      image_url: '/mock/rtc_sample.jpg',
      overall_confidence: 0.89,
      ocr_engine: 'easyocr',
      preprocessing: 'otsu',
    },
    fields: [
      {
        key: 'mutation_number',
        label_en: 'Mutation Entry (MR) No',
        label_kn: 'ಮ್ಯುಟೇಶನ್ ನಂ',
        value: 'MR-2023-T104',
        original_value: 'MR-2023-T104',
        confidence: 0.94,
        needs_review: false,
        page: 1,
        bbox: [120, 200, 160, 400],
        corrected_by_user: false,
      },
      {
        key: 'transferee_name',
        label_en: 'Acquiring Party Name',
        label_kn: 'ಹಕ್ಕು ಪಡೆದವರ ಹೆಸರು',
        value: 'ಕಾವೇರಮ್ಮ (Kaveramma)',
        original_value: 'ಕಾವೇರಮ್ಮ (Kaveramma)',
        confidence: 0.88,
        needs_review: false,
        page: 1,
        bbox: [180, 200, 220, 480],
        corrected_by_user: false,
      },
    ],
    validation: [
      {
        rule_id: 'MUTATION_REGISTERED',
        severity: 'PASS',
        message: 'Mutation entry successfully verified against Tehsil register.',
        field_keys: ['mutation_number'],
      },
    ],
  },
];

export const mockClient = {
  async getDocuments(params?: DocumentFilterOptions): Promise<DocumentMetadata[]> {
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    let list = mockDocuments.map((d) => ({ ...d.document }));

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((d) => d.status === params.status);
    }
    if (params?.doc_type && params.doc_type !== 'ALL') {
      list = list.filter((d) => d.doc_type === params.doc_type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.filename.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.doc_type.toLowerCase().includes(q)
      );
    }

    if (params?.sortBy) {
      const field = params.sortBy;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        if (a[field] < b[field]) return -1 * order;
        if (a[field] > b[field]) return 1 * order;
        return 0;
      });
    } else {
      // Default sort by uploaded_at desc
      list.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    }

    return list;
  },

  async getDocumentById(id: string): Promise<DocumentDetail> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const doc = mockDocuments.find((d) => d.document.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }
    return JSON.parse(JSON.stringify(doc));
  },

  async uploadDocument(file: File, docType?: string): Promise<DocumentDetail> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newId = `doc_${String(mockDocuments.length + 1).padStart(4, '0')}`;
    const newDoc: DocumentDetail = {
      document: {
        id: newId,
        filename: file.name,
        doc_type: (docType as any) || 'RTC',
        status: 'NEEDS_REVIEW',
        uploaded_at: new Date().toISOString(),
        page_count: 1,
        image_url: '/mock/rtc_sample.jpg',
        overall_confidence: 0.81,
        ocr_engine: 'easyocr',
        preprocessing: 'clahe',
      },
      fields: [
        {
          key: 'survey_number',
          label_en: 'Survey Number',
          label_kn: 'ಸರ್ವೆ ನಂಬರ್',
          value: '84/1',
          original_value: '84/1',
          confidence: 0.88,
          needs_review: false,
          page: 1,
          bbox: [150, 320, 190, 440],
          corrected_by_user: false,
        },
        {
          key: 'applicant_name',
          label_en: 'Applicant / Owner Name',
          label_kn: 'ಅರ್ಜಿದಾರ / ಮಾಲೀಕರ ಹೆಸರು',
          value: 'ಸುರೇಶ್ ಕುಮಾರ್ (Suresh Kumar)',
          original_value: 'ಸುರೇಶ ಕುಮಾರ್ (Suresh Kumnr)',
          confidence: 0.74,
          needs_review: true,
          page: 1,
          bbox: [210, 200, 250, 520],
          corrected_by_user: false,
        },
        {
          key: 'extent_acres',
          label_en: 'Extent (Acres-Guntas)',
          label_kn: 'ವಿಸ್ತೀರ್ಣ (ಎಕರೆ-ಗುಂಟೆ)',
          value: '2-10',
          original_value: '2-10',
          confidence: 0.84,
          needs_review: false,
          page: 1,
          bbox: [270, 200, 300, 360],
          corrected_by_user: false,
        },
      ],
      validation: [
        {
          rule_id: 'SURVEY_NO_FORMAT',
          severity: 'PASS',
          message: 'Survey number conforms to Karnataka Revenue Department format.',
          field_keys: ['survey_number'],
        },
        {
          rule_id: 'CONFIDENCE_THRESHOLD',
          severity: 'WARN',
          message: 'Applicant name confidence is 0.74, close to threshold.',
          field_keys: ['applicant_name'],
        },
      ],
    };

    mockDocuments.unshift(newDoc);
    return JSON.parse(JSON.stringify(newDoc));
  },

  async updateFields(id: string, payload: DocumentUpdateFieldsPayload): Promise<DocumentDetail> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const doc = mockDocuments.find((d) => d.document.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    // Update field values
    for (const [key, newValue] of Object.entries(payload.fields)) {
      const field = doc.fields.find((f) => f.key === key);
      if (field) {
        field.value = newValue;
        field.corrected_by_user = field.value !== field.original_value;
        field.needs_review = false;
        // User correction elevates confidence to 1.0
        if (field.corrected_by_user) {
          field.confidence = 1.0;
        }
      }
    }

    // Recalculate dynamic validation rules
    const executionField = doc.fields.find((f) => f.key === 'execution_date');
    const registrationField = doc.fields.find((f) => f.key === 'registration_date');
    if (executionField && registrationField) {
      const dateSanityIdx = doc.validation.findIndex((v) => v.rule_id === 'DATE_SANITY');
      // If user fixed the date or they are equal / valid
      const [ed, em, ey] = executionField.value.split(/[-/.]/).map(Number);
      const [rd, rm, ry] = registrationField.value.split(/[-/.]/).map(Number);
      if (ey && ry && (ey < ry || (ey === ry && em < rm) || (ey === ry && em === rm && ed <= rd))) {
        if (dateSanityIdx !== -1) {
          doc.validation[dateSanityIdx] = {
            rule_id: 'DATE_SANITY',
            severity: 'PASS',
            message: 'Execution date is verified to be on or before registration date.',
            field_keys: ['execution_date', 'registration_date'],
          };
        }
      }
    }

    // Re-check overall confidence
    if (doc.fields.length > 0) {
      const sumConf = doc.fields.reduce((acc, f) => acc + f.confidence, 0);
      doc.document.overall_confidence = Number((sumConf / doc.fields.length).toFixed(2));
    }

    return JSON.parse(JSON.stringify(doc));
  },

  async approveDocument(id: string, payload?: DocumentApprovePayload): Promise<DocumentDetail> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const doc = mockDocuments.find((d) => d.document.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    const hasFails = doc.validation.some((v) => v.severity === 'FAIL');
    if (hasFails && !payload?.override_failures) {
      throw new Error('Cannot approve document while FAIL validation rules are unresolved without override confirmation.');
    }

    doc.document.status = 'VALIDATED';
    return JSON.parse(JSON.stringify(doc));
  },

  async rejectDocument(id: string, payload: DocumentRejectPayload): Promise<DocumentDetail> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const doc = mockDocuments.find((d) => d.document.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    doc.document.status = 'REJECTED';
    doc.validation.push({
      rule_id: 'USER_REJECTION',
      severity: 'FAIL',
      message: `Manually rejected by reviewer: ${payload.reason}`,
      field_keys: [],
    });

    return JSON.parse(JSON.stringify(doc));
  },

  async getStats(): Promise<DocumentStats> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const total = mockDocuments.length;
    const status_counts = {
      PROCESSING: mockDocuments.filter((d) => d.document.status === 'PROCESSING').length,
      NEEDS_REVIEW: mockDocuments.filter((d) => d.document.status === 'NEEDS_REVIEW').length,
      VALIDATED: mockDocuments.filter((d) => d.document.status === 'VALIDATED').length,
      REJECTED: mockDocuments.filter((d) => d.document.status === 'REJECTED').length,
    };

    const evaluatedDocs = mockDocuments.filter((d) => d.document.overall_confidence > 0);
    const avg_confidence =
      evaluatedDocs.length > 0
        ? Number((evaluatedDocs.reduce((acc, d) => acc + d.document.overall_confidence, 0) / evaluatedDocs.length).toFixed(2))
        : 0;

    // Collect common validation failures
    const failureCountMap: Record<string, { message: string; count: number }> = {};
    for (const d of mockDocuments) {
      for (const v of d.validation) {
        if (v.severity === 'FAIL') {
          if (!failureCountMap[v.rule_id]) {
            failureCountMap[v.rule_id] = { message: v.message, count: 0 };
          }
          failureCountMap[v.rule_id].count += 1;
        }
      }
    }

    const common_failures = Object.entries(failureCountMap)
      .map(([rule_id, data]) => ({
        rule_id,
        message: data.message,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      needs_review: status_counts.NEEDS_REVIEW,
      validated: status_counts.VALIDATED,
      rejected: status_counts.REJECTED,
      processing: status_counts.PROCESSING,
      avg_confidence,
      status_counts,
      common_validation_failures: common_failures,
    };
  },
};

