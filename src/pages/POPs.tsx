import { useState } from 'react';
import { ExternalLink, FileText, BookOpen, GitBranch, List } from 'lucide-react';

const BASE_URL = 'https://gestaosegura.administradoramutual.com.br';

const popPages = [
  {
    title: 'Análise Completa dos POPs',
    description: 'Visão geral com gráficos e análise dos Procedimentos Operacionais Padrão',
    url: `${BASE_URL}/index.html`,
    icon: BookOpen,
  },
  {
    title: 'Lista de Processos',
    description: 'Tabela completa com 98 processos catalogados e seus detalhes',
    url: `${BASE_URL}/processos-lista.html`,
    icon: List,
  },
  {
    title: 'Dados da Planilha',
    description: 'Visualização detalhada dos dados importados da planilha de controle',
    url: `${BASE_URL}/dados-planilha.html`,
    icon: FileText,
  },
  {
    title: 'POP Integrado',
    description: 'Procedimento Operacional Padrão integrado para gestão de processos',
    url: `${BASE_URL}/pop_integrado.html`,
    icon: GitBranch,
  },
  {
    title: 'POP Novo Movimento Brasil',
    description: 'Procedimento específico para processos do Novo Movimento Brasil',
    url: `${BASE_URL}/pop-novo-movimento-brasil.html`,
    icon: FileText,
  },
  {
    title: 'Fluxo de Processos',
    description: 'Diagrama visual do fluxo completo de processos',
    url: `${BASE_URL}/fluxo_processos.html`,
    icon: GitBranch,
  },
];

export default function POPs() {
  const [activeFrame, setActiveFrame] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">POPs — Procedimentos Operacionais</h1>
        <p className="text-sm text-gray-500 mt-1">
          Documentação de procedimentos e análises do Gestão Segura
        </p>
      </div>

      {activeFrame ? (
        <div className="space-y-4">
          {/* Barra de controle */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveFrame(null)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ← Voltar
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {popPages.find((p) => p.url === activeFrame)?.title}
              </span>
            </div>
            <a
              href={activeFrame}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir em nova aba
            </a>
          </div>

          {/* Iframe */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
            <iframe
              src={activeFrame}
              className="w-full h-full border-0"
              title="POP"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popPages.map((pop) => (
            <div
              key={pop.url}
              onClick={() => setActiveFrame(pop.url)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-2.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <pop.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                    {pop.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {pop.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
