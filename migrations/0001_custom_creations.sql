CREATE TABLE custom_print_requests (
  id TEXT PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_pincode TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  length_mm REAL,
  width_mm REAL,
  height_mm REAL,
  dimensions_not_sure INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  preferred_material TEXT,
  preferred_color TEXT,
  custom_color_description TEXT,
  finishing_requirement TEXT,
  intended_purpose TEXT,
  expected_budget REAL,
  required_by_date TEXT,
  additional_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  quoted_price REAL,
  production_days INTEGER,
  delivery_charges REAL,
  final_amount REAL,
  admin_notes TEXT,
  quotation_valid_until TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  converted_order_id TEXT,
  tracking_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_requests_request_number ON custom_print_requests(request_number);
CREATE INDEX idx_requests_email ON custom_print_requests(email);
CREATE INDEX idx_requests_status ON custom_print_requests(status);
CREATE INDEX idx_requests_tracking_token ON custom_print_requests(tracking_token);

CREATE TABLE custom_print_request_images (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES custom_print_requests(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_images_request_id ON custom_print_request_images(request_id);

CREATE TABLE custom_print_request_history (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES custom_print_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_history_request_id ON custom_print_request_history(request_id);

CREATE TABLE custom_print_request_quotations (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES custom_print_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  design_cost REAL NOT NULL DEFAULT 0,
  printing_cost REAL NOT NULL DEFAULT 0,
  finishing_cost REAL NOT NULL DEFAULT 0,
  additional_charges REAL NOT NULL DEFAULT 0,
  delivery_charges REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  final_amount REAL NOT NULL,
  production_days INTEGER NOT NULL,
  valid_until TEXT NOT NULL,
  customer_message TEXT,
  secure_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_quotations_request_id ON custom_print_request_quotations(request_id);
CREATE INDEX idx_quotations_secure_token ON custom_print_request_quotations(secure_token);
