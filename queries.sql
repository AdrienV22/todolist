CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL
);

INSERT INTO items (title) VALUES ('Faire mon vocabulaire de japonais'), ('Faire mes 10 000 pas');