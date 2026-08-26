# mcp-hnb-hr

Croatian National Bank (Hrvatska narodna banka, HNB) exchange-rate MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/hnb-hr/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Hnb Hr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
