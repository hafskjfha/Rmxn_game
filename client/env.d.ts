// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WS_URI:string;
    }
  }
}

// 이 파일이 전역적으로 인식되도록 빈 export 구문을 추가합니다.
export {};
