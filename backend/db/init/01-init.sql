-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversions table
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR NOT NULL,
    "fromCurrency" VARCHAR NOT NULL,
    "toCurrency" VARCHAR NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    result DECIMAL(18,8) NOT NULL,
    "responseBody" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_conversions_userid_createdat 
ON conversions("userId", "createdAt"); 