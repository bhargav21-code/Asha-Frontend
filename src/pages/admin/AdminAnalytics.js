import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { PageHeader, Spinner } from '../../components/common/UI';
import api from '../../utils/api';

const PIE_COLORS = ['#22c55e', '#facc15', '#ef4444'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/admin/village-analytics').then(r => setAnalytics(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const womenChart = (analytics?.women_by_village || []).slice(0, 8).map(v => ({
    village: v._id,
    Total: v.total,
    Pregnant: v.pregnant,
    'High Risk': v.high_risk,
  }));

  const childChart = (analytics?.children_by_village || []).slice(0, 8).map(v => ({
    village: v._id,
    Total: v.total,
    Severe: v.severe,
    Moderate: v.moderate,
  }));

  const totalChildren = (analytics?.children_by_village || []).reduce((a, v) => ({
    normal: a.normal + (v.total - v.severe - v.moderate),
    moderate: a.moderate + v.moderate,
    severe: a.severe + v.severe,
  }), { normal: 0, moderate: 0, severe: 0 });

  const pieData = [
    { name: 'Normal', value: totalChildren.normal },
    { name: 'Moderate', value: totalChildren.moderate },
    { name: 'Severe', value: totalChildren.severe },
  ].filter(d => d.value > 0);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Village-wise health distribution" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Women by village */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Women per Village</h3>
          {womenChart.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={womenChart} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
                <XAxis dataKey="village" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" fill="#93c5fd" radius={[4,4,0,0]} />
                <Bar dataKey="Pregnant" fill="#6ee7b7" radius={[4,4,0,0]} />
                <Bar dataKey="High Risk" fill="#fca5a5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Children malnutrition pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Overall Nutrition Status</h3>
          {pieData.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Children SAM/MAM by village */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Malnutrition by Village</h3>
          {childChart.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={childChart} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
                <XAxis dataKey="village" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" fill="#93c5fd" radius={[4,4,0,0]} />
                <Bar dataKey="Moderate" fill="#fde68a" radius={[4,4,0,0]} />
                <Bar dataKey="Severe" fill="#fca5a5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
