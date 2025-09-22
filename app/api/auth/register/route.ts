// 회원가입 API
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// JWT 시크릿 키 (실제 프로젝트에서는 환경변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // MongoDB 연결
    await connectDB();

    // 요청 body에서 데이터 추출
    const { email, password, name, id } = await request.json();

    // 입력값 검증
    if (!email || !password || !name || !id) {
      return NextResponse.json(
        { 
          success: false, 
          message: '이메일, 비밀번호, 아이디, 이름은 필수입니다.' 
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '올바른 이메일 형식이 아닙니다.' 
        },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: '비밀번호는 최소 6자 이상이어야 합니다.' 
        },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: '이미 존재하는 이메일입니다.' 
        },
        { status: 409 }
      );
    }

    // 비밀번호 암호화 (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // JWT 토큰 생성 (유효기간: 7일)
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 비밀번호를 제외한 사용자 정보 반환
    const userWithoutPassword = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: userWithoutPassword,
        token,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '회원가입 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 