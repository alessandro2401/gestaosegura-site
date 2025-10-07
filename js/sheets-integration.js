/**
 * Módulo de Integração com Google Sheets
 * Carrega dados da planilha do Google Sheets e processa para uso nos gráficos
 */

class SheetsIntegration {
  constructor(spreadsheetId, sheetName = 'Todos processos') {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.data = null;
    this.lastUpdate = null;
  }

  /**
   * Carrega dados da planilha do Google Sheets
   */
  async loadData() {
    try {
      // URL para exportar a planilha como CSV
      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(this.sheetName)}`;
      
      console.log('Carregando dados da planilha...', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar planilha: ${response.status}`);
      }
      
      const csvText = await response.text();
      this.data = this.parseCSV(csvText);
      this.lastUpdate = new Date();
      
      console.log(`Dados carregados com sucesso! ${this.data.length} registros encontrados.`);
      
      return this.data;
    } catch (error) {
      console.error('Erro ao carregar dados da planilha:', error);
      throw error;
    }
  }

  /**
   * Converte CSV em array de objetos
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = this.parseCSVLine(lines[0]);
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return data;
  }

  /**
   * Parse de uma linha CSV considerando aspas
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Analisa os dados e retorna estatísticas
   */
  analyzeData() {
    if (!this.data || this.data.length === 0) {
      return null;
    }

    const analysis = {
      totalProcessos: this.data.length,
      statusDistribution: {},
      processosPorMes: {},
      tempoMedioPorMes: {},
      statusPorMes: {}
    };

    // Análise de status
    this.data.forEach(row => {
      const status = row['Status'] || 'Desconhecido';
      analysis.statusDistribution[status] = (analysis.statusDistribution[status] || 0) + 1;
    });

    // Análise temporal
    this.data.forEach(row => {
      const dataSincronismo = row['Data Sincronismo'];
      if (!dataSincronismo) return;

      // Extrair mês (formato: DD/MM/YYYY)
      const parts = dataSincronismo.split('/');
      if (parts.length !== 3) return;
      
      const mes = parseInt(parts[1]);
      const ano = parseInt(parts[2]);
      const mesAno = `${ano}-${mes.toString().padStart(2, '0')}`;
      
      // Contar processos por mês
      analysis.processosPorMes[mesAno] = (analysis.processosPorMes[mesAno] || 0) + 1;
      
      // Status por mês
      const status = row['Status'] || 'Desconhecido';
      if (!analysis.statusPorMes[mesAno]) {
        analysis.statusPorMes[mesAno] = {};
      }
      analysis.statusPorMes[mesAno][status] = (analysis.statusPorMes[mesAno][status] || 0) + 1;
      
      // Calcular tempo de processamento
      const dias = parseInt(row['Dias']) || 0;
      if (!analysis.tempoMedioPorMes[mesAno]) {
        analysis.tempoMedioPorMes[mesAno] = { total: 0, count: 0 };
      }
      analysis.tempoMedioPorMes[mesAno].total += dias;
      analysis.tempoMedioPorMes[mesAno].count += 1;
    });

    // Calcular médias
    Object.keys(analysis.tempoMedioPorMes).forEach(mes => {
      const data = analysis.tempoMedioPorMes[mes];
      analysis.tempoMedioPorMes[mes] = Math.round(data.total / data.count);
    });

    return analysis;
  }

  /**
   * Retorna dados formatados para gráfico de status
   */
  getStatusChartData() {
    const analysis = this.analyzeData();
    if (!analysis) return null;

    const labels = Object.keys(analysis.statusDistribution);
    const data = Object.values(analysis.statusDistribution);
    
    // Calcular percentuais
    const total = data.reduce((sum, val) => sum + val, 0);
    const percentages = data.map(val => Math.round((val / total) * 100));

    return {
      labels,
      data,
      percentages,
      total
    };
  }

  /**
   * Retorna dados formatados para gráfico de evolução temporal
   */
  getTemporalChartData() {
    const analysis = this.analyzeData();
    if (!analysis) return null;

    // Ordenar meses
    const meses = Object.keys(analysis.processosPorMes).sort();
    
    // Mapear para nomes de meses em português
    const mesesNomes = meses.map(mesAno => {
      const [ano, mes] = mesAno.split('-');
      const nomeMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(mes) - 1];
      return nomeMes;
    });

    // Tempo médio por mês
    const tempoMedio = meses.map(mes => analysis.tempoMedioPorMes[mes] || 0);

    // Status por mês (percentuais)
    const statusData = {};
    const statusTypes = ['Concluído', 'Em análise', 'Cancelado'];
    
    statusTypes.forEach(status => {
      statusData[status] = meses.map(mes => {
        const mesData = analysis.statusPorMes[mes] || {};
        const total = Object.values(mesData).reduce((sum, val) => sum + val, 0);
        const count = mesData[status] || 0;
        return total > 0 ? Math.round((count / total) * 100) : 0;
      });
    });

    return {
      meses: mesesNomes,
      tempoMedio,
      statusData,
      rawData: analysis
    };
  }

  /**
   * Retorna dados brutos
   */
  getData() {
    return this.data;
  }

  /**
   * Retorna última atualização
   */
  getLastUpdate() {
    return this.lastUpdate;
  }
}

// Exportar para uso global
window.SheetsIntegration = SheetsIntegration;
