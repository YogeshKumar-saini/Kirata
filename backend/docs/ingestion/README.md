# Ingestion Service Documentation

## Overview
The Ingestion Service is the entry point for external webhooks (primarily WhatsApp Business API). It handles message reception, validation, deduplication, and persistence before passing control to the Router.

## System Design

### 1. Webhook Handlers
- **Verification (`GET`)**: Handles the "Hub Challenge" required by Meta/WhatsApp to verify webhook ownership.
- **Reception (`POST`)**: Receives the actual message payload.

### 2. Reliability & Idempotency
- **Raw Logging**: Every incoming payload is saved to the `MessageLog` table immediately.
- **Idempotency**: Before processing, it checks if `messageId` already exists in `MessageLog`.
    - If exists: Returns `200 OK` (Duplicate) and stops.
    - If new: Saves record and proceeds.
- **Async Handoff**: After logging, it awaits the result of the **Router Service** (or could push to a queue in a larger scale system).

---

## API Routes & Examples

### 1. Webhook Verification
**Description**: WhatsApp verification challenge.

**Endpoint**: `GET /api/webhook`

**Query Params**:
- `hub.mode`: "subscribe"
- `hub.verify_token`: <configured-token>
- `hub.challenge`: <random-string>

**Output**: Returns the `hub.challenge` string if token matches.

### 2. Receive Message
**Description**: Endpoint for incoming WhatsApp messages.

**Endpoint**: `POST /api/webhook`

**Input (JSON - Sample Meta Structure)**:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [{ "profile": { "name": "NAME" }, "wa_id": "PHONE_NUMBER" }],
            "messages": [
              {
                "from": "PHONE_NUMBER",
                "id": "wamid.HBgM...",
                "timestamp": "1600000000",
                "text": { "body": "Order 2kg Rice" },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Output**: `200 OK` (Always return 200 to acknowledge receipt to Meta).
