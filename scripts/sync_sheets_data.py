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
SPREADSHEET_ID = "1X0zBNRqsqUSh1roe2svI5JrkY-AeKCM941JRDKWsizw"
SHEET_NAME = "Todos processos"
OUTPUT_FILE = "data/processos.json"

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
    Converte CSV em lista de dicionários
    """
    print("📊 Processando dados...")
    
    lines = csv_data.strip().split('\n')
    reader = csv.DictReader(lines)
    
    processos = []
    for row in reader:
        # Limpar aspas extras
        cleaned_row = {k: v.strip('"') for k, v in row.items()}
        processos.append(cleaned_row)
    
    print(f"✅ {len(processos)} processos encontrados")
    return processos

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
        "tempo_medio_por_mes": defaultdict(lambda: {"total": 0, "count": 0}),
        "status_por_mes": defaultdict(lambda: defaultdict(int))
    }
    
    for processo in processos:
        # Análise de status
        status = processo.get('Status', 'Desconhecido')
        analysis["status_distribution"][status] += 1
        
        # Análise temporal
        data_sincronismo = processo.get('Data Sincronismo', '')
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
                    
                    # Tempo de processamento
                    try:
                        dias = int(processo.get('Dias de retorno', 0) or 0)
                        analysis["tempo_medio_por_mes"][mes_ano]["total"] += dias
                        analysis["tempo_medio_por_mes"][mes_ano]["count"] += 1
                    except (ValueError, TypeError):
                        pass
            except Exception as e:
                print(f"⚠️  Erro ao processar data: {data_sincronismo} - {e}")
    
    # Calcular médias
    tempo_medio_final = {}
    for mes, data in analysis["tempo_medio_por_mes"].items():
        if data["count"] > 0:
            tempo_medio_final[mes] = round(data["total"] / data["count"], 1)
        else:
            tempo_medio_final[mes] = 0
    
    analysis["tempo_medio_por_mes"] = tempo_medio_final
    
    # Converter defaultdict para dict normal
    analysis["status_distribution"] = dict(analysis["status_distribution"])
    analysis["processos_por_mes"] = dict(analysis["processos_por_mes"])
    analysis["status_por_mes"] = {k: dict(v) for k, v in analysis["status_por_mes"].items()}
    
    print(f"✅ Estatísticas geradas:")
    print(f"   - Total de processos: {analysis['total_processos']}")
    print(f"   - Status únicos: {len(analysis['status_distribution'])}")
    print(f"   - Meses com dados: {len(analysis['processos_por_mes'])}")
    
    return analysis

def save_data(processos, analysis):
    """
    Salva os dados em arquivo JSON
    """
    print(f"💾 Salvando dados em {OUTPUT_FILE}...")
    
    output = {
        "metadata": {
            "ultima_atualizacao": datetime.now().isoformat(),
            "total_processos": len(processos),
            "fonte": f"Google Sheets - {SHEET_NAME}"
        },
        "processos": processos,
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
        processos = parse_csv_data(csv_data)
        
        # Analisar dados
        analysis = analyze_data(processos)
        
        # Salvar
        save_data(processos, analysis)
        
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
        return 1

if __name__ == "__main__":
    exit(main())
