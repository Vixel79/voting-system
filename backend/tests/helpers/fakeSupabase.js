const { randomUUID } = require('crypto');

/**
 * A minimal in-memory stand-in for the Supabase JS client, covering just
 * enough of the chainable query builder surface that voteService,
 * resultsService, and adminController use. This lets integration and
 * concurrency tests exercise real request/response/validation logic and
 * real race-condition handling (via a simulated UNIQUE constraint)
 * without a live network connection or a real Supabase project.
 *
 * It is NOT a full Postgres emulator — it only implements the exact
 * operations this codebase performs.
 */
function createFakeSupabase() {
  const db = {
    candidates: [],
    voting_configuration: [
      {
        id: 1,
        state: 'open',
        first_place_points: 3,
        second_place_points: 2,
        third_place_points: 1,
        audience_weight: 0.4,
        judges_weight: 0.6,
        finalized_at: null,
        revealed_at: null,
      },
    ],
    voting_identities: [],
    votes: [],
    audit_logs: [],
    results_snapshot: [],
  };

  function matchesFilters(row, filters) {
    return filters.every(([col, val]) => row[col] === val);
  }

  function table(name) {
    let filters = [];
    let selectCols = null;
    let pendingOp = null;
    let pendingPayload = null;
    let orderCol = null;
    let orderAsc = true;
    let limitN = null;
    let countMode = null;

    const builder = {
      select(cols, opts) {
        selectCols = cols;
        if (opts && opts.count) countMode = opts.count;
        return builder;
      },
      eq(col, val) {
        filters.push([col, val]);
        return builder;
      },
      order(col, opts) {
        orderCol = col;
        orderAsc = !(opts && opts.ascending === false);
        return builder;
      },
      limit(n) {
        limitN = n;
        return builder;
      },
      insert(payload) {
        pendingOp = 'insert';
        pendingPayload = payload;
        return builder;
      },
      update(payload) {
        pendingOp = 'update';
        pendingPayload = payload;
        return builder;
      },
      async maybeSingle() {
        const result = await execute();
        if (result.error) return result;
        return { data: result.data[0] || null, error: null };
      },
      async single() {
        const result = await execute();
        if (result.error) return result;
        return { data: result.data[0] || null, error: null };
      },
      then(resolve, reject) {
        // allow `await builder` without an explicit terminal call (used for plain selects)
        return execute().then(resolve, reject);
      },
    };

    async function execute() {
      const rows = db[name];

      if (pendingOp === 'insert') {
        const toInsert = Array.isArray(pendingPayload) ? pendingPayload : [pendingPayload];
        const inserted = [];
        for (const raw of toInsert) {
          const row = { id: raw.id || randomUUID(), created_at: new Date().toISOString(), ...raw };

          // Simulate the UNIQUE constraint that matters for this system:
          // one vote per device_token. There is no per-judge uniqueness —
          // judges have no individual identity, only voter_type + device_token.
          if (name === 'votes') {
            if (rows.some((r) => r.device_token === row.device_token)) {
              return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
            }
          }
          if (name === 'voting_identities') {
            if (rows.some((r) => r.device_token === row.device_token)) {
              return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
            }
          }

          rows.push(row);
          inserted.push(row);
        }
        return { data: inserted, error: null, count: inserted.length };
      }

      if (pendingOp === 'update') {
        const matched = rows.filter((r) => matchesFilters(r, filters));
        matched.forEach((r) => Object.assign(r, pendingPayload));
        return { data: matched, error: null };
      }

      // select
      let result = rows.filter((r) => matchesFilters(r, filters));
      if (orderCol) {
        result = [...result].sort((a, b) => {
          const dir = orderAsc ? 1 : -1;
          return a[orderCol] > b[orderCol] ? dir : a[orderCol] < b[orderCol] ? -dir : 0;
        });
      }
      if (limitN != null) result = result.slice(0, limitN);
      if (countMode) return { data: result, error: null, count: result.length };
      return { data: result, error: null };
    }

    return builder;
  }

  return {
    _db: db,
    from: (name) => table(name),
    channel: () => ({
      subscribe: async () => {},
      send: async () => {},
    }),
  };
}

module.exports = { createFakeSupabase };
