import {describe, expect, test} from '@jest/globals';

import { parseTokens } from '../src/lib/tokenParser.js';

describe("parseTokens", () => {

  test("valid command without comments", () => {
    const result = parseTokens("CREATE P1 10.00 MYR M01");
    expect(result?.tokens).toEqual(["CREATE", "P1", "10.00", "MYR", "M01"]);
    expect(result?.comment).toBeUndefined();
  });

  test("inline comment AFTER third argument token is stripped", () => {
    const result = parseTokens("AUTHORIZE P1 123 MYR # retry later");
    expect(result?.tokens).toEqual(["AUTHORIZE", "P1", "123", "MYR"]);
    expect(result?.comment).toBe("retry later");
  });

  test("inline '#' before 4th token is treated as normal argument", () => {
    const result = parseTokens("CREATE # P1 10.00 MYR");
    expect(result?.tokens).toEqual(["CREATE", "#", "P1", "10.00", "MYR"]);
    expect(result?.comment).toBeUndefined();
  });

  test("line starting with '#' is malformed", () => {
    expect(() => parseTokens("# CREATE P1")).toThrow();
  });

  test("blank or whitespace-only line returns null", () => {
    expect(parseTokens("   ")).toBeNull();
  });

  test("comment-only AFTER 4 tokens keeps tokens and returns comment", () => {
    const result = parseTokens("SETTLE P99 IDK YES # settlement batch");
    expect(result?.tokens).toEqual(["SETTLE", "P99", "IDK", "YES"]);
    expect(result?.comment).toBe("settlement batch");
  });

});
