/**
 * Módulo de Carregamento de Dados
 * Carrega dados do arquivo JSON gerado pela sincronização automática
 */

class DataLoader {
  constructor() {
    this.data = null;
    this.metadata = null;
    this.analysis = null;
  }

  /**
   * Carrega dados do arquivo JSON
   */
  async loadData() {
    try {
      console.log('Carregando dados sincronizados...');
      
      const response = await fetch('data/processos.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      console.log('JSON parsing bem-sucedido');
      
      this.metadata = jsonData.metadata;
      this.data = jsonData.processos;
      this.analysis = jsonData.analysis;
      
      console.log(`✅ Dados carregados com sucesso!`);
      console.log(`   - Total de processos: ${this.metadata.total_processos}`);
      console.log(`   - Última atualização: ${new Date(this.metadata.ultima_atualizacao).toLocaleString('pt-BR')}`);
      
      return this.data;
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('Stack:', error.stack);
      
      // Fallback: tentar carregar diretamente da planilha
      console.log('⚠️  Tentando carregar diretamente da planilha...');
      return await this.loadFromSheets();
    }
  }

  /**
   * Fallback: carrega diretamente da planilha (método antigo)
   */
  async loadFromSheets() {
    const spreadsheetId = '1j14pUQZu_N_OjoN6Q3ZnT7gqavmvOp5IGJnWCyWyTrc';
    const sheetName = 'Controle de Prazos GS';
    
    try {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar planilha: ${response.status}`);
      }
      
      const csvText = await response.text();
      this.data = this.parseCSV(csvText);
      this.metadata = {
        ultima_atualizacao: new Date().toISOString(),
        total_processos: this.data.length,
        fonte: 'Google Sheets (fallback)'
      };
      
      console.log(`✅ Dados carregados da planilha (fallback)`);
      
      return this.data;
    } catch (error) {
      console.error('❌ Erro ao carregar da planilha:', error);
      throw error;
    }
  }

  /**
   * Parse CSV (método auxiliar para fallback)
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
   * Parse de uma linha CSV
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
   * Retorna dados brutos
   */
  getData() {
    return this.data;
  }

  /**
   * Retorna metadados
   */
  getMetadata() {
    return this.metadata;
  }

  /**
   * Retorna análise pré-calculada
   */
  getAnalysis() {
    return this.analysis;
  }

  /**
   * Retorna dados formatados para gráfico de status
   */
  getStatusChartData() {
    if (!this.analysis) return null;

    const statusDist = this.analysis.status_distribution;
    const labels = Object.keys(statusDist);
    const data = Object.values(statusDist);
    
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
   * Retorna dados formatados para gráfico temporal
   */
  getTemporalChartData() {
    if (!this.analysis) return null;

    // Ordenar meses
    const meses = Object.keys(this.analysis.processos_por_mes).sort();
    
    // Mapear para nomes de meses
    const mesesNomes = meses.map(mesAno => {
      const [ano, mes] = mesAno.split('-');
      const nomeMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(mes) - 1];
      return `${nomeMes}/${ano}`;
    });

    // Tempo médio por mês (com fallback se não existir)
    const tempoMedio = meses.map(mes => {
      if (this.analysis.tempo_medio_por_mes && this.analysis.tempo_medio_por_mes[mes]) {
        return this.analysis.tempo_medio_por_mes[mes];
      }
      return 0; // Valor padrão se não existir
    });

    // Status por mês
    const statusData = {};
    const statusTypes = Object.keys(this.analysis.status_distribution);
    
    statusTypes.forEach(status => {
      statusData[status] = meses.map(mes => {
        const mesData = (this.analysis.status_por_mes && this.analysis.status_por_mes[mes]) || {};
        const total = Object.values(mesData).reduce((sum, val) => sum + val, 0);
        const count = mesData[status] || 0;
        return total > 0 ? Math.round((count / total) * 100) : 0;
      });
    });

    return {
      meses: mesesNomes,
      tempoMedio,
      statusData,
      rawData: this.analysis
    };
  }

  /**
   * Retorna data da última atualização formatada
   */
  getLastUpdate() {
    if (!this.metadata || !this.metadata.ultima_atualizacao) {
      return 'Data não disponível';
    }
    
    const date = new Date(this.metadata.ultima_atualizacao);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Exportar para uso global
window.DataLoader = DataLoader;
