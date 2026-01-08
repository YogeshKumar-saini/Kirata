# Router Service Documentation

## Overview
The Router Service is the intelligence layer that interprets incoming natural language messages (e.g., from WhatsApp) and routes them to the appropriate business logic (Strategies).

## System Design

### 1. Strategy Pattern
The service uses the **Strategy Design Pattern** to handle different types of user intents.
- **Interface**: All strategies implement a common interface with:
    - `canHandle(text, user)`: Boolean.
    - `execute(text, user)`: Promise<void>.
- **Execution**: The router iterates through the list of registered strategies. The first one that returns `true` for `canHandle` is executed.

### 2. User Context Identification
Before routing, the service attempts to resolve the sender's identity:
1. Check if phone number belongs to a **Shopkeeper**.
2. If not, check if it belongs to a **Customer**.
3. If neither, it may trigger a registration flow (or auto-create a customer profile depending on configuration).

### 3. Extensibility
To add a new feature (e.g., "Check Weather"):
1. Create a new class checking for "weather" keyword.
2. Implement the business logic in `execute`.
3. Add it to the `strategies` list.
4. No changes needed in the core routing logic.

---

## Internal Logic (No Public API)
This service is primarily internal, invoked by the **Ingestion Service**.

**Function**: `routeMessage(messageId, phone, text)`
1. **Log**: Routing attempt.
2. **Context**: Resolve User & Role.
3. **Loop**: Find matching Strategy.
4. **Execute**: Run strategy logic.

