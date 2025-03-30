-- Create video_analytics table
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id VARCHAR(255) NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  average_view_duration INTEGER DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  estimated_revenue DECIMAL(10,2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create channel_analytics table
CREATE TABLE IF NOT EXISTS channel_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_subscribers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  average_views_per_video INTEGER DEFAULT 0,
  subscriber_growth DECIMAL(5,2) DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create optimization_suggestions table
CREATE TABLE IF NOT EXISTS optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  suggestion TEXT NOT NULL,
  impact TEXT NOT NULL,
  is_applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create video_optimization_history table
CREATE TABLE IF NOT EXISTS video_optimization_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id VARCHAR(255) NOT NULL,
  suggestion_id UUID REFERENCES optimization_suggestions(id),
  before_metrics JSONB,
  after_metrics JSONB,
  improvement_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_recorded_at ON video_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_channel_analytics_recorded_at ON channel_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_video_id ON optimization_suggestions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_optimization_history_video_id ON video_optimization_history(video_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_analytics_updated_at
  BEFORE UPDATE ON video_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_analytics_updated_at
  BEFORE UPDATE ON channel_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimization_suggestions_updated_at
  BEFORE UPDATE ON optimization_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 