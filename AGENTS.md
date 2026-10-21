# Architecture rules
- Share navigation sections between the desktop sidebar and mobile drawer so page links stay consistent.
- Keep county demographic statistics separate from campaign intelligence; display only sourced percentages, never inferred ethnic identity or voting preferences.- Map pins come only from the officeholders table (each row needs a source link); never generate simulated officeholders. Why: the map must show only verifiable people.
- ai-engine uses the newest enabled AI provider in api_connections (OpenAI-compatible base_url + model in extra_config), else the built-in AI gateway. Why: admins can bring their own keys without code changes.
