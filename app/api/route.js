import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// 1. 현재까지의 누적 통계 가져오기 (GET)
export async function GET() {
  try {
    // Vercel KV에서 데이터 가져오기 (기본값 설정)
    const stayGames = (await kv.get("monty_stay_games")) || 0;
    const stayWins = (await kv.get("monty_stay_wins")) || 0;
    const switchGames = (await kv.get("monty_switch_games")) || 0;
    const switchWins = (await kv.get("monty_switch_wins")) || 0;

    return NextResponse.json({
      stay: { games: Number(stayGames), wins: Number(stayWins) },
      switch: { games: Number(switchGames), wins: Number(switchWins) },
    });
  } catch (error) {
    return NextResponse.json({ error: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}

// 2. 새로운 게임 결과 저장하기 (POST)
export async function POST(request) {
  try {
    const { strategy, win } = await request.json();

    if (strategy === "stay") {
      await kv.incr("monty_stay_games");
      if (win) await kv.incr("monty_stay_wins");
    } else if (strategy === "switch") {
      await kv.incr("monty_switch_games");
      if (win) await kv.incr("monty_switch_wins");
    }

    // 저장 후 최신 통계 바로 받아오기
    const stayGames = (await kv.get("monty_stay_games")) || 0;
    const stayWins = (await kv.get("monty_stay_wins")) || 0;
    const switchGames = (await kv.get("monty_switch_games")) || 0;
    const switchWins = (await kv.get("monty_switch_wins")) || 0;

    return NextResponse.json({
      success: true,
      data: {
        stay: { games: Number(stayGames), wins: Number(stayWins) },
        switch: { games: Number(switchGames), wins: Number(switchWins) },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "데이터 저장에 실패했습니다." }, { status: 500 });
  }
}
