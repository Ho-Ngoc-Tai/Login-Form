import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Giả lập kiểm tra thông tin đăng nhập
  if (email === 'test@gmail.com' && password === '123456') {
    return NextResponse.json({
      success: true,
      data: {
        account: { name: 'Ngọc Tài', email },
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_456'
      }
    });
  }

  return NextResponse.json({ success: false, message: 'Sai thông tin đăng nhập' }, { status: 401 });
}
