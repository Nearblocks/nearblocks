# NEAR Transaction Action Parser API

NEAR Transaction Action Parser API is a standalone Express-based microservice that processes NEAR blockchain transactions and returns structured JSON representations of known actions. It supports common actions like transfers, staking, and DeFi interactions by converting them into a standardized format for frontend display. This centralizes transaction parsing logic, making it easy to manage and extend.

For any unknown or custom actions not recognized by the static logic, the service uses the NEAR AI Agent as a fallback. The AI agent analyzes the transaction data and returns meaningful, structured output based on custom prompts. This hybrid approach ensures comprehensive coverage of all on-chain activity, even for emerging or contract-specific behaviors.
