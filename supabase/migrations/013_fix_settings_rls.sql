-- Settings table needs public read policy
CREATE POLICY "Settings are viewable by everyone" ON settings FOR
SELECT USING (true);

-- Allow authenticated users to update settings
CREATE POLICY "Authenticated can update settings" ON settings FOR
UPDATE USING (auth.role() = 'authenticated');

-- Service role full access
CREATE POLICY "Service role has full access to settings" ON settings FOR ALL USING (auth.role() = 'service_role');
