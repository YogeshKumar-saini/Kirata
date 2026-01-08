# Gateway Service Documentation

## Overview
The Gateway Service handles external integrations and webhook processing for the Kirata system. It serves as the entry point for incoming data from external systems.

## System Design

### Key Components
- **Webhook Endpoint**: Single endpoint for receiving external data
- **Verification**: Security verification for webhook requests
- **Processing**: Data processing and routing to appropriate services

### Supported Integrations
- Payment gateways
- SMS/OTP providers
- Email services
- Analytics platforms
- Third-party APIs

---

## API Routes & Examples

### 1. Webhook Verification
**Description**: Verify webhook endpoint and configuration.

**Endpoint**: `GET /api/webhook`
**Headers**: `X-Kirata-Signature: <signature>`

**Query Parameters**:
- `provider`: Provider name (razorpay, twilio, etc.)
- `event`: Event type to verify

**Output (JSON)**:
```json
{
  "status": "ok",
  "provider": "razorpay",
  "supportedEvents": ["payment.captured", "payment.failed", "refund.processed"],
  "timestamp": "2026-01-08T00:47:00.000Z"
}
```

---

### 2. Webhook Handler
**Description**: Process incoming webhook events from external providers.

**Endpoint**: `POST /api/webhook`
**Headers**: `X-Kirata-Signature: <signature>`

**Input (JSON)**:
```json
{
  "provider": "razorpay",
  "event": "payment.captured",
  "timestamp": "2026-01-08T00:47:00.000Z",
  "data": {
    "paymentId": "pay_123456789",
    "orderId": "order_123456789",
    "amount": 25000,
    "currency": "INR",
    "status": "captured",
    "method": "upi",
    "email": "customer@example.com",
    "contact": "+919876543210"
  }
}
```

**Output (JSON)**:
```json
{
  "status": "processed",
  "eventId": "webhook-123456789",
  "provider": "razorpay",
  "event": "payment.captured",
  "timestamp": "2026-01-08T00:47:00.000Z"
}
```

---

## Supported Webhook Events

### Payment Gateway Events (Razorpay)
- `payment.captured`: Successful payment
- `payment.failed`: Failed payment attempt
- `refund.processed`: Refund completed
- `subscription.charged`: Recurring payment processed

### SMS Provider Events (Twilio)
- `sms.delivered`: SMS delivered successfully
- `sms.failed`: SMS delivery failed
- `sms.received`: Incoming SMS received

### Email Service Events
- `email.delivered`: Email delivered
- `email.bounced`: Email bounced
- `email.opened`: Email opened
- `email.clicked`: Email link clicked

---

## Webhook Security

### Signature Verification
All webhook requests must include a valid signature in the `X-Kirata-Signature` header.

**Signature Format**:
```
X-Kirata-Signature: t=<timestamp>,v1=<signature>
```

**Verification Process**:
1. Extract timestamp and signature from header
2. Verify timestamp is within 5-minute window
3. Recompute signature using shared secret
4. Compare with provided signature

### Rate Limiting
- 100 requests per minute per provider
- Burst protection enabled
- IP-based rate limiting

### Error Handling
- Invalid signatures: 401 Unauthorized
- Malformed requests: 400 Bad Request
- Processing errors: 500 Internal Server Error with retry logic

---

## Webhook Configuration

### Setup Instructions
```bash
# 1. Configure provider webhook URL
curl -X POST https://api.razorpay.com/v1/webhooks \
  -u "rzp_live_123456789:secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.kirata.com/api/webhook",
    "events": ["payment.captured", "payment.failed"],
    "secret": "shared_secret_123"
  }'
```

### Testing Webhooks
```bash
# Test webhook endpoint
curl -X POST https://api.kirata.com/api/webhook \
  -H "X-Kirata-Signature: t=1234567890,v1=calculated_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "razorpay",
    "event": "payment.captured",
    "data": { ... }
  }'
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid webhook signature",
  "details": {
    "provider": "razorpay",
    "timestamp": "2026-01-08T00:47:00.000Z"
  }
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid webhook payload",
  "details": {
    "missingFields": ["provider", "event"],
    "timestamp": "2026-01-08T00:47:00.000Z"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Webhook processing failed",
  "details": {
    "eventId": "webhook-123456789",
    "retryAfter": 300,
    "timestamp": "2026-01-08T00:47:00.000Z"
  }
}
```

---

## Integration Examples

### Razorpay Payment Webhook
```json
{
  "provider": "razorpay",
  "event": "payment.captured",
  "timestamp": "2026-01-08T00:47:00.000Z",
  "data": {
    "entity": "event",
    "account_id": "acc_123456789",
    "event": "payment.captured",
    "contains": ["payment"],
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_123456789",
          "entity": "payment",
          "amount": 25000,
          "currency": "INR",
          "status": "captured",
          "order_id": "order_123456789",
          "invoice_id": null,
          "international": false,
          "method": "upi",
          "amount_refunded": 0,
          "refund_status": null,
          "captured": true,
          "description": "Payment for order #123",
          "card_id": null,
          "bank": null,
          "wallet": null,
          "vpa": "customer@upi",
          "email": "customer@example.com",
          "contact": "+919876543210",
          "notes": [],
          "fee": 500,
          "tax": 90,
          "error_code": null,
          "error_description": null,
          "error_source": null,
          "error_step": null,
          "error_reason": null,
          "acquirer_data": {
            "rrn": "123456789012"
          },
          "created_at": 1641234567
        }
      }
    }
  }
}
```

### Twilio SMS Webhook
```json
{
  "provider": "twilio",
  "event": "sms.delivered",
  "timestamp": "2026-01-08T00:47:00.000Z",
  "data": {
    "MessageSid": "SM12345678901234567890123456789",
    "MessageStatus": "delivered",
    "To": "+919876543210",
    "From": "+1234567890",
    "Body": "Your OTP is 123456",
    "NumMedia": "0",
    "SmsStatus": "delivered",
    "SmsSid": "SM12345678901234567890123456789",
    "SmsMessageSid": "SM12345678901234567890123456789",
    "AccountSid": "AC12345678901234567890123456789",
    "ApiVersion": "2010-04-01"
  }
}
```

---

## Best Practices

### Webhook Processing
- **Idempotency**: Ensure webhook processing is idempotent
- **Retry Logic**: Implement exponential backoff for failed processing
- **Ordering**: Process events in chronological order
- **Validation**: Validate all incoming data before processing

### Security
- **Secrets Management**: Store webhook secrets securely
- **IP Whitelisting**: Restrict webhook sources by IP
- **Logging**: Log all webhook events for auditing
- **Monitoring**: Monitor webhook failure rates

### Performance
- **Async Processing**: Use background jobs for heavy processing
- **Batching**: Batch similar events when possible
- **Caching**: Cache provider configurations
- **Rate Limiting**: Protect against webhook floods

---

## Monitoring and Maintenance

### Health Checks
```bash
# Check webhook endpoint health
curl -X GET https://api.kirata.com/api/webhook?provider=razorpay

# Get webhook statistics
curl -X GET https://api.kirata.com/api/webhook/stats
```

### Troubleshooting
```bash
# List recent webhook events
curl -X GET https://api.kirata.com/api/webhook/events?limit=10

# Get specific event details
curl -X GET https://api.kirata.com/api/webhook/events/event-123456789
```

---

## Advanced Features

### Event Filtering
```json
{
  "provider": "razorpay",
  "event": "payment.captured",
  "filters": {
    "amount": { "min": 10000, "max": 100000 },
    "currency": "INR",
    "status": "captured"
  }
}
```

### Batch Processing
```json
{
  "provider": "razorpay",
  "event": "batch.processed",
  "batch": [
    {
      "paymentId": "pay_123456789",
      "status": "captured"
    },
    {
      "paymentId": "pay_987654321",
      "status": "failed"
    }
  ]
}
```

---

**Last Updated:** 2026-01-08
**Version:** 1.0.0
**Status:** Production Ready ✅