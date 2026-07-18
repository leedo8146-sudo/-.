import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// 브라우저가 예전 에러를 기억(캐시)하지 못하도록 방지하는 설정
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 키 이름을 시스템이 가장 잘 인식하는 대시(-) 형태로 변경
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
