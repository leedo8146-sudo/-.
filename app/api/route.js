import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Vercel이 준 단 한 줄짜리 통합 주소(KV_URL)를 통째로 집어넣어 연결하는 최신 방식
const kv = createClient({
  url: process.env.KV_URL,
});

export async function GET() {
  try {
    const stayGames = await kv.get("monty-stay-games");
    const stayWins = await kv.get("monty-stay-wins");
    const switchGames = await kv.get("monty-switch-games");
    const switchWins = await kv.get("monty-switch-wins");

    return NextResponse.json({
      stay: { games: Number(stayGames || 0), wins: Number(stayWins || 0) },
      switch: { games: Number(switchGames || 0), wins: Number(switchWins || 0) },
    });
  } catch (error) {
    return NextResponse.json({ error: "DB 로딩 실패" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { strategy, win } = await request.json();

    if (strategy === "stay") {
      await kv.incr("monty-stay-games");
      if (win) await kv.incr("monty-stay-wins");
    } else if (strategy === "switch") {
      await kv.incr("monty-switch-games");
      if (win) await kv.incr("monty-switch-wins");
    }

    const stayGames = await kv.get("monty-stay-games");
    const stayWins = await kv.get("monty-stay-wins");
    const switchGames = await kv.get("monty-switch-games");
    const switchWins = await kv.get("monty-switch-wins");

    return NextResponse.json({
      success: true,
      data: {
        stay: { games: Number(stayGames || 0), wins: Number(stayWins || 0) },
        switch: { games: Number(switchGames || 0), wins: Number(switchWins || 0) },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "DB 저장 실패" }, { status: 500 });
  }
}
