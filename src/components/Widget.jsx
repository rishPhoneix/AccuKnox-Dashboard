import {
  Activity, X,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmt, scale } from "../lib/data";

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 11,
    color: "var(--text)",
    boxShadow: "var(--shadow-pop)",
  },
  itemStyle: { color: "var(--text)" },
  labelStyle: { color: "var(--text-muted)" },
};
const axisTick = { fontSize: 10, fill: "var(--text-muted)" };



function Donut({ widget, factor }) {
  const segs = widget.segments.map((s) => ({
    ...s,
    value: widget.timeBased ? scale(s.value, factor) : s.value,
  }));
  const total = segs.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="donut-content">
      <div className="donut-wrap" role="img" aria-label={widget.text}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segs} dataKey="value" nameKey="label"
              innerRadius="66%" outerRadius="100%" stroke="none"
              startAngle={90} endAngle={-270} isAnimationActive={false}
            >
              {segs.map((s) => <Cell key={s.label} fill={`var(--seg-${s.color})`} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{fmt(total)}</strong>
          <small>{widget.centerLabel || "Total"}</small>
        </div>
      </div>
      <ul className="legend">
        {segs.map((s) => (
          <li key={s.label}>
            <i className="dot" style={{ background: `var(--seg-${s.color})` }} />
            <span>{s.label}</span>
            <b>{fmt(s.value)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarBody({ widget, factor }) {
  const data = widget.data.map((d) => ({
    ...d,
    value: widget.timeBased ? scale(d.value, factor) : d.value,
  }));
  return (
    <div className="chart-box" role="img" aria-label={widget.text}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 14, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="label" width={82}
            tick={axisTick} axisLine={false} tickLine={false}
          />
          <Tooltip cursor={{ fill: "var(--hover)" }} {...tooltipStyle} />
          <Bar
            dataKey="value" name="Alerts" fill="var(--seg-primary)"
            radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineBody({ widget, range }) {
  const s = widget.series[range];
  const data = s.labels.map((label, i) => ({ label, value: s.values[i] }));
  return (
    <div className="chart-box" role="img" aria-label={widget.text}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={34} />
          <Tooltip {...tooltipStyle} />
          <Line
            type="monotone" dataKey="value" name="Count" stroke="var(--seg-primary)"
            strokeWidth={2} dot={{ r: 2.5, fill: "var(--seg-primary)" }} isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Risk({ widget }) {
  const total = widget.segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="risk-content">
      <p>{widget.text}</p>
      <div className="risk-bar" role="img" aria-label={`${fmt(total)} vulnerabilities by severity`}>
        {widget.segments.map((s) => (
          <span key={s.label} style={{ flex: s.value, background: `var(--seg-${s.color})` }} title={`${s.label}: ${fmt(s.value)}`} />
        ))}
      </div>
      <ul className="risk-labels">
        {widget.segments.map((s) => (
          <li key={s.label}>
            <i className="dot" style={{ background: `var(--seg-${s.color})` }} />
            {s.label} <b>{fmt(s.value)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Table({ widget, factor }) {
  return (
    <div className="table-wrap">
      <p className="table-caption">{widget.text}</p>
      <table>
        <thead>
          <tr>{widget.columns.map((c, i) => <th key={c} className={i ? "num" : ""}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {widget.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i} className={i ? "num" : ""}>
                  {i && typeof cell === "number" ? fmt(widget.timeBased ? scale(cell, factor) : cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ widget }) {
  return (
    <div className="stat-content">
      <div className="stat-value">
        {fmt(widget.value)}<span>{widget.unit}</span>
      </div>
      {widget.progress != null && (
        <div className="progress" role="progressbar" aria-valuenow={widget.progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${widget.progress}%` }} />
        </div>
      )}
      <p>{widget.delta}</p>
    </div>
  );
}

function TextBody({ widget }) {
  return (
    <div className="empty-content">
      <div className="empty-icon"><Activity size={24} /></div>
      <p>{widget.text}</p>
    </div>
  );
}



export default function Widget({ widget, range, factor, onRemove }) {
  let body;
  switch (widget.type) {
    case "donut": body = <Donut widget={widget} factor={factor} />; break;
    case "bar": body = <BarBody widget={widget} factor={factor} />; break;
    case "line": body = <LineBody widget={widget} range={range} />; break;
    case "risk": body = <Risk widget={widget} />; break;
    case "table": body = <Table widget={widget} factor={factor} />; break;
    case "stat": body = <Stat widget={widget} />; break;
    default: body = <TextBody widget={widget} />;
  }

  return (
    <article className="widget-card" data-testid={`widget-${widget.id}`}>
      <div className="widget-header">
        <h3>{widget.name}</h3>
        <button
          className="remove-button" onClick={() => onRemove(widget)}
          aria-label={`Remove ${widget.name}`} title="Remove widget"
        >
          <X size={17} />
        </button>
      </div>
      {body}
    </article>
  );
}