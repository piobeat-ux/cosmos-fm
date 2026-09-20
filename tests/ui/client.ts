// Test-only adapter. It can address only the disposable local fixture database.
async function request(payload: unknown) {
  const response = await fetch('/__fixture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json();
}
class Query {
  private payload: Record<string, unknown>;
  constructor(table: string) { this.payload = { table, action: 'select', columns: '*' }; }
  select(columns = '*') { this.payload.columns = columns; return this; }
  insert(value: unknown) { this.payload.action = 'insert'; this.payload.value = value; return this; }
  update(value: unknown) { this.payload.action = 'update'; this.payload.value = value; return this; }
  delete() { this.payload.action = 'delete'; return this; }
  eq(column: string, value: unknown) { this.payload.filter = { column, value }; return this; }
  order(column: string) { this.payload.order = column; return this; }
  range(from: number, to: number) { this.payload.range = [from, to]; return this; }
  single() { this.payload.single = true; return this; }
  then(resolve: (value: unknown) => unknown, reject?: (error: unknown) => unknown) { return request(this.payload).then(resolve, reject); }
}
export const supabase = {
  from: (table: string) => new Query(table),
  rpc: (name: string, args: unknown) => request({ rpc: name, args }),
  auth: { getSession: async () => ({ data: { session: null }, error: null }) },
  storage: { from: () => ({ upload: async () => ({ error: { message: 'Storage is not simulated.' } }) }) },
};
