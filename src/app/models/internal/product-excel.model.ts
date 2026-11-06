export interface ProductExcelConflict {
  code: string;
  name: string;
  presentation: string;
  stock: number;
  category: string;
}

export interface ProductExcelError {
  row: number | null;
  column: string;
  message: string;
  conflicts?: ProductExcelConflict[];
}

export interface ProductExcelPreviewRow {
  row: number | null;
  code: string | null;
  name: string;
  presentation: string;
  stock_before: number | null;
  stock_after: number;
  action: 'create' | 'update' | 'zero';
}

export interface ProductExcelResult {
  inserted_count: number;
  updated_count: number;
  zeroed_count: number;
  total_processed: number;
}

export interface ProductExcelImport extends ProductExcelResult {
  id: string;
  local: number;
  filename: string;
  imported_at: string;
}

export interface ProductExcelPreview extends ProductExcelResult {
  valid: boolean;
  errors: ProductExcelError[];
  preview: ProductExcelPreviewRow[];
  catalog_version: string;
}
