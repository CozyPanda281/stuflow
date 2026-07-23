import { useState, useEffect } from 'react';
import db from '../db/database';
import AnimatedCounter from '../components/AnimatedCounter';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalClasses: 0, present: 0, absent: 0, late: 0, onLeave: 0,
    subjectStats: {}, taskCompletion: { total: 0, completed: 0 }, weeklyData: []
  });

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    const attendance = await db.attendance.toArray();
    const tasks = await db.tasks.toArray();

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const onLeave = attendance.filter(a => a.status === 'leave').length;
    const totalClasses = attendance.length;

    const subjectMap = {};
    attendance.forEach(a => {
      if (!subjectMap[a.subject]) subjectMap[a.subject] = { present: 0, absent: 0, late: 0, total: 0 };
      subjectMap[a.subject].total++;
      subjectMap[a.subject][a.status]++;
    });

    const taskCompleted = tasks.filter(t => t.completed).length;

    const weeklyData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayAttendance = attendance.filter(a => a.date === dateStr);
      weeklyData.push({
        date: dateStr,
        present: dayAttendance.filter(a => a.status === 'present').length,
        absent: dayAttendance.filter(a => a.status === 'absent').length,
        total: dayAttendance.length
      });
    }

    setStats({
      totalClasses, present, absent, late, onLeave,
      subjectStats: subjectMap,
      taskCompletion: { total: tasks.length, completed: taskCompleted },
      weeklyData
    });
  }

  const percentage = stats.totalClasses ? Math.round((stats.present / stats.totalClasses) * 100) : 0;
  const taskPercent = stats.taskCompletion.total ? Math.round((stats.taskCompletion.completed / stats.taskCompletion.total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Insights into your academic journey</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="card card-enter card-enter-d1">
          <div className="card-header"><span className="card-title">Attendance Overview</span></div>
          <div style={{textAlign:'center', padding:12}}>
            <div style={{fontSize:48, fontWeight:700, color: percentage >= 75 ? 'var(--green)' : percentage >= 60 ? 'var(--yellow)' : 'var(--red)'}}>
              <AnimatedCounter value={percentage} suffix="%" duration={800} />
            </div>
            <div style={{fontSize:13, color:'var(--text-secondary)'}}>Overall Attendance</div>
          </div>
          <div className="progress-bar" style={{height:8}}>
            <div className="progress-fill" style={{
              width: `${percentage}%`,
              background: percentage >= 75 ? 'var(--green)' : percentage >= 60 ? 'var(--yellow)' : 'var(--red)'
            }} />
          </div>
          <div style={{display:'flex', justifyContent:'space-around', marginTop:12, fontSize:13}}>
            <div><span style={{color:'var(--green)', fontWeight:600}}><AnimatedCounter value={stats.present} /></span> Present</div>
            <div><span style={{color:'var(--red)', fontWeight:600}}><AnimatedCounter value={stats.absent} /></span> Absent</div>
            <div><span style={{color:'var(--yellow)', fontWeight:600}}><AnimatedCounter value={stats.late} /></span> Late</div>
            <div><span style={{color:'var(--orange)', fontWeight:600}}><AnimatedCounter value={stats.onLeave} /></span> Leave</div>
          </div>
        </div>

        <div className="card card-enter card-enter-d2">
          <div className="card-header"><span className="card-title">Tasks</span></div>
          <div style={{textAlign:'center', padding:12}}>
            <div style={{fontSize:48, fontWeight:700, color: taskPercent >= 70 ? 'var(--green)' : 'var(--yellow)'}}>
              <AnimatedCounter value={taskPercent} suffix="%" duration={800} />
            </div>
            <div style={{fontSize:13, color:'var(--text-secondary)'}}>Tasks Completed</div>
          </div>
          <div className="progress-bar" style={{height:8}}>
            <div className="progress-fill" style={{
              width: `${taskPercent}%`,
              background: taskPercent >= 70 ? 'var(--green)' : 'var(--yellow)'
            }} />
          </div>
          <div style={{display:'flex', justifyContent:'space-around', marginTop:12, fontSize:13}}>
            <div><span style={{fontWeight:600}}><AnimatedCounter value={stats.taskCompletion.completed} /></span> Done</div>
            <div><span style={{fontWeight:600}}><AnimatedCounter value={stats.taskCompletion.total - stats.taskCompletion.completed} /></span> Pending</div>
            <div><span style={{fontWeight:600}}><AnimatedCounter value={stats.taskCompletion.total} /></span> Total</div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title">Subject-wise Attendance</span></div>
        {Object.keys(stats.subjectStats).length === 0 ? (
          <div style={{fontSize:13, color:'var(--text-muted)', textAlign:'center', padding:20}}>No data yet</div>
        ) : (
          <div>
            {Object.entries(stats.subjectStats).map(([subject, data]) => {
              const subPct = data.total ? Math.round((data.present / data.total) * 100) : 0;
              return (
                <div key={subject} style={{marginBottom:12}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4}}>
                    <span style={{fontWeight:500}}>{subject}</span>
                    <span style={{color: subPct >= 75 ? 'var(--green)' : 'var(--red)'}}><AnimatedCounter value={subPct} suffix="%" /></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${subPct}%`,
                      background: subPct >= 75 ? 'var(--green)' : subPct >= 60 ? 'var(--yellow)' : 'var(--red)'
                    }} />
                  </div>
                  <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>
                    {data.present} present / {data.total} total
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Last 7 Days</span></div>
        <div style={{display:'flex', alignItems:'flex-end', gap:4, height:120, padding:'8px 0'}}>
          {stats.weeklyData.map(day => {
            const maxVal = Math.max(...stats.weeklyData.map(d => d.total), 1);
            const height = day.total ? Math.max((day.total / maxVal) * 100, 20) : 10;
            return (
                <div key={day.date} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end', animation: 'fadeInUp 0.4s ease both', animationDelay: `${i * 0.06}s`}}>
                  <div style={{fontSize:10, color:'var(--text-muted)', marginBottom:2}}>{day.present}/{day.total}</div>
                  <div style={{
                    width:'100%', maxWidth:30,
                    height: `${height}%`,
                    background: day.absent > 0 ? 'var(--red)' : day.total > 0 ? 'var(--green)' : 'var(--text-muted)',
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.7,
                    minHeight: 8,
                    animation: 'barGrow 0.5s ease both',
                    animationDelay: `${i * 0.06}s`
                  }} />
                <div style={{fontSize:10, color:'var(--text-muted)', marginTop:4}}>
                  {day.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
