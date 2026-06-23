# DynamoDB table for webhook event log
# PK: installation_id (String), SK: event_id (String)
# TTL: 48 hours after receipt
# DynamoDB Streams enabled for event-stream Lambda trigger

resource "aws_dynamodb_table" "webhook_events" {
  name         = "${local.resource_prefix}-webhook-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "installation_id"
  range_key    = "event_id"

  attribute {
    name = "installation_id"
    type = "S"
  }

  attribute {
    name = "event_id"
    type = "S"
  }

  attribute {
    name = "delivery_id"
    type = "S"
  }

  # GSI for dedup lookups by delivery_id
  global_secondary_index {
    name            = "delivery_id-index"
    hash_key        = "delivery_id"
    projection_type = "KEYS_ONLY"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  tags = {
    Name = "${local.resource_prefix}-webhook-events"
  }
}
