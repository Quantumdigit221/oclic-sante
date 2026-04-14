-- Exemple de schéma SQL pour une application santé Supabase

CREATE TABLE health_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  director_name TEXT,
  rnis TEXT,
  capacity INTEGER,
  pispi_alias TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES health_centers(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  avatar_url TEXT
);

CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES health_centers(id),
  code TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  phone TEXT,
  address TEXT,
  blood_group TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES health_centers(id),
  name TEXT NOT NULL,
  category TEXT,
  price INTEGER,
  emergency_price INTEGER,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES health_centers(id),
  name TEXT NOT NULL,
  dci TEXT,
  stock INTEGER,
  min_stock INTEGER,
  price INTEGER,
  expiry_date DATE,
  category TEXT,
  batch_number TEXT,
  form TEXT
);

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES health_centers(id),
  ticket_number TEXT UNIQUE,
  patient_id uuid REFERENCES patients(id),
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_phone TEXT,
  service_id uuid REFERENCES services(id),
  service_name TEXT,
  amount INTEGER,
  payment_method TEXT,
  status TEXT,
  doctor_id uuid REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Policies RLS pour sécuriser les tables principales

-- Patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read patients of own center" ON patients FOR SELECT USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Insert patients of own center" ON patients FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Update patients of own center" ON patients FOR UPDATE USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);

-- Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read tickets of own center" ON tickets FOR SELECT USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Insert tickets of own center" ON tickets FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Update tickets of own center" ON tickets FOR UPDATE USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read services of own center" ON services FOR SELECT USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Insert services of own center" ON services FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Update services of own center" ON services FOR UPDATE USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);

-- Medicines
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read medicines of own center" ON medicines FOR SELECT USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Insert medicines of own center" ON medicines FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);
CREATE POLICY "Update medicines of own center" ON medicines FOR UPDATE USING (
  auth.uid() IS NOT NULL AND center_id = (current_setting('request.jwt.claims', true)::json->>'center_id')::uuid
);