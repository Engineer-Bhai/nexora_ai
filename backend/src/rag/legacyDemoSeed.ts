/**
 * Legacy Demo Seed — SDLC Modernization RAG Document
 *
 * This module seeds the Knowledge Hub with a fictional legacy application
 * architecture document for demonstration purposes.
 * It contains NO real credentials, NO proprietary information.
 *
 * Called once at server startup in development or via POST /api/knowledge/seed-demo
 */

import { IngestionService } from '../rag/ingestion';
import { Document } from '../models/Document';
import { Types } from 'mongoose';

export const DEMO_LEGACY_ARCHITECTURE_DOCUMENT = `
# RetailCore Enterprise Platform — Legacy Architecture Document
## Version 3.2 | Last Updated: 2019 | Status: LEGACY / EOL CANDIDATE

---

## 1. Executive Summary

RetailCore is a monolithic Java EE web application that has been in production since 2011.
It currently powers order management, inventory, user accounts, payment processing, and reporting
for a mid-size retail chain with 2,400 retail locations and approximately 185,000 daily transactions.

The system was built on Spring Framework 4.x and deployed on on-premise JBoss EAP 6 servers.
It has grown to 480,000 lines of Java code across 1,847 source files with no major architectural
refactoring since 2015. The codebase has been maintained by a rotating team of 6-8 engineers.

---

## 2. Current Architecture Overview

Architecture Pattern: Monolithic Layered Architecture (MVC)

Layers:
- Presentation Layer: JSP pages + jQuery 2.x front-end (legacy)
- Controller Layer: Spring MVC Controllers (400+ controllers)
- Service Layer: Spring Service beans (partially bypassed by controllers)
- Repository Layer: Hibernate 4 ORM + direct JDBC for reporting
- Database Layer: MySQL 5.7 (single primary, 2 read replicas)

Deployment:
- 3x JBoss EAP 6 application server nodes (on-premise, VMware)
- Single shared MySQL 5.7 database primary
- HAProxy load balancer
- No container orchestration
- Manual deployment process (~4 hour deployment window required)

---

## 3. Technology Stack (Current — Legacy)

| Component         | Technology          | Version | Status      |
|-------------------|---------------------|---------|-------------|
| Language          | Java                | 8       | EOL Warning |
| Framework         | Spring Framework    | 4.3.x   | EOL (2020)  |
| ORM               | Hibernate           | 4.3.x   | EOL         |
| Application Server| JBoss EAP           | 6.4     | EOL         |
| Frontend          | jQuery / JSP        | 2.1.4   | EOL         |
| Database          | MySQL               | 5.7     | EOL (2023)  |
| Build Tool        | Maven               | 3.3     | Current     |
| CI/CD             | Jenkins (manual)    | 1.x     | Legacy      |
| Monitoring        | Nagios + manual logs| -       | Insufficient|

Security Notes:
- 14 unpatched CVEs in direct dependencies (3 rated CRITICAL)
- Spring Security 3.x — multiple known authentication bypass patterns
- No static analysis tooling in CI pipeline
- Plaintext logging of PII data in order service

---

## 4. Module Structure

### 4.1 OrderService (CRITICAL — God Class)
File: com.retailcore.service.OrderService (6,247 lines)

Responsibilities (all in one class):
- Order creation and validation
- Payment processing initiation and status polling
- Inventory reservation and release
- Email and SMS notification dispatch
- PDF invoice generation
- Loyalty points calculation
- Fraud detection heuristics
- Reporting and analytics event emission

Direct class dependencies: 47
Cyclomatic complexity average: 38 (target: < 10)
Unit test coverage: 12%

Known issues:
- Race condition in inventory reservation under high concurrency
- Payment status polling uses blocking Thread.sleep() — blocks web threads
- All-or-nothing transaction includes external payment API call

### 4.2 UserService + UserController (Tight Coupling)
File: com.retailcore.service.UserService / com.retailcore.web.UserController

Issues:
- UserController directly accesses UserRepository (bypasses service layer)
- Session management uses HttpSession — horizontal scaling requires sticky sessions
- Password hashing uses MD5 (deprecated)
- No refresh token support — all tokens expire in 24 hours causing user churn

### 4.3 InventoryService (Read-Heavy, Scaling Issue)
File: com.retailcore.service.InventoryService

Issues:
- Synchronous DB writes on every page view for analytics tracking
- No caching layer — full DB query on every product catalog request
- Report generation (500+ line SQL queries) runs on primary DB instance
- Stock level updates use row-level locks causing deadlocks at peak (>5,000 concurrent)

### 4.4 ReportingModule (Performance Bottleneck)
File: com.retailcore.reporting.*

Issues:
- Shared mutable state (static Map) across HTTP request threads
- Blocking synchronous report generation in web request lifecycle (30-90 second timeouts)
- No async job queue — users wait in HTTP session for report completion
- Report data computed from production DB — impacts OLTP performance

### 4.5 NotificationService (Embedded — Should Be Async)
File: com.retailcore.service.NotificationService (embedded in OrderService)

Issues:
- Email/SMS dispatch is synchronous — blocks order completion if SMTP fails
- SMTP credentials hardcoded in properties file (not secrets management)
- No retry on notification failure
- No idempotency — duplicate notifications observed in production

---

## 5. Database Schema (Relevant Tables)

Primary DB: retailcore_prod (MySQL 5.7, 380GB total)

Key Tables:
- orders (124M rows) — no partitioning, full table scan for monthly reports
- order_items (890M rows)
- users (2.1M rows) — includes PII without field-level encryption
- inventory (8,400 SKUs) — row-level locking on updates
- payments (122M rows) — mixed payment gateway data in single table
- notifications_log (500M rows) — no archival strategy, slowing joins

Known DB issues:
- 7 tables without primary key indexes
- orders.created_at column not indexed (used in every report query)
- No read/write splitting implemented in application layer
- Backup process locks DB for 45 minutes nightly

---

## 6. Identified Service Boundary Candidates

Based on domain analysis and coupling patterns, the following decomposition candidates have been identified:

1. Payment Service
   - Bounded context: All payment initiation, status, refund, and reconciliation
   - Current location: OrderService + PaymentController
   - External dependency: PaymentGateway API (Stripe, Braintree)
   - PCI-DSS scope reduction benefit: HIGH
   - Estimated effort: 18 developer-days

2. Notification Service
   - Bounded context: Email, SMS, push notification dispatch and retry
   - Current location: Embedded in OrderService
   - Key requirement: Async event-driven; idempotency key support
   - Estimated effort: 8 developer-days

3. User & Identity Service
   - Bounded context: Registration, authentication, session, profile management
   - Current location: UserService + UserController + AuthFilter
   - Target: OAuth 2.0 / OIDC compliant IdP
   - Estimated effort: 22 developer-days

4. Inventory & Catalog Service
   - Bounded context: Stock management, product catalog, SKU pricing
   - Current location: InventoryService + ProductController
   - CQRS opportunity: Write model (stock updates) separated from read model (catalog browse)
   - Estimated effort: 14 developer-days

5. Order Service (Core — Phase 3)
   - Bounded context: Order lifecycle only (create, fulfill, cancel)
   - Requires: Payment, Notification, Inventory services extracted first
   - Decompose into: Order + Fulfillment + Pricing sub-services
   - Saga pattern required for distributed transaction
   - Estimated effort: 45 developer-days (largest extraction)

---

## 7. Non-Functional Requirements for Target Architecture

Performance Targets (Current → Target):
- Order creation p99 latency: 450ms → ≤ 120ms
- Catalog browse p99 latency: 280ms → ≤ 80ms
- Peak concurrent users: 500 → ≥ 5,000
- Deployment window: 4 hours → < 5 minutes (zero-downtime)

Availability Targets:
- Current SLA: 99.2% (planned downtime excluded)
- Target SLA: 99.95% (zero-downtime deployments)

Security Targets:
- All critical CVEs remediated before Phase 1 cutover
- PCI-DSS v4.0 compliance for payment isolation
- Field-level encryption for PII (GDPR / CCPA readiness)
- Secrets management via Vault (no hardcoded credentials)

---

## 8. Recommended Target Stack

| Component         | Target Technology       | Notes                          |
|-------------------|-------------------------|--------------------------------|
| Language          | Java 21 / Kotlin        | Virtual threads, modern APIs   |
| Framework         | Spring Boot 3.x         | Actuator, native image support |
| Frontend          | React 18 + TypeScript   | Component-driven SPA           |
| Container         | Docker + Kubernetes     | GKE / EKS                      |
| Service Mesh      | Istio                   | mTLS, circuit breakers         |
| Event Streaming   | Apache Kafka            | Order/payment/inventory events |
| API Gateway       | Kong                    | Rate limiting, auth plugins    |
| Databases         | PostgreSQL 16 (primary) | Per-service DB isolation       |
| Cache             | Redis 7                 | Session, catalog, stock cache  |
| CI/CD             | GitHub Actions + ArgoCD | GitOps deployment model        |
| Secrets           | HashiCorp Vault         | Dynamic secrets, rotation      |
| Observability     | Prometheus + Grafana + Jaeger | Full stack observability  |
| Contract Testing  | Pact Broker             | Consumer-driven contracts      |

---

## 9. Migration Approach Recommendation

Pattern: Strangler Fig Application (Martin Fowler, 2004)

Rationale:
- Zero-downtime requirement eliminates Big Bang rewrite
- Existing system must remain operational throughout migration
- Each extraction can be independently deployed and traffic-shifted
- Risk can be managed through feature flags and shadow mode testing

High-level Timeline:
- Phase 1 (Weeks 1-8): Extract Payment Service + Notification Service
- Phase 2 (Weeks 9-18): Extract Identity Service + Inventory Service
- Phase 3 (Weeks 19-30): Decompose OrderService + Decommission Monolith

---

## 10. Risk Register

| Risk                               | Likelihood | Impact | Mitigation                              |
|------------------------------------|------------|--------|-----------------------------------------|
| Data consistency during dual-write | High       | High   | Feature flags + shadow mode validation  |
| Team capacity (migration + support)| Medium     | High   | Dedicated migration squad (4 engineers) |
| Increased operational complexity   | High       | Medium | Service mesh + runbooks before decommit |
| Rollback complexity in Phase 3     | Medium     | High   | Compensating transactions (Saga pattern)|
| Performance regression post-extract| Low        | High   | Contract perf tests at every milestone  |

---

*This document is a fictional architecture scenario created for demonstration purposes only.*
*It contains no real credentials, no proprietary data, and no real system information.*
`;

/**
 * Seeds the fictional legacy architecture document for a given demo user.
 * Safe to call multiple times — checks for existing document first.
 */
export async function seedLegacyDemoDocument(userId: string | Types.ObjectId): Promise<void> {
  const uId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  // Check if already seeded for this user
  const existing = await Document.findOne({
    userId: uId,
    filename: 'RetailCore_Legacy_Architecture_v3.2.txt',
  });

  if (existing) {
    console.log(`[Demo Seed] Legacy architecture document already indexed for user ${uId}`);
    return;
  }

  try {
    await IngestionService.ingestDocument({
      userId: uId,
      filename: 'RetailCore_Legacy_Architecture_v3.2.txt',
      originalName: 'RetailCore Enterprise Platform — Legacy Architecture Document v3.2',
      mimeType: 'text/plain',
      content: DEMO_LEGACY_ARCHITECTURE_DOCUMENT,
      category: 'other',
      maxChunkSize: 600,
      chunkOverlap: 100,
    });
    console.log(`[Demo Seed] ✅ Legacy architecture document indexed for user ${uId}`);
  } catch (err: any) {
    console.warn(`[Demo Seed] Failed to seed legacy demo document: ${err.message}`);
  }
}
