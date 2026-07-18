import "./global.css"; // Next.js가 필요로 하는 기본 스타일 레이어용

export const metadata = {
  title: "몬티 홀 실험실",
  description: "문을 바꾸는 것이 정말 유리할까요?",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
