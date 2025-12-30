-- Create countdown_events table for deadline tracking
CREATE TABLE IF NOT EXISTS countdown_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE countdown_events ENABLE ROW LEVEL SECURITY;

-- Create policies for countdown_events
CREATE POLICY "Users can view their own countdown events"
  ON countdown_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own countdown events"
  ON countdown_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own countdown events"
  ON countdown_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own countdown events"
  ON countdown_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_countdown_events_user_id ON countdown_events(user_id);
CREATE INDEX idx_countdown_events_target_date ON countdown_events(target_date);
