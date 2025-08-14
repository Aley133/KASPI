import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, ShoppingBag, BadgeDollarSign } from "lucide-react";

const fmtKZT = (n:number) => new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(n);
const iso = (d:Date) => d.toISOString();

type Summary = { gmv:number; orders_count:number; aov:number };
type SeriesPoint = { bucket:string; gmv:number; orders_count:number };
type TopCity = { city:string|null; gmv:number; orders_count:number };

const Card: React.FC<{children:any}> = ({children}) => <div className="rounded-2xl shadow p-4 bg-white border">{children}</div>;
const CardTitle: React.FC<{children:any}> = ({children}) => <div className="text-sm text-gray-500">{children}</div>;
const CardValue: React.FC<{children:any}> = ({children}) => <div className="text-2xl font-semibold">{children}</div>;

export default function AnalyticsPage(){
  const [from, setFrom] = useState<string>(()=> iso(new Date(Date.now()-30*864e5)));
  const [to, setTo] = useState<string>(()=> iso(new Date()));
  const [gran, setGran] = useState<'day'|'month'>('day');
  const [summary, setSummary] = useState<Summary|null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [cities, setCities] = useState<TopCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const fetchAll = async()=>{
    setLoading(true); setError(null);
    try{
      const qs = (p:any)=> new URLSearchParams(p).toString();
      const [s, t, c] = await Promise.all([
        fetch(`/api/analytics/summary?${qs({date_from:from, date_to:to})}`),
        fetch(`/api/analytics/timeseries?${qs({date_from:from, date_to:to, granularity:gran, tz:'Asia/Almaty'})}`),
        fetch(`/api/analytics/top-cities?${qs({date_from:from, date_to:to, limit:10})}`)
      ]);
      if(!s.ok||!t.ok||!c.ok) throw new Error('API error');
      setSummary(await s.json());
      setSeries(await t.json());
      setCities(await c.json());
    }catch(e:any){ setError(e.message||'Ошибка'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); /* eslint-disable-next-line */ }, [from,to,gran]);

  const kpis = useMemo(()=>[
    { title:'Оборот', value: summary? fmtKZT(summary.gmv):'—', icon:<TrendingUp className="w-5 h-5"/>},
    { title:'Заказы', value: summary? summary.orders_count.toLocaleString('ru-KZ'):'—', icon:<ShoppingBag className="w-5 h-5"/>},
    { title:'Средний чек', value: summary? fmtKZT(summary.aov):'—', icon:<BadgeDollarSign className="w-5 h-5"/>},
  ], [summary]);

  return (
    <div className="p-4 md:p-6 space-y-6" style={{fontFamily:'ui-sans-serif, system-ui, -apple-system'}}>
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5"/>
          <input type="datetime-local" className="border rounded-xl px-3 py-2" value={from.slice(0,16)} onChange={e=>setFrom(new Date(e.target.value).toISOString())}/>
          <span className="text-gray-400">—</span>
          <input type="datetime-local" className="border rounded-xl px-3 py-2" value={to.slice(0,16)} onChange={e=>setTo(new Date(e.target.value).toISOString())}/>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setGran('day')} className={`px-4 py-2 rounded-xl border ${gran==='day'?'bg-gray-900 text-white':'bg-white'}`}>По дням</button>
          <button onClick={()=>setGran('month')} className={`px-4 py-2 rounded-xl border ${gran==='month'?'bg-gray-900 text-white':'bg-white'}`}>По месяцам</button>
        </div>
      </div>

      {loading && <div className="text-gray-500">Загрузка…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {kpis.map((k,i)=> (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <CardTitle>{k.title}</CardTitle>
                  {k.icon}
                </div>
                <CardValue>{k.value}</CardValue>
              </Card>
            ))}
          </div>

          <Card>
            <div className="mb-3 font-semibold">Динамика оборота</div>
            <div style={{width:'100%', height:320}}>
              <ResponsiveContainer>
                <LineChart data={series} margin={{top:8,right:16,bottom:8,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tickFormatter={(v)=> new Date(v).toLocaleDateString('ru-KZ', { month:'short', day:'2-digit'})} />
                  <YAxis tickFormatter={(v)=> (v/1000).toFixed(0)+'k'} />
                  <Tooltip formatter={(v:any, n:any)=> n==='gmv'? fmtKZT(v): v} labelFormatter={(l)=> new Date(l).toLocaleString('ru-KZ')} />
                  <Line type="monotone" dataKey="gmv" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-3 font-semibold">Топ городов</div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Город</th>
                      <th className="py-2">Оборот</th>
                      <th className="py-2">Заказы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((c,i)=> (
                      <tr key={i} className="border-t">
                        <td className="py-2">{c.city || '—'}</td>
                        <td className="py-2">{fmtKZT(c.gmv)}</td>
                        <td className="py-2">{c.orders_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{width:'100%', height:300}}>
                <ResponsiveContainer>
                  <BarChart data={cities} layout="vertical" margin={{top:8,right:16,bottom:8,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v)=> (v/1000).toFixed(0)+'k'} />
                    <YAxis dataKey="city" type="category" width={120} />
                    <Tooltip formatter={(v:any)=> fmtKZT(v)} />
                    <Bar dataKey="gmv" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
