const { validateBallotShape } = require('../../src/validators/voteValidator');

const uuid = (n) => `11111111-1111-1111-1111-11111111111${n}`;

describe('validateBallotShape', () => {
  it('accepts a well-formed ballot', () => {
    const result = validateBallotShape({
      first: uuid(1),
      second: uuid(2),
      third: uuid(3),
      deviceToken: uuid(4),
    });
    expect(result.valid).toBe(true);
  });

  it('rejects a missing deviceToken', () => {
    const result = validateBallotShape({ first: uuid(1), second: uuid(2), third: uuid(3) });
    expect(result.valid).toBe(false);
  });

  it('rejects a duplicate candidate across ranks', () => {
    const result = validateBallotShape({
      first: uuid(1),
      second: uuid(1),
      third: uuid(3),
      deviceToken: uuid(4),
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/only be selected once/i);
  });

  it('rejects malformed candidate ids', () => {
    const result = validateBallotShape({
      first: 'not-a-uuid',
      second: uuid(2),
      third: uuid(3),
      deviceToken: uuid(4),
    });
    expect(result.valid).toBe(false);
  });

  it('rejects a completely malformed body', () => {
    expect(validateBallotShape(null).valid).toBe(false);
    expect(validateBallotShape(undefined).valid).toBe(false);
    expect(validateBallotShape('nope').valid).toBe(false);
  });
});
