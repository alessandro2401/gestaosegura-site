import { useState, useMemo } from 'react';
import { useProcessos } from '../hooks/useProcessos';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Download,
  X,
} from 'lucide-react';

const ITEMS_PER_PAGE = 25;

export default function Dados() {
  const { data, loading, error } = useProcessos();
  const [search, setSearch] = useState('');
  const [critFilter, setCritFilter] = useState('');
  const [sgaFilter, setSgaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = [...data.processos];

    // Busca global
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.protocolo.toLowerCase().includes(s) ||
          p.associado.toLowerCase().includes(s) ||
          p.placa.toLowerCase().includes(s) ||
          p.nome_fornecedor.toLowerCase().includes(s) ||
          p.motivo.toLowerCase().includes(s) ||
          p.nome_terceiro.toLowerCase().includes(s)
      );
    }

    // Filtros
    if (critFilter) result = result.filter((p) => p.criticidade === critFilter);
    if (sgaFilter) result = result.filter((p) => p.situacao_sga === sgaFilter);
    if (tipoFilter) result = result.filter((p) => p.tipo === tipoFilter);

    // Ordenação
    if (sortField) {
      result.sort((a, b) => {
        const va = (a as unknown as Record<string, string>)[sortField] || '';
        const vb = (b as unknown as Record<string, string>)[sortField] || '';

        // Tentar ordenar como número
        const na = parseFloat(va.replace(/[^\d.-]/g, ''));
        const nb = parseFloat(vb.replace(/[^\d.-]/g, ''));
        if (!isNaN(na) && !isNaN(nb)) {
          return sortDir === 'asc' ? na - nb : nb - na;
        }

        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    return result;
  }, [data, search, critFilter, sgaFilter, tipoFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const uniqueValues = useMemo(() => {
    if (!data) return { sga: [], tipo: [] };
    const sga = [...new Set(data.processos.map((p) => p.situacao_sga).filter(Boolean))].sort();
    const tipo = [...new Set(data.processos.map((p) => p.tipo).filter(Boolean))].sort();
    return { sga, tipo };
  }, [data]);

  const clearFilters = () => {
    setSearch('');
    setCritFilter('');
    setSgaFilter('');
    setTipoFilter('');
    setPage(1);
  };

  const hasFilters = search || critFilter || sgaFilter || tipoFilter;

  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = [
      'Protocolo', 'Data Cadastro', 'Motivo', 'Tipo', 'Situação SGA',
      'Associado', 'Placa', 'Fornecedor', 'Dias Aberto', 'Criticidade',
    ];
    const rows = filteredData.map((p) => [
      p.protocolo, p.data_cadastro, p.motivo, p.tipo, p.situacao_sga,
      p.associado, p.placa, p.nome_fornecedor, p.dias_aberto, p.criticidade,
    ]);
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestao_segura_processos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      </div>
    );
  }

  const critBadge = (crit: string) => {
    const map: Record<string, string> = {
      'Crítico': 'bg-red-100 text-red-700',
      'Atenção': 'bg-amber-100 text-amber-700',
      'Dentro do Prazo': 'bg-emerald-100 text-emerald-700',
    };
    return map[crit] || 'bg-gray-100 text-gray-600';
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 text-gray-300">
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tabela de Dados</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredData.length} de {data.processos.length} processos
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filtros</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar protocolo, associado, placa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Criticidade */}
          <select
            value={critFilter}
            onChange={(e) => {
              setCritFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Todas as Criticidades</option>
            <option value="Crítico">Crítico</option>
            <option value="Atenção">Atenção</option>
            <option value="Dentro do Prazo">Dentro do Prazo</option>
          </select>

          {/* Situação SGA */}
          <select
            value={sgaFilter}
            onChange={(e) => {
              setSgaFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Todas as Situações SGA</option>
            {uniqueValues.sga.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Tipo */}
          <select
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Todos os Tipos</option>
            {uniqueValues.tipo.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="text-left py-3 px-3 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('protocolo')}
                >
                  Protocolo <SortIcon field="protocolo" />
                </th>
                <th
                  className="text-left py-3 px-3 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('data_cadastro')}
                >
                  Data <SortIcon field="data_cadastro" />
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Motivo
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Tipo
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Situação SGA
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Associado
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Placa
                </th>
                <th className="text-left py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Fornecedor
                </th>
                <th
                  className="text-right py-3 px-3 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => handleSort('dias_aberto')}
                >
                  Dias <SortIcon field="dias_aberto" />
                </th>
                <th className="text-center py-3 px-3 text-gray-600 font-semibold whitespace-nowrap">
                  Criticidade
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-xs text-gray-700">
                    {p.protocolo}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">
                    {p.data_cadastro}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-[150px] truncate">
                    {p.motivo}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{p.tipo}</td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-[150px] truncate">
                    {p.situacao_sga}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700 max-w-[150px] truncate">
                    {p.associado}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-gray-600">
                    {p.placa}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-[150px] truncate">
                    {p.nome_fornecedor}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-gray-700">
                    {p.dias_aberto}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${critBadge(
                        p.criticidade
                      )}`}
                    >
                      {p.criticidade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(page * ITEMS_PER_PAGE, filteredData.length)} de{' '}
              {filteredData.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      page === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-200 hover:bg-white text-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
