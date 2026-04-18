### 1. MSME Registrations Table
This table stores data collected via Vapi and the simulation.

```sql
-- Create MSME Registrations table
CREATE TABLE msme_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  industry TEXT NOT NULL,
  daily_usage NUMERIC NOT NULL,
  current_stock NUMERIC NOT NULL,
  days_of_fuel NUMERIC GENERATED ALWAYS AS (CASE WHEN daily_usage > 0 THEN current_stock / daily_usage ELSE 0 END) STORED,
  employees INTEGER NOT NULL,
  fuel_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL, -- 'red', 'yellow', 'green'
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  cluster TEXT,
  pin_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE msme_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads (for the dashboard)
CREATE POLICY "Allow public read access" ON msme_registrations
  FOR SELECT USING (true);

-- Create policy to allow anonymous inserts (for the Vapi webhook)
CREATE POLICY "Allow public insert access" ON msme_registrations
  FOR INSERT WITH CHECK (true);
```

### 2. Fuel Dealers Table
This table stores the real-world petrol pump locations.

```sql
-- Create Fuel Dealers table
CREATE TABLE fuel_dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL, -- 'IndianOil', 'BPCL', 'HPCL'
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  city TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  stock_pct INTEGER DEFAULT 100,
  status TEXT DEFAULT 'available',
  accepts_voucher BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fuel_dealers ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read access" ON fuel_dealers
  FOR SELECT USING (true);
```

### 3. Vouchers Table (Optional for Phase 4)
For tracking the dynamic fuel rerouting QR codes.

```sql
CREATE TABLE fuel_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  msme_id UUID REFERENCES msme_registrations(id),
  dealer_id UUID REFERENCES fuel_dealers(id),
  voucher_code TEXT UNIQUE NOT NULL,
  amount_kg NUMERIC NOT NULL,
  is_redeemed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
