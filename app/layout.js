

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
