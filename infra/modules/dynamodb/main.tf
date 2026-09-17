resource "aws_dynamodb_table" "user" {
  name         = "User"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "email"
      key_type       = "HASH"
    }
  }
}

resource "aws_dynamodb_table" "client" {
  name         = "Client"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "resource" {
  name         = "Resource"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "oidc_store" {
  name         = "OIDCStore"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "uid"
    type = "S"
  }

  attribute {
    name = "grantId"
    type = "S"
  }

  attribute {
    name = "userCode"
    type = "S"
  }

  attribute {
    name = "accountId"
    type = "S"
  }

  attribute {
    name = "sessionUid"
    type = "S"
  }

  global_secondary_index {
    name            = "uid-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "uid"
      key_type       = "HASH"
    }
  }

  global_secondary_index {
    name            = "grantId-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "grantId"
      key_type       = "HASH"
    }
  }

  global_secondary_index {
    name            = "userCode-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "userCode"
      key_type       = "HASH"
    }
  }

  global_secondary_index {
    name            = "accountId-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "accountId"
      key_type       = "HASH"
    }
  }

  global_secondary_index {
    name            = "sessionUid-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "sessionUid"
      key_type       = "HASH"
    }
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "otp" {
  name         = "OTP"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "userId"
      key_type       = "HASH"
    }
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "challenge" {
  name         = "Challenge"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    projection_type = "ALL"

    key_schema {
      attribute_name = "userId"
      key_type       = "HASH"
    }
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}
