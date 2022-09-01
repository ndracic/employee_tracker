INSERT  INTO department (name)
VALUES 
('Executive'),
('Operations'),
('Analystics'),
('Marketing');

SELECT * FROM department

INSERT INTO role (title, salary, department_id)
VALUES 
('CEO', 1000000, 1),
('CEO Assistant', 900000, 1),
('Team Lead Analyst', 70000, 1),
('Team Analyst', 60000, 1),
('Media Specialist', 50000, 1),
('Budget Analyst', 40000, 2),
('Bookkeeper', 80000, 2),
('Engineer', 90000, 3);

SELECT * FROM role

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Kanita', 'Omerb', 1, NULL),
('Eliza', 'John', 2, 1),
('Monty', 'John', 3, NULL),
('Mia', 'Pamla', 4, 3),
('cuscus', 'amir', 5, NULL),
('john', 'travolta', 6, 5),
('Cutler', 'Jay', 7, NULL),
('Obama', 'Barrack', 8,7);

SELECT * FROM employee