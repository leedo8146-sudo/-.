"use client";

import { useState, useEffect } from "react";
import { BarChart3, X } from "lucide-react";

function randDoor() {
  return Math.floor(Math.random() * 3);
}

function hostReveal(carDoor, pickDoor) {
  const options = [0, 1, 2].filter((d) => d !== carDoor && d !== pickDoor);
  return options[Math.floor(Math.random() * options.length)];
}

export default function MontyHall() {
  const [stage, setStage] = useState("pick");
  const [carDoor, setCarDoor] = useState(null);
  const [pickDoor, setPickDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [finalDoor, setFinalDoor] = useState(null);
  const [lastStrategy, setLastStrategy] = useState(null);
  const [lastWin, setLastWin] = useState(null);

  const [submitState, setSubmitState] = useState("idle");
  const [showStats, setShowStats] = useState(false);
  const [community, setCommunity] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState(false);

  // 첫 진입 시 실시간 통계 불러오기
  useEffect(() => {
    loadCommunity();
  }, []);

  function choosePick(doorIdx) {
    const car = randDoor();
    const reveal = hostReveal(car, doorIdx);
    setCarDoor(car);
    setPickDoor(doorIdx);
    setRevealedDoor(reveal);
    setStage("revealed");
  }

  async function decide(strategy) {
    const final =
      strategy === "stay"
        ? pickDoor
        : [0, 1, 2].find((d) => d !== pickDoor && d !== revealedDoor);
    const win = final === carDoor;
    setFinalDoor(final);
    setLastStrategy(strategy);
    setLastWin(win);
    setStage("result");
    await submitEntry(strategy, win);
  }

  // 서버 API를 통해 진짜 DB(Vercel KV)에 저장
  async function submitEntry(strategy, win) {
    setSubmitState("saving");
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, win }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setCommunity(result.data); // 서버가 준 최신 통계로 즉시 업데이트
      setSubmitState("saved");
    } catch (e) {
      setSubmitState("error");
    }
  }

  // 서버 API를 통해 진짜 DB(Vercel KV)에서 데이터 가져오기
  async function loadCommunity() {
    setCommunityLoading(true);
    setCommunityError(false);
    try {
      const res = await fetch("/api");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCommunity(data);
    } catch (e) {
      setCommunityError(true);
    } finally {
      setCommunityLoading(false);
    }
  }

  function playAgain() {
    setStage("pick");
    setCarDoor(null);
    setPickDoor(null);
    setRevealedDoor(null);
    setFinalDoor(null);
    setLastStrategy(null);
    setLastWin(null);
    setSubmitState("idle");
  }

  const stayRate = community && community.stay.games ? (100 * community.stay.wins) / community.stay.games : 0;
  const switchRate = community && community.switch.games ? (100 * community.switch.wins) / community.switch.games : 0;
  const totalParticipants = community ? community.stay.games + community.switch.games : 0;

  const stayChoiceRate = totalParticipants ? (100 * community.stay.games) / totalParticipants : 0;
  const switchChoiceRate = totalParticipants ? (100 * community.switch.games) / totalParticipants : 0;

  return (
    <div className="min-h-screen w-full text-[#26313f] bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Black Han Sans', sans-serif; letter-spacing: 0.02em; }
        .font-body { font-family: 'Noto Sans KR', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .ticket {
          background: #ffffff;
          border: 1.5px dashed #26313f4d;
          box-shadow: 0 4px 16px #26313f14;
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise-in { animation: riseIn 0.4s ease-out; }
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-14 font-body">
        <div className="text-center mb-10 rise-in">
          <p className="tracking-[0.3em] text-[11px] text-[#a1663a] mb-3 font-mono">EXPERIMENT · 몬티 홀 실험</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-3">
            문을 바꾸시겠습니까?
          </h1>
          <p className="text-[#5b6b7a] text-sm max-w-md mx-auto leading-relaxed">
            문 3개 중 하나 뒤에 자동차가 있어요. 문을 고르면 진행자가 자동차가 없는 다른 문을 열어 보여줍니다.
            그때 문을 바꾸는 게 유리할까요? 직접 골라보고, 친구들과 함께 만든 결과를 확인해보세요.
          </p>
        </div>

        <div className="ticket rounded-xl p-8 mb-8">
          {stage === "pick" && (
            <div className="rise-in">
              <p className="text-center text-[#5b6b7a] mb-6 text-sm">문을 하나 선택하세요</p>
              <div className="flex justify-center gap-6">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => choosePick(i)}
                    className="group relative w-24 h-36 md:w-28 md:h-44 bg-gradient-to-b from-[#8b5e3c] to-[#6b4426] border-2 border-[#4a2e18] rounded-t-md flex items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <span className="font-display text-3xl text-[#f7ece0]">{i + 1}</span>
                    <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-[#f0c896]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === "revealed" && (
            <div className="rise-in text-center">
              <p className="text-[#5b6b7a] mb-1 text-sm">
                당신은 <span className="text-[#a1663a] font-semibold">{pickDoor + 1}번</span> 문을 골랐습니다.
              </p>
              <p className="text-[#5b6b7a] mb-6 text-sm">
                진행자가 <span className="text-[#a1663a] font-semibold">{revealedDoor + 1}번</span> 문을 열어 염소를 보여줬습니다.
              </p>
              <div className="flex justify-center gap-6 mb-8">
                {[0, 1, 2].map((i) => {
                  const isRevealed = i === revealedDoor;
                  const isPicked = i === pickDoor;
                  return (
                    <div
                      key={i}
                      className={`relative w-24 h-36 md:w-28 md:h-44 rounded-t-md flex items-center justify-center border-2 ${
                        isRevealed
                          ? "bg-[#eceeea] border-[#9aa5ae]"
                          : "bg-gradient-to-b from-[#8b5e3c] to-[#6b4426] border-[#4a2e18]"
                      } ${isPicked ? "ring-2 ring-[#a1663a] ring-offset-2 ring-offset-white" : ""}`}
                    >
                      {isRevealed ? (
                        <span className="text-4xl">🐐</span>
                      ) : (
                        <span className="font-display text-3xl text-[#f7ece0]">{i + 1}</span>
                      )}
                      {isPicked && (
                        <span className="absolute -bottom-6 text-[10px] text-[#a1663a] font-mono tracking-wide">내 선택</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => decide("stay")}
                  className="px-5 py-2.5 rounded-md border-2 border-[#26313f] text-[#26313f] hover:bg-[#26313f] hover:text-white transition-colors text-sm font-medium"
                >
                  {pickDoor + 1}번 유지하기
                </button>
                <button
                  onClick={() => decide("switch")}
                  className="px-5 py-2.5 rounded-md bg-[#a1663a] border-2 border-[#a1663a] hover:bg-[#8a5330] transition-colors text-sm font-medium text-white"
                >
                  다른 문으로 바꾸기
                </button>
              </div>
            </div>
          )}

          {stage === "result" && (
            <div className="rise-in text-center">
              <div className="flex justify-center gap-6 mb-6">
                {[0, 1, 2].map((i) => {
                  const isCar = i === carDoor;
                  const isFinal = i === finalDoor;
                  const isRevealedGoat = i === revealedDoor;
                  return (
                    <div
                      key={i}
                      className={`relative w-24 h-36 md:w-28 md:h-44 rounded-t-md flex items-center justify-center border-2 bg-[#eceeea] ${
                        isCar ? "border-[#a1663a]" : "border-[#9aa5ae]"
                      } ${isFinal ? "ring-2 ring-[#26313f] ring-offset-2 ring-offset-white" : ""}`}
                    >
                      <span className="text-4xl">{isCar ? "🚗" : "🐐"}</span>
                      {isFinal && (
                        <span className="absolute -bottom-6 text-[10px] text-[#26313f] font-mono tracking-wide">최종 선택</span>
                      )}
                      {isRevealedGoat && !isFinal && (
                        <span className="absolute -bottom-6 text-[10px] text-[#9aa5ae] font-mono tracking-wide">공개됨</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className={`font-display text-2xl font-bold mb-1 mt-8 ${lastWin ? "text-[#a1663a]" : "text-[#5b6b7a]"}`}>
                {lastWin ? "당첨! 🎉" : "꽝"}
              </p>
              <p className="text-[#5b6b7a] text-sm mb-1">
                전략: {lastStrategy === "stay" ? "유지 (Stay)" : "교체 (Switch)"}
              </p>
              <p className="text-[10px] font-mono text-[#9aa5ae] mb-2">
                {submitState === "saving" && "결과 저장 중..."}
                {submitState === "saved" && "결과가 공동 통계에 반영되었습니다"}
                {submitState === "error" && "결과 저장에 실패했어요 (통계에 반영 안 됨)"}
              </p>
              <div className="mt-4">
                <button
                  onClick={playAgain}
                  className="px-6 py-2.5 rounded-md bg-[#26313f] text-white font-semibold text-sm hover:bg-[#374a5e] transition-colors mr-3"
                >
                  다시 플레이
                </button>
                <button
                  onClick={() => setShowStats(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border-2 border-[#a1663a] text-[#a1663a] font-semibold text-sm hover:bg-[#a1663a] hover:text-white transition-colors"
                >
                  <BarChart3 size={16} />
                  통계 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {showStats && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#26313f]/40 px-4"
            onClick={() => setShowStats(false)}
          >
            <div
              className="ticket rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto rise-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#a1663a]" />
                  친구들의 실험 결과
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={loadCommunity} className="text-[10px] font-mono text-[#a1663a] hover:underline">
                    새로고침
                  </button>
                  <button onClick={() => setShowStats(false)} className="text-[#5b6b7a] hover:text-[#26313f]">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#9aa5ae] font-mono mb-4">
                참여자 전원의 익명 선택·결과가 함께 집계됩니다
              </p>

              {communityLoading && <p className="text-sm text-[#9aa5ae]">불러오는 중...</p>}
              {communityError && <p className="text-sm text-[#a1663a]">통계를 불러오지 못했어요. 새로고침을 눌러보세요.</p>}

              {!communityLoading && !communityError && community && totalParticipants === 0 && (
                <p className="text-sm text-[#9aa5ae]">아직 참여한 친구가 없습니다. 첫 번째로 결과를 남겨보세요.</p>
              )}

              {!communityLoading && !communityError && community && totalParticipants > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                    <div className="text-center border border-[#26313f]/15 rounded-md py-3">
                      <p className="font-mono text-xs text-[#5b6b7a] mb-1">유지 승률</p>
                      <p className="font-mono text-2xl font-semibold text-[#26313f]">{stayRate.toFixed(1)}%</p>
                      <p className="text-[#5b6b7a] text-[11px] mt-1">
                        {community.stay.wins}/{community.stay.games} 회 성공
                      </p>
                    </div>
                    <div className="text-center border border-[#a1663a]/30 rounded-md py-3">
                      <p className="font-mono text-xs text-[#5b6b7a] mb-1">교체 승률</p>
                      <p className="font-mono text-2xl font-semibold text-[#a1663a]">{switchRate.toFixed(1)}%</p>
                      <p className="text-[#5b6b7a] text-[11px] mt-1">
                        {community.switch.wins}/{community.switch.games} 회 성공
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-4 rounded-full bg-[#eceeea] overflow-hidden flex mb-2">
                    <div className="h-full bg-[#26313f]" style={{ width: `${stayChoiceRate}%` }} />
                    <div className="h-full bg-[#a1663a]" style={{ width: `${switchChoiceRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9aa5ae] font-mono mb-6">
                    <span>유지 선택 ({stayChoiceRate.toFixed(0)}%)</span>
                    <span>교체 선택 ({switchChoiceRate.toFixed(0)}%)</span>
                  </div>

                  <div className="border-t border-dashed border-[#26313f]/20 pt-5">
                    <p className="font-mono text-[11px] tracking-wide text-[#a1663a] mb-2">결론</p>
                    <p className="text-sm text-[#26313f] leading-relaxed">
                      이론적으로 처음 고른 문에 자동차가 있을 확률은 1/3, 다른 문에 있을 확률은 2/3입니다.
                      진행자가 항상 염소가 있는 문을 알고서 열어주기 때문에, 문을 바꾸면 승률이 약{" "}
                      <span className="font-mono font-semibold">66.7%</span>, 유지하면 약{" "}
                      <span className="font-mono font-semibold">33.3%</span>로 수렴합니다.
                      {totalParticipants >= 10 ? (
                        <>
                          {" "}
                          지금까지 {totalParticipants}명의 결과도{" "}
                          {switchRate > stayRate ? "교체가 유리하다는 것을" : "이론값과는 다소 차이가 있다는 것을"} 보여주고 있어요.
                        </>
                      ) : (
                        <> 아직 참여자가 적어 실제 비율이 이론값과 다를 수 있어요 — 더 많은 친구가 참여할수록 이론값에 가까워집니다.</>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
