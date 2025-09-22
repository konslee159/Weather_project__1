// MongoDB 연결 설정 파일
import mongoose from 'mongoose';

// MongoDB URI를 환경변수에서 가져옴
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
}

// 전역 변수에 연결 상태 캐싱 (개발 환경에서 핫 리로드 시 재연결 방지)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// MongoDB 연결 함수
async function connectDB() {
  // 이미 연결되어 있으면 기존 연결 반환
  if (cached.conn) {
    return cached.conn;
  }

  // 연결 Promise가 없으면 새로 생성
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB 연결 성공');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 