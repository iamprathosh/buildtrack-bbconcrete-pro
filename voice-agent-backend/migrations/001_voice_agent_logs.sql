-- Create voice_agent_logs table to store voice query interactions
CREATE TABLE IF NOT EXISTS voice_agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  sql_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_voice_agent_logs_user_id ON voice_agent_logs(user_id);
CREATE INDEX idx_voice_agent_logs_created_at ON voice_agent_logs(created_at);

-- Enable Row Level Security
ALTER TABLE voice_agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_agent_logs
-- Only admins can read/write voice agent logs
CREATE POLICY "Only admins can read voice agent logs" ON voice_agent_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert voice agent logs" ON voice_agent_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_voice_agent_logs_updated_at
  BEFORE UPDATE ON voice_agent_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
