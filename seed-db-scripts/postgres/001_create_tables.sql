CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    power_office_id INTEGER NOT NULL
);

insert into employees (id, email, power_office_id) VALUES
    (1, 'example@example.no', 123);