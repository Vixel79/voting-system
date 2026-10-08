process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.JUDGE_ACCESS_TOKEN = 'test-judge-token';

const { createFakeSupabase } = require('../helpers/fakeSupabase');
const request = require('supertest');

const A = 'a1111111-1111-1111-1111-111111111111';
const B = 'b2222222-2222-2222-2222-222222222222';
const C = 'c3333333-3333-3333-3333-333333333333';

function ranking(first, second, third) {
  return {
    ranking: [first, second, third],
  };
}

function setup() {
  jest.resetModules();
  jest.doMock('../../src/config/supabase', () => ({ supabaseAdmin: createFakeSupabase() }));

  const supabaseModule = require('../../src/config/supabase');
  const app = require('../../src/app');

  supabaseModule.supabaseAdmin._db.candidates.push(
    { id: A, name: 'Team A', is_active: true },
    { id: B, name: 'Team B', is_active: true },
    { id: C, name: 'Team C', is_active: true }
  );

  return { app, supabaseModule };
}

describe('POST /api/votes/audience', () => {
  let app, supabaseModule;

  beforeEach(() => {
    ({ app, supabaseModule } = setup());
  });

  it('accepts a valid ranked ballot', async () => {
    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/submitted successfully/i);
  });

  it('rejects a ballot with a duplicated candidate', async () => {
    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, A, C));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only be selected once/i);
  });

  it('rejects an unknown or inactive candidate id', async () => {
    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking('ffffffff-ffff-ffff-ffff-ffffffffffff', B, C));

    expect(res.status).toBe(400);
  });

  it('rejects a second vote from the same device (cookie reused)', async () => {
    const agent = request.agent(app);

    const first = await agent
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(first.status).toBe(201);

    const second = await agent
      .post('/api/votes/audience')
      .send(ranking(B, A, C));

    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/already submitted/i);
  });

  it('rejects votes while state is upcoming', async () => {
    supabaseModule.supabaseAdmin._db.voting_configuration[0].state = 'upcoming';

    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/currently closed/i);
  });

  it('rejects votes after closed', async () => {
    supabaseModule.supabaseAdmin._db.voting_configuration[0].state = 'closed';

    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(res.status).toBe(403);
  });

  it('rejects votes after finalized', async () => {
    supabaseModule.supabaseAdmin._db.voting_configuration[0].state = 'finalized';

    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(res.status).toBe(403);
  });
});

describe('POST /api/judge-votes', () => {
  let app, supabaseModule;

  beforeEach(() => {
    ({ app, supabaseModule } = setup());
  });

  it('rejects a missing or invalid judge token', async () => {
    const res = await request(app)
      .post('/api/judge-votes')
      .send(ranking(A, B, C));

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/judge access token/i);
  });

  it('accepts a valid ranked ballot with the correct judge token', async () => {
    const res = await request(app)
      .post('/api/judge-votes')
      .send({
        ...ranking(A, B, C),
        judgeToken: 'test-judge-token',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects a second judge vote from the same device', async () => {
    const agent = request.agent(app);

    const first = await agent
      .post('/api/judge-votes')
      .send({
        ...ranking(A, B, C),
        judgeToken: 'test-judge-token',
      });

    expect(first.status).toBe(201);

    const second = await agent
      .post('/api/judge-votes')
      .send({
        ...ranking(B, A, C),
        judgeToken: 'test-judge-token',
      });

    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/already submitted/i);
  });

  it('does not accept an audience device token replayed as a judge vote', async () => {
    const agent = request.agent(app);

    const audienceVote = await agent
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(audienceVote.status).toBe(201);

    const res = await agent
      .post('/api/judge-votes')
      .send({
        ...ranking(B, A, C),
        judgeToken: 'test-judge-token',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not valid for this ballot type/i);
  });
});

describe('Admin: voting state machine + close/reveal', () => {
  let app, supabaseModule;
  const authHeader = { Authorization: 'Bearer test-admin-key' };

  beforeEach(() => {
    ({ app, supabaseModule } = setup());
    supabaseModule.supabaseAdmin._db.voting_configuration[0].state = 'upcoming';
  });

  it('rejects admin routes without the bearer token', async () => {
    const res = await request(app).get('/api/admin/voting/status');

    expect(res.status).toBe(401);
  });

  it('walks upcoming -> open -> closed -> finalized, hiding results until reveal', async () => {
    let res = await request(app)
      .post('/api/admin/voting/open')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.state).toBe('open');

    await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    res = await request(app).get('/api/results/live');

    expect(res.status).toBe(200);
    expect(res.body.revealed).toBe(false);
    expect(res.body.teams).toBeDefined();

    res = await request(app)
      .post('/api/admin/voting/close')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.state).toBe('closed');

    res = await request(app).get('/api/results/live');

    expect(res.body.revealed).toBe(false);
    expect(res.body.teams).toBeUndefined();

    res = await request(app)
      .post('/api/admin/results/reveal')
      .set(authHeader)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.revealed).toBe(true);
    expect(res.body.teams).toBeDefined();

    res = await request(app).get('/api/results/live');

    expect(res.body.revealed).toBe(true);
    expect(res.body.isFinal).toBe(true);
  });

  it('rejects invalid state transitions', async () => {
    const res = await request(app)
      .post('/api/admin/voting/close')
      .set(authHeader);

    expect(res.status).toBe(400);
  });

  it('has no pause endpoint', async () => {
    const res = await request(app)
      .post('/api/admin/voting/pause')
      .set(authHeader);

    expect(res.status).toBe(404);
  });

  it('rejects votes once closed, before reveal', async () => {
    await request(app)
      .post('/api/admin/voting/open')
      .set(authHeader);

    await request(app)
      .post('/api/admin/voting/close')
      .set(authHeader);

    const res = await request(app)
      .post('/api/votes/audience')
      .send(ranking(A, B, C));

    expect(res.status).toBe(403);
  });
});