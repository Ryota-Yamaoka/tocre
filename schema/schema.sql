CREATE TABLE users (
  id SERIAL NOT NULL,
  firebase_uuid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  PRIMARY KEY (id)
);

CREATE TABLE works (
  id SERIAL NOT NULL,
  user_id SERIAL REFERENCES users (id) NOT NULL,
  url VARCHAR(2048) NOT NULL,

--  必要なカラムを追加してみてください。
--  文字列の場合の型はVARCHAR(255 or 512 or 1024 or ..) になります。
--  中の数字は文字列の想定の長さによって使い分けます。日本語１文字がVARCHAR2ぐらいのイメージです
-- 例：inspiration VARCHAR(512) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL default current_timestamp,
  PRIMARY KEY (id)
);
