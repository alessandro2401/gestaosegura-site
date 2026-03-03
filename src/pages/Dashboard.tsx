import { useProcessos } from '../hooks/useProcessos';
import KPICard from '../components/KPICard';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileStack,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const CRIT_COLORS: Record<string, string> = {
  'Crítico': '#dc2626',
  'Atenção': '#f59e0b',
  'Dentro do Prazo': '#10b981',
  'Sem Classificação': '#6b7280',
};

export default function Dashboard() {
  const { data, loading, error } = useProcessos();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Erro ao carregar dados</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { analysis, metadata } = data;

  // Dados para gráfico de criticidade (pizza)
  const critData = Object.entries(analysis.criticidade)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Dados para gráfico de situação SGA (barras)
  const sgaData = Object.entries(analysis.situacao_sga)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      quantidade: value,
    }));

  // Dados para gráfico de evolução mensal (linha)
  const mesData = Object.entries(analysis.processos_por_mes).map(([mes, qtd]) => {
    const [ano, m] = mes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return {
      mes: `${meses[parseInt(m)]}/${ano.slice(2)}`,
      quantidade: qtd,
    };
  });

  // Dados para gráfico de tipo (pizza)
  const tipoData = Object.entries(analysis.tipo)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const TIPO_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhamento de Processos — Controle de Atrasos
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          Atualizado em {formatDate(metadata.ultima_atualizacao)}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Processos"
          value={analysis.total_processos}
          icon={FileStack}
          color="blue"
          subtitle={`${metadata.fonte}`}
        />
        <KPICard
          title="Processos Críticos"
          value={analysis.criticidade['Crítico']}
          icon={AlertTriangle}
          color="red"
          subtitle={`${((analysis.criticidade['Crítico'] / analysis.total_processos) * 100).toFixed(1)}% do total`}
        />
        <KPICard
          title="Processos em Atenção"
          value={analysis.criticidade['Atenção']}
          icon={AlertCircle}
          color="yellow"
          subtitle={`${((analysis.criticidade['Atenção'] / analysis.total_processos) * 100).toFixed(1)}% do total`}
        />
        <KPICard
          title="Dentro do Prazo"
          value={analysis.criticidade['Dentro do Prazo']}
          icon={CheckCircle}
          color="green"
          subtitle={`${((analysis.criticidade['Dentro do Prazo'] / analysis.total_processos) * 100).toFixed(1)}% do total`}
        />
      </div>

      {/* Gráficos - Linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criticidade (Pizza) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Criticidade</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={critData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {critData.map((entry) => (
                  <Cell key={entry.name} fill={CRIT_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tipo de Evento (Pizza) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Tipo de Evento</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {tipoData.map((_, index) => (
                  <Cell key={index} fill={TIPO_COLORS[index % TIPO_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos - Linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal (Linha) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            Evolução Mensal de Processos
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Situação SGA (Barras) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status SGA (Top 10)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sgaData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Processos']}
                labelFormatter={(label) => {
                  const item = sgaData.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="quantidade" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabelas - Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Mais Antigos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Top 10 Processos Mais Antigos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">#</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Protocolo</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Associado</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Dias</th>
                  <th className="text-center py-2 px-2 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analysis.top_mais_antigos.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-2 font-mono text-xs">{p.protocolo.slice(0, 15)}</td>
                    <td className="py-2 px-2 text-gray-700 truncate max-w-[120px]">
                      {p.associado}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-red-600">
                      {p.dias_aberto}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.criticidade === 'Crítico'
                            ? 'bg-red-100 text-red-700'
                            : p.criticidade === 'Atenção'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.criticidade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Fornecedores */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Top 10 Fornecedores (por Processos)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">#</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Fornecedor</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Processos</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {analysis.top_fornecedores.map((f, i) => {
                  const totalForn = analysis.top_fornecedores.reduce(
                    (sum, x) => sum + x.quantidade,
                    0
                  );
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-2 text-gray-700">{f.nome}</td>
                      <td className="py-2 px-2 text-right font-semibold">{f.quantidade}</td>
                      <td className="py-2 px-2 text-right text-gray-500">
                        {((f.quantidade / totalForn) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
