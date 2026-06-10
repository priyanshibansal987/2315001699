# Assessment Workspace

This repository contains implementations for the React & Express assessment tasks, organized cleanly into folders numbered 1 to 6. All backend APIs are designed to work seamlessly with **Postman**. A pre-configured Postman Collection file (`postman_collection.json`) is included in the root folder.

## Project Structure & Ports

| Folder | Task Description | Backend Port | Frontend Port | Main Technologies / Skills |
| :--- | :--- | :--- | :--- | :--- |
| **[Question 1](./Question%201)** | User CRUD API & Directory UI | `5001` | `3001` | Express, Axios, `useEffect`, `useState` |
| **[Question 2](./Question%202)** | Product Inventory API & Todo App UI | `5002` | `3002` | Express (validation), React state |
| **[Question 3](./Question%203)** | Auth API & Search Filter UI | `5003` | `3003` | Express (regex verification), `filter()` |
| **[Question 4](./Question%204)** | Form Validation UI (Controlled) | N/A | `3004` | Controlled Components, input validation |
| **[Question 5](./Question%205)** | Student Management System (Full Stack)| `5005` | `3005` | Full CRUD, Express, Axios integration |
| **[Question 6](./Question%206)** | Employee Management System (Full Stack)| `5006` | `3006` | Full CRUD, fields: Name, Email, Dept, Salary |

---

## Getting Started

### 1. Backend Server Setup
To run any backend server, navigate to the specific question's `backend` directory, install dependencies, and start the node app:
```bash
cd "Question 1/backend"
npm install
npm start
```
*(Repeat the same process for Question 2, 3, 5, or 6 backends on their respective ports).*

### 2. Frontend Server Setup
To run any React frontend client, navigate to the specific question's `frontend` directory, install dependencies, and start the Vite development server:
```bash
cd "Question 1/frontend"
npm install
npm run dev
```
*(Repeat for other questions. Note: all frontends have their node_modules symlinked to save disk space, but running `npm install` works natively too).*

---

## Postman API Testing

1. Launch **Postman**.
2. Click **Import** in the top left.
3. Select and import the [postman_collection.json](./postman_collection.json) file located at the root of this workspace.
4. You will see a folder structure for **Question 1, 2, 3, 5, and 6** containing all required endpoints. Ensure the relevant backend server is running before executing requests.