# NEAR Transaction Action Parser API

This is a standalone Express-based microservice that parses NEAR blockchain transactions and returns standardized JSON representations of key transaction actions.

The service identifies known contract methods (such as transfers, staking, DeFi interactions, etc.) and returns structured output that can be used directly in a frontend interface. If a transaction action is not recognized, the service uses the NEAR AI Agent to analyze the transaction and generate a meaningful JSON output.

This API is designed to centralize all transaction action logic, making it easier to manage, extend, and consume from a frontend. It supports known contracts like Wrap, Ref Finance, Burrow, Intents, and staking contracts, and handles both static logic and dynamic AI-based interpretation when necessary.
