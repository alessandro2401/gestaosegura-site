#!/usr/bin/env python3
"""
Script de sincronização de dados do Google Sheets
Atualiza automaticamente os dados do site Gestão Segura com informações da planilha.
"""

import csv
import json
import urllib.request
import urllib.parse
from datetime import datetime
from collections import defaultdict

# Configurações
SPREADSHEET_ID = "1j14pUQZu_N_OjoN6Q3ZnT7gqavmvOp5IGJnWCyWyTrc"
SHEET_NAME = "Todos processos"
OUTPUT_FILE = "data/processos.json"

# Colunas específicas que devem ser exibidas (nome exato na planilha)
COLUNAS_EXIBIR = [
    "IDENTIFICAÇÃO Protocolo GS",
    "Vinculo",
    "Nome Beneficiário",
    "Placa",
    "Tipo de Evento",
    "Situação Atual",
    "Data Aviso",
    "Etapa 1: Analise inicial Data Sincronismo MMB X GS",
    "Retorno Análise",
    "Dias úteis para Retorno Análise"
]

# Mapeamento para nomes limpos (sem espaços) para exibição
COLUNAS_DISPLAY = {
    "IDENTIFICAÇÃO Protocolo GS": "Protocolo GS",
    "Vinculo": "Vínculo",
    "Nome Beneficiário": "Nome",
    "Placa": "Placa",
    "Tipo de Evento": "Tipo de Evento",
    "Situação Atual": "Status",
    "Data Aviso": "Data Aviso",
    "Etapa 1: Analise inicial Data Sincronismo MMB X GS": "Data Sincronismo",
    "Retorno Análise": "Data de Retorno",
    "Dias úteis para Retorno Análise": "Dias de Retorno"
}

def fetch_sheet_data():
    """
    Busca dados da planilha do Google Sheets via export CSV
    """
    print("=" * 60)
    print("🔄 SINCRONIZAÇÃO DE DADOS - Gestão Segura")
    print("=" * 60)
    print(f"📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    print("🔍 Buscando dados da planilha...")
    
    # URL para exportar a planilha como CSV
    sheet_name_encoded = urllib.parse.quote(SHEET_NAME)
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet={sheet_name_encoded}"
    
    try:
        with urllib.request.urlopen(url) as response:
            csv_data = response.read().decode('utf-8')
        
        print(f"✅ Dados carregados com sucesso!")
        return csv_data
        
    except Exception as e:
        print(f"❌ Erro ao buscar dados: {e}")
        raise

def parse_csv_data(csv_data):
    """
    Converte CSV em lista de dicionários, filtrando apenas as colunas específicas
    """
    print("📊 Processando dados...")
    
    lines = csv_data.strip().split('\n')
    reader = csv.DictReader(lines)
    
    processos_completos = []
    processos_filtrados = []
    
    # Verificar quais colunas existem
    if reader.fieldnames:
        print(f"📋 Colunas encontradas na planilha: {len(reader.fieldnames)}")
        colunas_faltando = [col for col in COLUNAS_EXIBIR if col not in reader.fieldnames]
        if colunas_faltando:
            print(f"⚠️  Colunas não encontradas: {colunas_faltando}")
    
    for row in reader:
        # Limpar aspas extras
        cleaned_row = {k: v.strip('"') if v else '' for k, v in row.items()}
        processos_completos.append(cleaned_row)
        
        # Filtrar apenas as colunas específicas e renomear para nomes limpos
        processo_filtrado = {}
        for coluna_original in COLUNAS_EXIBIR:
            coluna_limpa = COLUNAS_DISPLAY.get(coluna_original, coluna_original)
            processo_filtrado[coluna_limpa] = cleaned_row.get(coluna_original, '')
        
        processos_filtrados.append(processo_filtrado)
    
    print(f"✅ {len(processos_filtrados)} processos encontrados")
    print(f"📋 Colunas exibidas: {len(COLUNAS_EXIBIR)}")
    for i, coluna in enumerate(COLUNAS_EXIBIR, 1):
        coluna_display = COLUNAS_DISPLAY.get(coluna, coluna)
        print(f"   {i}. {coluna_display}")
    
    return processos_completos, processos_filtrados

def analyze_data(processos):
    """
    Analisa os dados e gera estatísticas
    """
    print("📈 Gerando estatísticas...")
    
    analysis = {
        "total_processos": len(processos),
        "ultima_atualizacao": datetime.now().isoformat(),
        "status_distribution": defaultdict(int),
        "processos_por_mes": defaultdict(int),
        "status_por_mes": defaultdict(lambda: defaultdict(int))
    }
    
    for processo in processos:
        # Análise de status
        status = processo.get('Situação Atual', 'Desconhecido')
        analysis["status_distribution"][status] += 1
        
        # Análise temporal
        data_sincronismo = processo.get('Etapa 1: Analise inicial Data Sincronismo MMB X GS', '')
        if data_sincronismo:
            try:
                # Formato: DD/MM/YYYY
                parts = data_sincronismo.split('/')
                if len(parts) == 3:
                    dia, mes, ano = parts
                    mes_ano = f"{ano}-{mes.zfill(2)}"
                    
                    # Contar processos por mês
                    analysis["processos_por_mes"][mes_ano] += 1
                    
                    # Status por mês
                    analysis["status_por_mes"][mes_ano][status] += 1
            except Exception as e:
                pass
    
    # Converter defaultdict para dict normal
    analysis["status_distribution"] = dict(analysis["status_distribution"])
    analysis["processos_por_mes"] = dict(analysis["processos_por_mes"])
    analysis["status_por_mes"] = {k: dict(v) for k, v in analysis["status_por_mes"].items()}
    
    print(f"✅ Estatísticas geradas:")
    print(f"   - Total de processos: {analysis['total_processos']}")
    print(f"   - Status únicos: {len(analysis['status_distribution'])}")
    print(f"   - Meses com dados: {len(analysis['processos_por_mes'])}")
    
    return analysis

def save_data(processos_filtrados, processos_completos, analysis):
    """
    Salva os dados em arquivo JSON
    """
    print(f"💾 Salvando dados em {OUTPUT_FILE}...")
    
    # Filtrar linhas vazias (sem protocolo)
    processos_validos = [p for p in processos_filtrados if p.get('Protocolo GS', '').strip()]
    processos_completos_validos = [p for p in processos_completos if p.get('Protocolo GS', '').strip()]
    
    # Contar processos únicos por combinação Protocolo + Nome
    combinacoes_unicas = set()
    for p in processos_validos:
        protocolo = p.get('Protocolo GS', '').strip()
        nome = p.get('Nome', '').strip()
        if protocolo and nome:
            combinacoes_unicas.add((protocolo, nome))
    
    total_processos_unicos = len(combinacoes_unicas)
    
    print(f"📊 Filtro aplicado:")
    print(f"   - Registros totais: {len(processos_filtrados)}")
    print(f"   - Registros válidos (com protocolo): {len(processos_validos)}")
    print(f"   - Processos únicos (Protocolo + Nome): {total_processos_unicos}")
    
    # Usar nomes limpos para metadata
    colunas_display = [COLUNAS_DISPLAY.get(col, col) for col in COLUNAS_EXIBIR]
    
    output = {
        "metadata": {
            "ultima_atualizacao": datetime.now().isoformat(),
            "total_processos": total_processos_unicos,
            "total_registros": len(processos_validos),
            "fonte": f"Google Sheets - {SHEET_NAME}",
            "colunas_exibidas": colunas_display,
            "observacao": "Total de processos únicos considerando combinação Protocolo GS + Nome"
        },
        "processos": processos_validos,
        "processos_completos": processos_completos_validos,
        "analysis": analysis
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Dados salvos com sucesso!")

def main():
    """
    Função principal
    """
    try:
        # Buscar dados
        csv_data = fetch_sheet_data()
        
        # Processar CSV
        processos_completos, processos_filtrados = parse_csv_data(csv_data)
        
        # Analisar dados (usa dados completos para estatísticas)
        analysis = analyze_data(processos_completos)
        
        # Salvar (salva ambos: filtrados para exibição e completos para análise)
        save_data(processos_filtrados, processos_completos, analysis)
        
        print()
        print("=" * 60)
        print("✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERRO NA SINCRONIZAÇÃO: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
