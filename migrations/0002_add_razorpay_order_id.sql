ALTER TABLE custom_print_requests ADD COLUMN razorpay_order_id TEXT;
CREATE INDEX idx_requests_razorpay_order_id ON custom_print_requests(razorpay_order_id);
