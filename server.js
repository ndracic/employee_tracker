const inquirer = require("inquirer");
const db = require('./connection');

const consoleTable = require('console.table');

const promptMessages = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View All Employees By Department",
    viewByManager: "View All Employees By Manager",
    addEmployee: "Add An Employee",
    removeEmployee: "Remove An Employee",
    updateRole: "Update Employee Role",
    updateEmployeeManager: "Update Manager",
    viewAllRoles: "View All Roles",
    exit: "Exit"
  };

//intialize server and call functions
db.connect(error => {
    if(error) throw error;
    console.log('Connected to database');
    startApp();
    getDepartment();
    getRole();
    getEmployee();
});

function prompt() {
    inquirer.prompt({
        tyoe: "list",
        name: 'action',
        message: "What would you like to do?",
        choices: [
            promptMessages.viewByManager,
            promptMessages.viewByDepartment,
            promptMessages.viewAllEmployees,
            promptMessages.viewAllRoles,
            promptMessages.addEmployee,
            promptMessages.removeEmployee,
            promptMessages.updateRole,
            promptMessages.exit
        ]
    }).then(selection => {
        console.log('Selected:', selection);
        switch(selection.action) {
            case promptMessages.viewAllEmployees:
                viewAllEmployees();
                break;
            case promptMessages.viewByDepartment:
                viewByDepartment();
                break;

            case promptMessages.viewByManager:
              viewByManager();
              break;

            case promptMessages.addEmployee:
              addEmployee();
              break;

            case promptMessages.removeEmployee:
              remove('delete');
              break;

            case promptMessages.updateRole:
              remove('role');
              break;

            case promptMessages.viewAllRoles:
              viewAllRoles();
              break;

            case promptMessages.exit:
              connection.end();
              break;
        }
    });
}

//view all employees -- puts employees in table containing emp.id, emp name, title, dept., salary, manager
function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id;`;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.log('view employees');
        console.log('\n');
        console.table(res);
        prompt();
    });
}

function viewAllRoles() {
    const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY role.title;`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('VIEW EMPLOYEE BY ROLE');
      console.log('\n');
      console.table(res);
      prompt();
    });
}  
//View All Employees By Department - command prints all departments as well as the employees in it.//
function viewByDepartment() {
    const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY department.name;`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('VIEW EMPLOYEE BY DEPARTMENT');
      console.log('\n');
      console.table(res);
      prompt();
    });
  }
  
  //*View All Employees* By Manager - command prints all employee managers as well as their associates.//
  function viewByManager() {
    const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name, role.title
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY manager;`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('VIEW EMPLOYEE BY MANAGER');
      console.log('\n');
      console.table(res);
      prompt();
    });
  }