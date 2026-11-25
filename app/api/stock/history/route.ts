import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 台股每日最高／最低價（FinMind），用來推算被舊版等比例改過的買價 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') ?? '';
  const start = searchParams.get('start') ?? '';
  const end = searchParams.get('end') ?? '';
  if (!/^[0-9A-Z]{4,6}$/.test(ticker) || !DATE.test(start) || !DATE.test(end)) {
    return NextResponse.json(
      { error: 'Invalid ticker or date' },
      { status: 400 },
    );
  }

  const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${ticker}&start_date=${start}&end_date=${end}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) throw new Error(json.msg);
    return NextResponse.json(
      json.data.map((d: { date: string; min: number; max: number }) => ({
        date: d.date,
        min: d.min,
        max: d.max,
      })),
    );
  } catch {
    return NextResponse.json({ error: 'History unavailable' }, { status: 502 });
  }
}
