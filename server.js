const inquirer = require("inquirer");
const db = require('./connect');

require('console.table');

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


function prompt() {
    inquirer.prompt({
        name: 'action',
        type: "list",
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
              db.end();
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
    db.query(query, (err, res) => {
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
    db.query(query, (err, res) => {
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
    db.query(query, (err, res) => {
      if (err) throw err;
      console.log(res)
      console.log('VIEW EMPLOYEE BY MANAGER');
      console.log('\n');
      console.table(res);
      prompt();
    });
  }

  //*Add An Employee* - command line adds a new entry to the database.//
async function addEmployee() {
    const newEmpl = await inquirer.prompt(getName());
    db.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: 'What is the employee role?: '
        }
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      db.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        let choices = res.map(res => `${res.first_name} ${res.last_name}`);
        choices.push('none');
        let { manager } = await inquirer.prompt([
          {
            name: 'manager',
            type: 'list',
            choices: choices,
            message: 'Choose the employee Manager: '
          }
        ]);
        let managerId;
        let managerName;
        if (manager === 'none') {
          managerId = null;
        } else {
          for (const data of res) {
            data.fullName = `${data.first_name} ${data.last_name}`;
            if (data.fullName === manager) {
              managerId = data.id;
              managerName = data.fullName;
              console.log(managerId);
              console.log(managerName);
              continue;
            }
          }
        }
        console.log('Employee has been added. Please view all employee to verify...');
        db.query(
          'INSERT INTO employee SET ?',
          {
            first_name: newEmpl.first,
            last_name: newEmpl.last,
            role_id: roleId,
            manager_id: parseInt(managerId)
          },
          (err) => {
            if (err) throw err;
            prompt();
  
          }
        );
      });
    });
  };

  function remove(input) {
    const promptQ = 
    {
      yes: "yes",
      no: "no I don't (view all employees on the main option)"
    };
    inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "Please enter the correct corresponding ID. View all employees to get the employee ID. Do you know the employee ID?",
        choices: [promptQ.yes, promptQ.no]
      }
    ]).then(answer => {
      if (input === 'delete' && answer.action === "yes") removeEmployee();
      else if (input === 'role' && answer.action === "yes") updateRole();
      else viewAllEmployees();
  
  
  
    });
  };
  
  async function removeEmployee() {
  
    const answer = await inquirer.prompt([
      {
        name: "first",
        type: "input",
        message: "Enter the employee ID you want to remove:  "
      }
    ]);
  
    connection.query('DELETE FROM employee WHERE ?',
      {
        id: answer.first
      },
      function (err) {
        if (err) throw err;
      }
    )
    console.log('Employee has been removed on the system!');
    prompt();
  
  };
  
  function askId() {
    return ([
      {
        name: "name",
        type: "input",
        message: "What is the employe ID?:  "
      }
    ]);
  }  

  async function updateRole() {
    const employeeId = await inquirer.prompt(askId());
  
    db.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: 'What is the new employee role?: '
        }
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      db.query(`UPDATE employee 
        SET role_id = ${roleId}
        WHERE employee.id = ${employeeId.name}`, async (err) => {
        if (err) throw err;
        console.log('Role has been updated..')
        prompt();
      });
    });
  }
  function getName() {
    return ([
      {
        name: "first",
        type: "input",
        message: "Enter the first name: "
      },
      {
        name: "last",
        type: "input",
        message: "Enter the last name: "
      }
    ]);
  }
  
  prompt()