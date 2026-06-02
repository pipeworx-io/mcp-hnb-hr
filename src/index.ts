interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Croatian National Bank (Hrvatska narodna banka, HNB) exchange-rate MCP. Keyless.
 *
 * Croatia is in the eurozone, so HNB quotes every foreign currency AGAINST THE EURO (EUR).
 * A rate of 1.1649 for USD means 1 EUR = 1.1649 USD (units of foreign currency per 1 EUR).
 *
 * Each row: { broj_tecajnice (exchange-list number), datum_primjene (apply date, YYYY-MM-DD),
 * drzava (country, Croatian), drzava_iso (country ISO-3), sifra_valute (numeric currency code),
 * valuta (3-letter ISO currency code, e.g. "USD"), kupovni_tecaj (buying rate),
 * srednji_tecaj (middle/reference rate), prodajni_tecaj (selling rate) }.
 *
 * QUIRK: numeric rate fields are returned as STRINGS with a COMMA decimal separator
 * (e.g. "1,164900"), HNB's Croatian locale convention — parse accordingly, don't assume a dot.
 *
 * QUIRK: the API only applies a date RANGE (datum-primjene-od/do) when `valuta` is NOT also
 * passed. Combining valuta + a range makes HNB silently ignore the range and return only the
 * current applicable date. So currency_rate fetches the range across ALL currencies and filters
 * to the requested ISO code client-side.
 */


const BASE = 'https://api.hnb.hr/tecajn-eur/v3';
const UA = 'pipeworx-mcp-hnb-hr/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'exchange_rates',
    description:
      'HNB (Croatian National Bank) official exchange rates for ALL foreign currencies on a given date. ' +
      'Croatia is in the eurozone, so every rate is quoted AGAINST THE EURO (units of foreign currency per 1 EUR). ' +
      'Returns rows with valuta (3-letter ISO code), srednji_tecaj (middle/reference rate), ' +
      'kupovni_tecaj (buying), prodajni_tecaj (selling), datum_primjene (apply date). ' +
      'Omit date for the latest applicable rates. Rate values are strings with a COMMA decimal separator (e.g. "1,164900").',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Applicable date, YYYY-MM-DD, e.g. "2026-05-15". Omit for the latest applicable date.',
        },
      },
    },
  },
  {
    name: 'currency_rate',
    description:
      'HNB exchange rate for ONE foreign currency vs EUR (Croatia is in the eurozone). ' +
      'Pass the 3-letter ISO currency code (e.g. "USD", "GBP", "CHF"). ' +
      'Three modes: omit dates for the latest rate; pass `date` for a single historical date; ' +
      'pass `start_date`+`end_date` for a daily time series over that window. ' +
      'srednji_tecaj is the middle/reference rate. Rate values are strings with a COMMA decimal separator (e.g. "1,164900"). Dates are YYYY-MM-DD.',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: '3-letter ISO currency code, e.g. "USD", "GBP", "CHF".' },
        date: { type: 'string', description: 'Single historical date, YYYY-MM-DD. Ignored if start_date is given.' },
        start_date: { type: 'string', description: 'Time-series window start, YYYY-MM-DD.' },
        end_date: { type: 'string', description: 'Time-series window end, YYYY-MM-DD. Required when start_date is given.' },
      },
      required: ['currency'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'exchange_rates': {
      const date = optStr(args, 'date');
      const params = new URLSearchParams();
      if (date) params.set('datum-primjene', date);
      return hnbGet(params);
    }
    case 'currency_rate': {
      const currency = reqStr(args, 'currency', '"USD"').trim().toUpperCase();
      const start = optStr(args, 'start_date');
      if (start) {
        // Range mode: HNB ignores the range when valuta is also passed, so fetch all
        // currencies over the window and filter to the requested ISO code client-side.
        const end = optStr(args, 'end_date');
        if (!end) throw new Error('Required argument "end_date" is missing. Pass a YYYY-MM-DD date alongside start_date.');
        const params = new URLSearchParams({ 'datum-primjene-od': start, 'datum-primjene-do': end });
        const all = (await hnbGet(params)) as Array<{ valuta?: string }>;
        return all.filter((r) => r.valuta?.toUpperCase() === currency);
      }
      const params = new URLSearchParams({ valuta: currency });
      const date = optStr(args, 'date');
      if (date) params.set('datum-primjene', date);
      return hnbGet(params);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function hnbGet(params: URLSearchParams): Promise<unknown> {
  const qs = params.toString();
  const res = await fetch(qs ? `${BASE}?${qs}` : BASE, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`HNB: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function optStr(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
