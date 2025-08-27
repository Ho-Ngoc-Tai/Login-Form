import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Thiếu token' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  // Giả lập kiểm tra token
  if (token === 'mock_access_token_123' || token === 'new_mock_access_token_789') {
    return NextResponse.json({
      success: true,
      user: { name: 'Ngọc Tài', email: 'test@gmail.com' }
    });
  }

  return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 });
}
