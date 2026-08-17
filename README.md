# Order Ops Platform - System Architecture

Based on a comprehensive scan of the `OrderProcessing` workspace, here is an in-depth summary of the technologies used and the underlying system design architecture driving the application.

## 1. Technology Stack

### **Frontend (Client Layer)**
- **Framework**: Next.js 16.3.0 (utilizing the newer Turbopack compiler)
- **Core Libraries**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (utilizing modern utility-first approaches with a highly customized "Paper White" theme)
- **Data Visualization**: Recharts (for dynamic Area, Bar, and Pie charts)
- **Mapping & Geo**: React Leaflet mapping library, communicating with external OpenStreetMap/OSRM routing engines.
- **Icons**: Lucide React

### **Backend (Service Layer)**
- **Framework**: Spring Boot 4.1.0 running on Java 21
- **Security**: Spring Security combined with JSON Web Tokens (JJWT library) for stateless, role-based authentication.
- **Persistence**: Spring Data JPA using Hibernate
- **Event Streaming**: Spring Kafka
- **Caching**: Spring Boot Data Redis
- **Geocoding Integrations**: External API calls to the Photon (Komoot) Geocoding API.

## 2. System Design Architecture

The project utilizes an **Event-Driven Microservices Architecture** mixed with a robust Monolith core, orchestrated using Docker Compose.

### **Service Breakdown**
1. **`orderProc` (Core Monolith)**:
   - This is the primary RESTful API handling the bulk of business logic: user registration, JWT issuance, product catalog management, shopping carts, and order creation.
   - It acts as the Kafka **Producer**. When critical business events occur (e.g., an order is placed or a password reset is requested), `orderProc` publishes JSON-serialized events (`OrderCreatedEvent`, `PasswordResetEvent`) to Kafka topics rather than handling them synchronously.

2. **`notification-service` (Event Consumer)**:
   - A dedicated, decoupled microservice whose sole responsibility is to listen to the Kafka message broker.
   - Upon receiving an event from `orderProc`, it uses `spring-boot-starter-mail` (configured with Gmail SMTP) to dispatch transactional emails to users asynchronously. This ensures that the main order placement thread is never blocked by slow email server responses.

### **Data & Infrastructure Tier**
The entire infrastructure is containerized and defined in `docker-compose.yml`.
- **PostgreSQL 16**: The primary relational database (`orderdb`) mapping complex entities, including managing `bytea` native structures for storing user profile pictures.
- **Apache Kafka (Kraft mode)**: The central message broker facilitating asynchronous communication between `orderProc` and `notification-service`. It is monitored locally using a Kafka-UI container.
- **Redis 7**: Configured as an in-memory data store, used to cache heavily requested data or manage temporary session-like data to reduce database load.

## 3. Key Design Patterns Implemented

- **Asynchronous Event-Driven Communication**: By decoupling order processing and email notifications via Kafka, the system achieves higher availability and horizontal scalability. If the notification service goes down, the core order process is unaffected; messages wait safely in the Kafka topic.
- **Stateless Authentication**: Using JWTs allows the backend to remain completely stateless. The frontend stores the token in `sessionStorage` and decodes the payload (e.g., the `role` claim) to conditionally render UI elements, such as hiding Revenue charts from standard users while showing them to `ADMIN` roles.
- **Responsive & Adaptive UI**: The Next.js frontend uses a heavily grid-based CSS architecture. Screens dynamically morph from mobile single-column layouts to ultra-wide 5-column spanning grids, preventing dead space on high-resolution monitors. Interactive micro-animations (loading spinners, success checks, hover scaling) are embedded tightly into the component lifecycle.
- **Dynamic Routing Fallbacks**: The system integrates fallback logic for missing geocoding data, attempting to map user addresses to coordinates, calculating distance routes via OSRM, and utilizing safe fallbacks if the external APIs time out.
