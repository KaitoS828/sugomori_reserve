import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { originFromHeaders } from "../booking-guide-server";

const headers = (h: Record<string, string>) => ({ get: (name: string) => h[name] ?? null });
const PUBLIC = "https://reserve.sugomori-hokkaido.jp";

describe("originFromHeaders", () => {
  it("Vercelのデプロイ個別URLで呼ばれても、本番ドメインを返す", () => {
    const h = headers({ host: "sugomori-reserve-abc123-kaitos828s-projects.vercel.app" });
    assert.equal(originFromHeaders(h), PUBLIC);
  });

  it("プロジェクトのvercel.appで呼ばれても、本番ドメインを返す", () => {
    assert.equal(originFromHeaders(headers({ host: "sugomori-reserve.vercel.app" })), PUBLIC);
  });

  it("origin ヘッダーがvercel.appでも、本番ドメインを返す", () => {
    const h = headers({ host: "reserve.sugomori-hokkaido.jp", origin: "https://sugomori-reserve.vercel.app" });
    assert.equal(originFromHeaders(h), PUBLIC);
  });

  it("ヘッダーが無くても、本番ドメインを返す", () => {
    assert.equal(originFromHeaders(headers({})), PUBLIC);
  });

  it("ローカル開発だけは http の localhost を返す", () => {
    assert.equal(originFromHeaders(headers({ host: "localhost:3033" })), "http://localhost:3033");
  });
});
