# Customer Support Ticketing System

An enterprise-grade customer support ticketing system designed to streamline support operations, enhance customer communication, and provide real-time updates. The system features a robust Spring Boot backend and a modern React frontend.

## Features

- **Role-Based Access Control**: Dedicated interfaces and permissions for Customers, Support Agents, and Administrators.
- **Ticket Management**: Create, assign, update, and track support tickets with priority levels and statuses.
- **Real-Time Notifications**: Instant updates using WebSockets (STOMP/SockJS) for ticket status changes and new comments.
- **Knowledge Base**: Create and manage support articles (FAQs) to help customers resolve common issues independently.
- **Audit Logging**: Comprehensive tracking of all critical system actions for security, compliance, and accountability.
- **Email Notifications**: Automated email alerts for ticket resolutions and important system updates.
- **File Uploads**: Seamlessly attach documents and images to tickets.
- **Interactive Dashboards**: Visual analytics and metrics using Recharts to track support performance.

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.5**
  - Spring Web (REST APIs)
  - Spring Data JPA (ORM)
  - Spring Validation
  - Spring WebSocket (Real-time communication)
  - Spring Mail (Email notifications)
- **MySQL Database**

### Frontend
- **React 19**
- **Vite** (Build tool)
- **React Router DOM** (Routing)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **SockJS & STOMP** (WebSocket client)
- **Vanilla CSS**

## Prerequisites

Before you begin, ensure you have the following installed:
- [Java 21](https://jdk.java.net/21/) or higher
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## Getting Started

### 1. Database Setup

1. Create a new MySQL database for the application.
2. Update the connection properties in `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

### 2. Backend Setup

Open a terminal in the root directory of the project and run the Spring Boot application using the Maven wrapper:

```bash
# On macOS/Linux
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

The backend server will start on `http://localhost:8080`.

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The React frontend will be accessible at `http://localhost:5173` (or the port specified by Vite).

## Usage

- **Registration/Login**: Register as a new user or login with existing credentials.
- **Customers**: Can create new support tickets, view their ticket history, interact via comments, and browse knowledge base articles.
- **Agents**: Can view tickets assigned to them, update ticket statuses, add comments to assist customers, and resolve issues.
- **Admins**: Have full system access. They can manage all users, assign tickets to agents, manage the knowledge base, and view system-wide analytics and audit logs on the Admin Dashboard.
