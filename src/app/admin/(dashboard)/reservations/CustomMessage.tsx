"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";

// テンプレートに縛られず、その予約の客へ自由文メールを送る。
export function CustomMessage({
  email,
  lastSentAt,
  sendAction,
  reservationId,
}: {
  email: string | null;
  lastSentAt: string | null;
  sendAction: (formData: FormData) => void;
  reservationId: string;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50">
      <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-800 flex items-center justify-between">
        <span>✉️ 自由文メールを送る</span>
        {lastSentAt && (
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            前回送信: {lastSentAt}
          </span>
        )}
      </summary>

      <div className="space-y-3 border-t border-gray-200 p-4">
        {email ? (
          <div className="flex flex-wrap items-center gap-3 rounded border border-gray-200 bg-white px-3 py-2">
            <form action={sendAction}>
              <input type="hidden" name="id" value={reservationId} />
              <input type="hidden" name="subject" value={subject} />
              <input type="hidden" name="body" value={body} />
              <ConfirmButton
                title="自由文メールを送信します"
                message={
                  <>
                    <p>
                      {email} 宛に「{subject || "（件名なし）"}」を送信します。お客様に直接届きます。
                    </p>
                    <p className="mt-2">送信してよろしいですか？</p>
                  </>
                }
                confirmLabel="はい、送信する"
                className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700"
              >
                送信する
              </ConfirmButton>
            </form>
            <span className="text-xs text-gray-600">宛先: {email}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">メールアドレスが未登録のため送信できません。</p>
        )}

        <div className="space-y-1">
          <label className="text-xs text-gray-500">件名</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="件名を入力"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">本文</label>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="本文を入力"
            className="w-full rounded border border-gray-300 px-3 py-2 text-xs leading-relaxed text-gray-900 font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-gray-400">※ 本文内のURLは自動的にリンクとして送信されます。</p>
        </div>
      </div>
    </details>
  );
}
