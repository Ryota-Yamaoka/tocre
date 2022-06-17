CREATE TABLE users (
  id SERIAL NOT NULL,
  firebase_uuid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  PRIMARY KEY (id)
);
