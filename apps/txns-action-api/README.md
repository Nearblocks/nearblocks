# NEAR Transaction Action Parser API

**NEAR Transaction Action Parser API** is a standalone **Express-based microservice** that processes NEAR blockchain transactions and returns structured JSON representations of known actions.

It supports common actions like **transfers**, **staking**, **function calls**, and **token actions**, by converting them into a standardized format for FE. This centralizes transaction parsing logic, making it easy to manage and extend.

For any unknown or custom actions not recognized by the static logic, the service uses the **NEAR AI Agent** as a fallback. The AI agent analyzes the transaction data and returns meaningful, structured output based on custom prompts. This hybrid approach ensures comprehensive coverage of all on-chain activity, even for emerging or contract-specific behaviors.

---

## Features

- Parses standard NEAR actions (transfer, staking, function call, etc.)
- Decodes event logs
- Resolves token metadata (name, symbol, decimals)
- Fallback parsing via NEAR AI Agent for unknown actions
- Swagger (OpenAPI) documentation
- Designed for NEAR explorers, dashboards, and developer tools

---

## API Endpoint

### `POST /v1/txnsaction/:hash`

Parses and returns structured NEAR transaction actions based on provided **raw transaction** data.

- `:hash` – Transaction hash (as route param)
- Request Body – Contains full raw transaction JSON

---

## Sample Input Structure (Body)

```json
{
  "txn": {
    "transaction": {
      "transaction_hash": "string",
      "signer_account_id": "string",
      "receiver_account_id": "string",
      "block": {
        "block_hash": "string",
        "block_height": "number",
        "block_timestamp": "string"
      },
      "actions": [
        {
          "action": "string",
          "args": {
            "method_name": "string",
            "args_json": {
              "signed": [
                {
                  "payload": {
                    "message": "string"
                  },
                  "recipient": "string",
                  "nonce": "string",
                  "signature": "string",
                  "public_key": "string",
                  "standard": "string"
                }
              ]
            },
            "deposit": "string",
            "gas": "string"
          }
        }
      ],
      "outcomes": {
        "status_key": "string",
        "result": {
          "ActionError": {
            "index": "string",
            "kind": {
              "FunctionCallError": {
                "ExecutionError": "string"
              }
            }
          }
        },
        "logs": "array|null"
      },
      "receipts": [
        {
          "receipt_id": "string",
          "outcome": {
            "executor_account_id": "string",
            "gas_burnt": "string",
            "tokens_burnt": "string",
            "logs": [],
            "status": {}
          },
          "block": {
            "block_hash": "string",
            "block_height": "number",
            "block_timestamp": "string"
          }
        }
      ],
      "outcomes_agg": {
        "gas_used": "string",
        "transaction_fee": "string"
      },
      "actions_agg": {
        "deposit": "string",
        "gas_attached": "string"
      },
      "shard_id": "string"
    }
  }
}
```

## sample response

{
"Actions": [
{
"type": "string",
"methodName": "string",
"from": {
"address": "string",
"short": "string"
},
"to": {
"address": "string",
"short": "string"
},
"receiptId": "string",
"label": "string",
"details": {
"from": {
"address": "string",
"short": "string"
},
"to": {
"address": "string",
"short": "string"
}
}
}
]
}

## License

Licensed under the Business Source License 1.1 (BUSL-1.1).
