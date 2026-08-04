# mcp-hnb-hr

Croatian National Bank (Hrvatska narodna banka, HNB) exchange-rate MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `hnb_exchange_rates` | HNB (Croatian National Bank) official exchange rates for ALL foreign currencies on a given date. Croatia is in the eurozone, so every rate is quoted AGAINST THE EURO (units of foreign currency per 1 EUR). Returns rows with valuta (3-letter ISO code), srednji_tecaj (middle/reference rate), kupovni_tecaj (buying), prodajni_tecaj (selling), datum_primjene (apply date). Omit date for the latest applicable rates. Rate values are strings with a COMMA decimal separator (e.g. "1,164900"). |
| `hnb_currency_rate` | HNB exchange rate for ONE foreign currency vs EUR (Croatia is in the eurozone). Pass the 3-letter ISO currency code (e.g. "USD", "GBP", "CHF"). Three modes: omit dates for the latest rate; pass `date` for a single historical date; pass `start_date`+`end_date` for a daily time series over that window. srednji_tecaj is the middle/reference rate. Rate values are strings with a COMMA decimal separator (e.g. "1,164900"). Dates are YYYY-MM-DD. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "hnb-hr": {
      "url": "https://gateway.pipeworx.io/hnb-hr/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Hnb Hr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
