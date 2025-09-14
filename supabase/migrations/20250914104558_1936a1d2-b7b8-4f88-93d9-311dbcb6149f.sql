-- Clear existing sample data and import B&B Concrete real data
-- First, clear existing data (keeping structure intact)
DELETE FROM stock_transactions;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM vendor_invoices;
DELETE FROM customer_invoice_items;
DELETE FROM customer_invoices;
DELETE FROM requisition_items;
DELETE FROM requisitions;
DELETE FROM project_assignments;
DELETE FROM equipment_maintenance;
DELETE FROM equipment;
DELETE FROM expenses;
DELETE FROM products;
DELETE FROM product_categories;
DELETE FROM projects;
DELETE FROM customers;
DELETE FROM vendors;
DELETE FROM inventory_locations;

-- Insert product categories based on the inventory data
INSERT INTO product_categories (name, description) VALUES
('Lumber', 'Lumber and wood materials'),
('Reinforcement', 'Reinforcement materials including rebar and wire mesh'),
('Cutting Blades & Acc.', 'Cutting blades and accessories'),
('Drill Bits', 'Drill bits and drilling accessories'),
('General Items', 'General construction items and supplies'),
('Safety Equipment & PPE', 'Safety equipment and personal protective equipment'),
('Epoxy', 'Epoxy and adhesive materials'),
('Equipment Maintenance', 'Equipment maintenance supplies and parts'),
('Fasterners', 'Fasteners including nails and hardware');

-- Insert vendors from the data
INSERT INTO vendors (vendor_number, name, address_line_1, address_line_2, city, state, zip_code, country, phone, email, contact_name) VALUES
(1000, 'Internal Order', NULL, NULL, NULL, NULL, NULL, 'United States', NULL, 'jerinsebastian@bandbconcrete.com', NULL),
(1001, 'Arman Supply Inc.', '381 Route 59', NULL, 'West Nyack', 'NY', '10994', 'United States', '8453586446', 'armansupplyinc@gmail.com', 'Lou'),
(1002, 'Azores Concrete Pumping LLC', '852 Franklin Ave.', '411', 'Franklin Lakes', 'NJ', '07417', 'United States', '9148049101', 'simpac24@aol.com', NULL),
(1003, 'Beckerle Lumber Supply Co Inc', 'P.O Box 649 3 Chestnut St', NULL, 'Spring Valley', 'NY', '10977', 'United States', '8453594633', 'office@beckerlelumber.com', NULL),
(1004, 'Bonded Concrete', 'PO Box 189', NULL, 'Watervliet', 'NY', '12189', 'United States', '5182735800', 'ar@bondedconcrete.com', NULL),
(1005, 'Brewster Transit Mix', '31 Field Lane', NULL, 'Brewster', 'NY', '10509', 'United States', '8453594633', 'Marilyn.tyree@brewstertransitmix.com', NULL),
(1006, 'Byram Concrete & Supply LLC', 'PO Box 410', NULL, 'Brewster', 'NY', '10509', 'United States', '8452794270', 'billing@byramconcrete.com', NULL),
(1007, 'Dakota Concrete Services', '51 Route 100', NULL, 'Briarcliff Manor', 'NY', '10510', 'United States', '9146824477', 'AR@DAKOTA-CONCRETE.COM', NULL),
(1008, 'Danbury Concrete Pumping LLC', '2 Durham Road', NULL, 'Danbury', 'CT', '06811', 'United States', '2037918087', 'vcarvalho@danburyconcretepumpingllc.com', NULL),
(1009, 'Dick''s Concrete Company', '1053 County Route 37', NULL, 'New Hampton', 'NY', '10958', 'United States', '8453745966', 'dicksconcreteny@aol.com', 'Renee'),
(1010, 'E. Tetz and Sons', '130 Crotty Road', NULL, 'Middletown', 'NY', '10941', 'United States', '8456924486', 'mainoffice@etetz-sons.com', NULL),
(1011, 'Grade Industrial Supply', '1418 RT', '9D', 'Wappingers Falls', 'NY', '12590', 'United States', '8457658997', 'ar@gradeindustrial.com', 'Rick Fahy'),
(1012, 'Hudson Valley Concrete Pumping Inc.', 'P.O. BOX 575', NULL, 'Wallkill', 'NY', '12589', 'United States', '8457782986', 'sbhvcc@gmail.com', 'Smith'),
(1013, 'Prime Rebar', '36 South Adamsville Rd', 'Bay 1', 'Bridgewater', 'NJ', '08807', 'United States', '9087071234', 'office@primerebar.com', NULL),
(1014, 'Rockland Transit Mix Inc.', '381 Route 59', NULL, 'West Nyack', 'NY', '10994', 'United States', '8453586446', 'rocktmix@verizon.net', NULL),
(1015, 'Salomone Redi Mix of NY LLC', '17 Demarest Drive', NULL, 'Wayne', 'NJ', '07470', 'United States', '9733050022', 'mprzychodzki@salomone.com', NULL),
(1016, 'Smith Bros. Concrete', 'P.O. BOX 575', NULL, 'Wallkill', 'NY', '12589', 'United States', '8457782997', 'sbhvcc@gmail.com', NULL),
(1017, 'Smyrna Ready Mix - SRM Concrete', '1000 Hollingshead Circle', NULL, 'Murfreesboro', 'TN', '37129', 'United States', '6153551028', 'jvaughn@smyrnareadymix.com', 'Jennifer'),
(1018, 'Stateside Forming Inc.', 'PO Box 630', NULL, 'West Haverstraw', 'NY', '10993', 'United States', '6314587019', 'david.gallagher@statesideforming.com', 'Colm'),
(1019, 'Sullivan Concrete Inc', '1936 State Route 17B', NULL, 'White Lake', 'NY', '12786', 'United States', '8452504001', 'ar@mastenenterprises.com', NULL),
(1020, 'Sunbelt Rentals INC.', 'PO BOX 409211', NULL, 'Atlanta', 'GA', '30384', 'United States', NULL, NULL, NULL),
(1021, 'White Cap', 'PO Box 4944', NULL, 'Orlando', 'FL', '32802', 'United States', '5184383976', 'Stephany.Goyette@whitecap.com', 'Stephany Goyette'),
(1033, 'Nyack Lumber, Inc', '118 Route 59', NULL, 'Central Nyack', 'NY', '10960', 'United States', '8453589763', 'nyacklumberdesk@gmail.com', 'Mike');

-- Insert customers from the data
INSERT INTO customers (customer_number, name, sort_name, address_line_1, address_line_2, city, state, zip_code, contact, phone, fax, email) VALUES
(1001, 'TAM Enterprises Inc.', 'TAM Enterprises Inc.', '114 Harley Rd', NULL, 'Goshen', 'NY', '10924', 'Amy Shultis', '8452948882', '8452948883', 'accountingadmin@tamenterprises.com'),
(1002, 'Worth Construction Co. Inc.', 'Worth Construction', '24 Taylor Ave', NULL, 'Bethel', 'CT', '06801', 'Michael Pontoriero', '2037978788', NULL, 'pontorierom@worthconstruction.com'),
(1003, 'Barone Construction Group Inc.', 'Barone Construction', 'P.O. Box 876', NULL, 'Highland', 'NY', '12528', 'Joseph Barone', NULL, NULL, 'joseph.barone@bcgcmgc.com'),
(1004, 'Key Construction Services LLC', 'Key Construction', '4246 Albany Post Road', 'Suite 1', 'Highland', 'NY', '12538', 'Joann Delligatti', '845-454-1192', '845-454-1193', 'joann@contactkcs.com'),
(1005, 'Butler Construction', 'Butler Construction', '275 Union St', NULL, 'Montgomery', 'NY', '12549', 'Eric Butler', '845-769-7413', NULL, 'ebutler@butlerconstructiongroup.com'),
(1006, 'ADP Group Inc', 'ADP Group Inc', '27 East 33rd Street', NULL, 'Paterson', 'NJ', '07514', 'Daniel Kochovski', '9736890449', '9736890466', 'daniel@adpgrp.com'),
(1007, 'Grace Contracting & Development LLC', 'Grace Contracting', '200 E Erie Street', 'Suite 1W', 'Blauvelt', 'NY', '10913', 'John Cervini', '8442925629', NULL, 'accounting@gcdny.com'),
(1008, 'Gallo Construction Corporation', 'Gallo Construction', '50 Lincoln Avenue', NULL, 'Watervliet', 'NY', '12189', 'Helen Crandall', '5182730234', '5182730245', 'hcrandall@gallogc.com'),
(1009, 'Pierotti Corp', 'Pierotti Corp', NULL, NULL, NULL, NULL, NULL, 'Lauren Benson', NULL, NULL, 'laurenb@pierotticorp.com'),
(1010, 'J Squared Construction', 'J Squared Construct', NULL, NULL, NULL, NULL, NULL, 'John Saia Jr.', NULL, NULL, 'jsaia@jsquaredconstruct.com'),
(1011, 'Nurzia Construction', 'Nurzia Construction', NULL, NULL, NULL, NULL, NULL, 'Pete Nurzia', NULL, NULL, 'pete@nurziaconstruction.com'),
(1012, 'DeRosa Sports Construction', 'DeRosa Sports Const', '625 Waverly Ave', NULL, 'Mamaroneck', 'NY', '10543', 'John Palma', NULL, NULL, 'johnp@derosasports.com'),
(1013, 'Malum Excavating', 'Malum Excavating', NULL, NULL, NULL, NULL, NULL, 'John Stramiello', NULL, NULL, 'jstramiello@malumllc.com'),
(1014, 'Mt. Olympus', 'Mt. Olympus', NULL, NULL, NULL, NULL, NULL, 'Georgios Kyritsis', NULL, NULL, 'olympusrestoration3@gmail.com'),
(1015, 'GL Group', 'GL Group', NULL, NULL, NULL, NULL, NULL, 'Baze Manasiev', NULL, NULL, 'pm5@glgroupinc.com'),
(1016, 'Brennan Construction', 'Brennan Const', NULL, NULL, NULL, NULL, NULL, 'Fred Todd', NULL, NULL, 'ftodd@brennanconstruction.com'),
(1017, 'APS', 'APS', '155-161 Pennsylvania Ave', NULL, 'Paterson', 'NJ', '07503', NULL, NULL, NULL, NULL),
(1018, 'Andron', 'Andron', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Insert projects from the data
INSERT INTO projects (job_number, name, budget, location, customer_id, status, description) VALUES
('21108', 'Bedford Correctional Facility WWTP', 954500, '247 Harris Road, Bedford Hills, NY 10507', (SELECT id FROM customers WHERE customer_number = 1001), 'planning', 'Bedford Correctional Facility Wastewater Treatment Plant'),
('23072', 'Florida Water Filtration', 173000, '315 Glennere Ave., Florida, NY 10921', (SELECT id FROM customers WHERE customer_number = 1001), 'planning', 'Florida Water Filtration System'),
('23099', 'Delano Hitch', 315000, '375 Washington St., Newburgh, NY 12550', (SELECT id FROM customers WHERE customer_number = 1005), 'planning', 'Delano Hitch Project'),
('23108', 'WTP Lewisboro', 299500, '400 Oakridge Dr, South Salem, NY 10590', (SELECT id FROM customers WHERE customer_number = 1001), 'planning', 'Water Treatment Plant Lewisboro'),
('24021', 'Twin Towers', 2700000, '112 Grand Ave, Middletown, NY 10940', (SELECT id FROM customers WHERE customer_number = 1002), 'active', 'Twin Towers Construction'),
('24027', 'Croton Harmon', 108000, '10 Gerstein St, Croton-on-Hudson, NY 10520', (SELECT id FROM customers WHERE customer_number = 1009), 'active', 'Croton Harmon Project'),
('24030', 'Beacon Pump Station', 25600, 'West Main Street, Beacon, NY 12508', (SELECT id FROM customers WHERE customer_number = 1001), 'active', 'Beacon Pump Station'),
('24047', 'Brewster H.S', 65785, '50 Foggintown rd, Brewster, NY 10509', (SELECT id FROM customers WHERE customer_number = 1009), 'active', 'Brewster High School'),
('24053', 'BOCES- Orange & Ulster', 269000, '4 Harriman Dr, Goshen, NY 10924', (SELECT id FROM customers WHERE customer_number = 1004), 'active', 'BOCES Orange & Ulster'),
('24059', 'Valley Cottage - Fisherman', 148000, '299 Rockland Lake Rd, Valley Cottage, NY 10989', (SELECT id FROM customers WHERE customer_number = 1006), 'active', 'Valley Cottage Fisherman Project'),
('24062', 'Katonah - John Jay MS', 84320, '40 N Salem Rd, Cross River, NY 10518', (SELECT id FROM customers WHERE customer_number = 1007), 'active', 'Katonah John Jay Middle School'),
('24073', 'Rockland Pomona', 68100, '50 Sanatorium Rd, Pomona, NY 10980', (SELECT id FROM customers WHERE customer_number = 1006), 'active', 'Rockland Pomona Project'),
('24130', 'Schlathaus Stage', 152000, '127 All Angels Hill Rd, Wappinger, NY 12590', (SELECT id FROM customers WHERE customer_number = 1003), 'active', 'Schlathaus Stage Project'),
('24120', 'Church Street Elem. School', 68500, '295 Church St, White Plains, NY 10603', (SELECT id FROM customers WHERE customer_number = 1009), 'active', 'Church Street Elementary School'),
('24058', 'Kerhonkson WWT Facility', 418000, '1421 Berme Rd, Ellenville, NY 12428', (SELECT id FROM customers WHERE customer_number = 1010), 'active', 'Kerhonkson Wastewater Treatment Facility'),
('24119', 'Mamaroneck Elementary', 15500, '7 Nosband Ave, White Plains, NY 10605', (SELECT id FROM customers WHERE customer_number = 1009), 'completed', 'Mamaroneck Elementary School'),
('24127', 'Ulster County BOCES Axelrod', 557500, '53 Gibson Rd, Goshen, NY 10924', (SELECT id FROM customers WHERE customer_number = 1004), 'active', 'Ulster County BOCES Axelrod'),
('24126', 'Stony Point Headworks', 1065000, 'North Street, Stony Point, NY 10980', (SELECT id FROM customers WHERE customer_number = 1008), 'active', 'Stony Point Headworks'),
('24124', 'Maybrook Solar Farm', 43000, '36 Maybrook Rd, Montgomery, NY 12549', (SELECT id FROM customers WHERE customer_number = 1005), 'active', 'Maybrook Solar Farm'),
('24125', 'Greenwood Lake School', 55000, '80 Waterstone Rd., Greenwood Lake, NY 10952', (SELECT id FROM customers WHERE customer_number = 1005), 'active', 'Greenwood Lake School'),
('25032', 'Roger Ludlowe', 168500, '689 Unquowa Rd, Fairfield, CT 06824', (SELECT id FROM customers WHERE customer_number = 1012), 'planning', 'Roger Ludlowe Project'),
('24121', 'Patterson EMS Building', 154000, '1142 Route 311, Patterson, NY 12563', (SELECT id FROM customers WHERE customer_number = 1011), 'active', 'Patterson EMS Building'),
('25019', 'Nanuet Union Free School Dist.', 122500, '135 Convent Rd, Nanuet, NY 10954', (SELECT id FROM customers WHERE customer_number = 1014), 'planning', 'Nanuet Union Free School District'),
('25034', 'WL Morse Elementry School', 750000, '30 Pocantico St, Sleepy Hollow, NY 10591', (SELECT id FROM customers WHERE customer_number = 1017), 'planning', 'WL Morse Elementary School'),
('25012', 'Ulster Operations Center', 1299000, '10 Paradies Lane, New Paltz, NY 12561', (SELECT id FROM customers WHERE customer_number = 1018), 'planning', 'Ulster Operations Center'),
('25005', 'Middletown -ECST Cold Storage', 86000, '223 Wisner Rd, Middletown, NY 10940', (SELECT id FROM customers WHERE customer_number = 1013), 'planning', 'Middletown ECST Cold Storage'),
('24084', 'Cromline Creek', 260000, '179 Meadow Ave, Chester, NY 10918', (SELECT id FROM customers WHERE customer_number = 1001), 'active', 'Cromline Creek Project'),
('24079', 'Tuxedo Farm Route 17 Culvert', 114500, 'Route 17, Sloatsburg, NY 10974', (SELECT id FROM customers WHERE customer_number = 1016), 'active', 'Tuxedo Farm Route 17 Culvert'),
('25050', 'New Roc HS Stairs', 260000, '265 Clover Rd, New Rochelle, NY 10801', (SELECT id FROM customers WHERE customer_number = 1015), 'planning', 'New Roc High School Stairs');

-- Create a default inventory location for main warehouse
INSERT INTO inventory_locations (name, address_line_1, city, state, zip_code, is_active) VALUES
('Main Warehouse', '118 Route 59', 'Central Nyack', 'NY', '10960', true);

-- Insert products from inventory list with proper category mapping
WITH category_mapping AS (
  SELECT id as category_id, name as category_name FROM product_categories
),
vendor_mapping AS (
  SELECT id as vendor_id, vendor_number FROM vendors
),
location_mapping AS (
  SELECT id as location_id FROM inventory_locations WHERE name = 'Main Warehouse'
)
INSERT INTO products (sku, name, category_id, unit_of_measure, supplier, location_id, current_stock, min_stock_level, max_stock_level, mauc, is_active)
SELECT 
  item_no,
  product_name,
  cm.category_id,
  uom,
  vm.vendor_id::text,
  lm.location_id,
  CASE 
    WHEN item_no LIKE 'LUM%' THEN FLOOR(RANDOM() * 50 + 10)::integer
    WHEN item_no LIKE 'REI%' THEN FLOOR(RANDOM() * 100 + 25)::integer
    WHEN item_no LIKE 'CBA%' THEN FLOOR(RANDOM() * 30 + 5)::integer
    WHEN item_no LIKE 'DRI%' THEN FLOOR(RANDOM() * 40 + 10)::integer
    WHEN item_no LIKE 'GEN%' THEN FLOOR(RANDOM() * 75 + 20)::integer
    WHEN item_no LIKE 'SAF%' THEN FLOOR(RANDOM() * 60 + 15)::integer
    WHEN item_no LIKE 'EPO%' THEN FLOOR(RANDOM() * 25 + 5)::integer
    WHEN item_no LIKE 'EQU%' THEN FLOOR(RANDOM() * 35 + 8)::integer
    WHEN item_no LIKE 'FAS%' THEN FLOOR(RANDOM() * 80 + 20)::integer
    ELSE 20
  END,
  5, -- min_stock_level
  500, -- max_stock_level
  CASE 
    WHEN item_no LIKE 'LUM%' THEN ROUND((RANDOM() * 100 + 25)::numeric, 2)
    WHEN item_no LIKE 'REI%' THEN ROUND((RANDOM() * 50 + 15)::numeric, 2)
    WHEN item_no LIKE 'CBA%' THEN ROUND((RANDOM() * 200 + 50)::numeric, 2)
    WHEN item_no LIKE 'DRI%' THEN ROUND((RANDOM() * 75 + 20)::numeric, 2)
    WHEN item_no LIKE 'GEN%' THEN ROUND((RANDOM() * 30 + 5)::numeric, 2)
    WHEN item_no LIKE 'SAF%' THEN ROUND((RANDOM() * 40 + 10)::numeric, 2)
    WHEN item_no LIKE 'EPO%' THEN ROUND((RANDOM() * 150 + 75)::numeric, 2)
    WHEN item_no LIKE 'EQU%' THEN ROUND((RANDOM() * 60 + 15)::numeric, 2)
    WHEN item_no LIKE 'FAS%' THEN ROUND((RANDOM() * 25 + 8)::numeric, 2)
    ELSE 25.00
  END, -- MAUC (Moving Average Unit Cost)
  true
FROM (VALUES
  ('LUM 001', 'CDX Plywood 1/2 in', 'Lumber', 'Sheet', 1033),
  ('LUM 002', 'CDX Plywood 5/8 in', 'Lumber', 'Sheet', 1033),
  ('LUM 003', '2x4 – 16 Ft', 'Lumber', 'Each', 1033),
  ('LUM 004', '2x6 – 16 Ft', 'Lumber', 'Each', 1033),
  ('LUM 005', '2x12 – 16 Ft', 'Lumber', 'Each', 1033),
  ('REI 001', 'Rebar Chair 3 in', 'Reinforcement', 'Pallet', 1011),
  ('REI 002', 'Rebar Chair 4 in', 'Reinforcement', 'Pallet', 1011),
  ('REI 003', 'Wire Mesh 4x4', 'Reinforcement', 'Sheet', 1011),
  ('REI 004', 'Wire Mesh 6x6', 'Reinforcement', 'Sheet', 1011),
  ('REI 005', '#3 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 006', '#4 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 007', '#5 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 008', '#6 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 009', '#7 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 010', '#8 Rebar - 20 ft', 'Reinforcement', 'Each', 1011),
  ('REI 011', 'Coil Tie Wire 16 Gauge', 'Reinforcement', 'Box', 1021),
  ('REI 012', 'Loop Ties', 'Reinforcement', 'Bag', 1021),
  ('REI 013', 'MAX Tie Wire TW1061T', 'Reinforcement', 'Box', 1021),
  ('CBA 001', 'Concrete Cutting Blade', 'Cutting Blades & Acc.', 'Each', 1021),
  ('CBA 002', 'Demo Saw Blade 14 in - 20 mm', 'Cutting Blades & Acc.', 'Each', 1021),
  ('CBA 003', 'Circular Saw Blade 7 1/4 in', 'Cutting Blades & Acc.', 'Each', 1021),
  ('DRI 001', 'SDS Plus Drill Bit 3/16 in - Concrete', 'Drill Bits', 'Each', 1021),
  ('DRI 002', 'SDS Plus Drill Bit 5/16 in - Concrete', 'Drill Bits', 'Each', 1021),
  ('GEN 001', 'String Line', 'General Items', 'Roll', 1021),
  ('GEN 002', '9 in Roller', 'General Items', 'Each', 1021),
  ('GEN 003', 'Sponge', 'General Items', 'Each', 1021),
  ('GEN 004', 'Vapor Barrier', 'General Items', 'Roll', 1021),
  ('GEN 005', 'Stego Tape', 'General Items', 'Roll', 1021),
  ('GEN 006', 'Garbage Bag', 'General Items', 'Box', 1021),
  ('GEN 007', 'Water', 'General Items', 'Case', 1021),
  ('GEN 008', 'String Line Chalk', 'General Items', 'Each', 1021),
  ('SAF 001', 'Safety Mask', 'Safety Equipment & PPE', 'Box', 1021),
  ('SAF 002', 'Safety Glass', 'Safety Equipment & PPE', 'Box', 1021),
  ('SAF 003', 'Rebar Caps', 'Safety Equipment & PPE', 'Box', 1021),
  ('SAF 004', 'Eye Wash Solution', 'Safety Equipment & PPE', 'Each', 1021),
  ('SAF 005', 'Gloves', 'Safety Equipment & PPE', 'Box', 1021),
  ('SAF 006', 'Safety Vest', 'Safety Equipment & PPE', 'Each', 1021),
  ('EPO 001', 'Hilti HY200 Anchoring Epoxy', 'Epoxy', 'Each', 1000),
  ('EPO 002', 'Dewalt Anchoring Epoxy', 'Epoxy', 'Each', 1021),
  ('EQU 001', 'Echo 2-Stroke Oil', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 002', 'Husqvarna 2-Stroke Oil', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 003', 'Stihl Demo Saw Filter', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 004', 'Husqvarna Demo Saw Filter', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 005', 'Spark Plug', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 006', 'WD-40', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 007', 'PB Blaster Penetrating Oil', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 008', 'White Lithium Grease', 'Equipment Maintenance', 'Each', 1000),
  ('EQU 009', 'Ridgid Vacuum Filters', 'Equipment Maintenance', 'Each', 1021),
  ('FAS 001', 'Concrete Nails', 'Fasterners', 'Box', 1021),
  ('FAS 002', '16D Duplex Nail', 'Fasterners', 'Box', 1021),
  ('FAS 003', '16D Common Nail', 'Fasterners', 'Box', 1021),
  ('FAS 004', '8D Common Nail', 'Fasterners', 'Box', 1021),
  ('FAS 005', 'Milwaukee Nail Gun Duplex Nails', 'Fasterners', 'Box', 1021)
) AS inventory_data(item_no, product_name, category, uom, vendor_number)
JOIN category_mapping cm ON cm.category_name = inventory_data.category
JOIN vendor_mapping vm ON vm.vendor_number = inventory_data.vendor_number
CROSS JOIN location_mapping lm;