import { getLecturerAnalyticsData } from '@/actions/lecturer.actions';

function toRadians(angle: number): number {
  return ((angle - 90) * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(toRadians(angle)),
    y: cy + radius * Math.sin(toRadians(angle)),
  };
}

function buildSlicePath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export default async function LecturerAnalyticsPage() {
  const data = await getLecturerAnalyticsData();

  const maxModuleQuestions = Math.max(...data.modules.map((module) => module.totalQuestions), 1);
  const maxTrendValue = Math.max(...data.participationTrend.map((point) => point.value), 1);

  const pieColors = ['#1d4ed8', '#f97316', '#16a34a', '#94a3b8', '#f59e0b'];
  const totalTagCount = data.popularTags.reduce((sum, tag) => sum + tag.count, 0);
  const pieSlices = data.popularTags.reduce<Array<{
    tag: string;
    percent: number;
    color: string;
    startAngle: number;
    endAngle: number;
    midAngle: number;
  }>>((acc, item, index) => {
    const startAngle = acc.length === 0 ? 0 : acc[acc.length - 1].endAngle;
    const sweep = totalTagCount > 0 ? (item.count / totalTagCount) * 360 : 0;
    const endAngle = startAngle + sweep;

    acc.push({
      tag: item.tag,
      percent: item.percent,
      color: pieColors[index % pieColors.length],
      startAngle,
      endAngle,
      midAngle: startAngle + sweep / 2,
    });

    return acc;
  }, []);

  const trendPoints = data.participationTrend.map((point, index) => {
    const x = 30 + index * 63;
    const y = 210 - (point.value / maxTrendValue) * 160;
    return { x, y, value: point.value, label: point.label };
  });

  const trendPolyline = trendPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-5xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="card-shell rounded-2xl p-6">
          <h2 className="mb-4 text-3xl font-semibold">Questions per Module</h2>
          {data.modules.length === 0 ? (
            <p className="text-slate-400">No module data yet.</p>
          ) : (
            <svg viewBox="0 0 430 250" className="h-[250px] w-full">
              <line x1="30" y1="20" x2="30" y2="210" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="210" x2="410" y2="210" stroke="#475569" strokeWidth="1" />

              {[0, 1, 2, 3].map((step) => {
                const y = 210 - step * 50;
                return (
                  <line
                    key={`module-grid-${step}`}
                    x1="30"
                    y1={y}
                    x2="410"
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {data.modules.map((module, index) => {
                const barWidth = 48;
                const gap = 14;
                const x = 40 + index * (barWidth + gap);
                const barHeight = Math.max((module.totalQuestions / maxModuleQuestions) * 150, 6);
                const y = 210 - barHeight;

                return (
                  <g key={module.moduleCode}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill="#1d4ed8" />
                    <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#cbd5e1" fontSize="11">
                      {module.totalQuestions}
                    </text>
                    <text x={x + barWidth / 2} y="228" textAnchor="middle" fill="#94a3b8" fontSize="11">
                      {module.moduleCode}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </article>

        <article className="card-shell rounded-2xl p-6">
          <h2 className="mb-4 text-3xl font-semibold">Student Participation Trend</h2>
          <svg viewBox="0 0 430 250" className="h-[250px] w-full">
            <line x1="30" y1="20" x2="30" y2="210" stroke="#475569" strokeWidth="1" />
            <line x1="30" y1="210" x2="410" y2="210" stroke="#475569" strokeWidth="1" />

            {[0, 1, 2, 3].map((step) => {
              const y = 210 - step * 50;
              return (
                <line
                  key={`trend-grid-${step}`}
                  x1="30"
                  y1={y}
                  x2="410"
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            <polyline fill="none" stroke="#f97316" strokeWidth="3" points={trendPolyline} />
            {trendPoints.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="4" fill="#f97316" />
                <text x={point.x} y="228" textAnchor="middle" fill="#94a3b8" fontSize="11">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </article>

        <article className="card-shell rounded-2xl p-6">
          <h2 className="mb-4 text-3xl font-semibold">Popular Tags</h2>
          {data.popularTags.length === 0 ? (
            <p className="text-slate-400">No tag data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <svg viewBox="0 0 460 280" className="h-[280px] w-full min-w-[460px]">
                {pieSlices.map((slice) => (
                  <path
                    key={slice.tag}
                    d={buildSlicePath(210, 150, 78, slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    stroke="#e2e8f0"
                    strokeWidth="1.2"
                  />
                ))}

                {pieSlices.map((slice) => {
                  const lineStart = polarToCartesian(210, 150, 80, slice.midAngle);
                  const lineEnd = polarToCartesian(210, 150, 104, slice.midAngle);
                  const textPoint = polarToCartesian(210, 150, 118, slice.midAngle);
                  const textAnchor = textPoint.x >= 210 ? 'start' : 'end';

                  return (
                    <g key={`${slice.tag}-label`}>
                      <line
                        x1={lineStart.x}
                        y1={lineStart.y}
                        x2={lineEnd.x}
                        y2={lineEnd.y}
                        stroke={slice.color}
                        strokeWidth="1.5"
                      />
                      <text
                        x={textPoint.x + (textAnchor === 'start' ? 4 : -4)}
                        y={textPoint.y + 4}
                        textAnchor={textAnchor}
                        fill={slice.color}
                        fontSize="11"
                        fontWeight="600"
                      >
                        {slice.tag} {slice.percent}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </article>

        <article className="card-shell rounded-2xl p-6">
          <h2 className="mb-4 text-3xl font-semibold">Top Contributors</h2>
          {data.topContributors.length === 0 ? (
            <p className="text-slate-400">No contributor data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topContributors.map((contributor, index) => (
                <article
                  key={contributor.name}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-slate-500">{index + 1}</span>
                    <div>
                      <p className="text-lg font-semibold text-slate-100">{contributor.name}</p>
                      <p className="text-sm text-slate-400">
                        {contributor.answers} answers • {contributor.votes} votes
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
