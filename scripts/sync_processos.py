#!/usr/bin/env python3
"""
Script de sincronização de dados do Google Sheets para o Gestão Segura.
Lê a planilha "Acompanhamento_Processos_Atualizado 2026" via CSV público e gera JSON para o frontend.
Não requer credenciais — a planilha deve estar compartilhada como "Qualquer pessoa com o link".
"""
import csv
import io
import json
import os
import urllib.request
from datetime import datetime, date
from collections import defaultdict

# Configurações
SPREADSHEET_ID = "15AS3FlLpmRQwjRCv11dIR9pgE14c2u3XyrFPPMcaFJo"
SHEET_NAME = "Dados"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}"
OUTPUT_FILE = "public/data/processos.json"

# Cabeçalhos esperados (mapeamento posicional)
HEADERS = [
    "protocolo", "data_cadastro", "motivo", "tipo", "situacao_sga",
    "associado", "placa", "nome_terceiro", "placa_terceiro",
    "situacao_evento", "abertura_processo", "data_limite_autorizacao",
    "data_autorizacao_reparos", "data_entrega", "dias_reparos",
    "data_descricao", "valor_reparo", "valor_fipe", "custo_evento",
    "previsao_valor_reparo", "nome_fornecedor", "dias_aberto",
    "criticidade", "parecer_coordenacao"
]


def fetch_csv_data():
    """Busca dados da planilha via CSV público."""
    print("=" * 60)
    print("SINCRONIZAÇÃO DE DADOS - Gestão Segura 2026")
    print("=" * 60)
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    print("Buscando dados da planilha via CSV público...")
    print(f"URL: {CSV_URL[:80]}...")

    req = urllib.request.Request(CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=30)
    data = resp.read().decode("utf-8")

    reader = csv.reader(io.StringIO(data))
    rows = list(reader)

    print(f"Linhas recebidas: {len(rows)}")
    return rows


def parse_date(date_str):
    """Tenta parsear uma data no formato DD/MM/YYYY."""
    if not date_str or date_str.strip() == "":
        return None
    try:
        parts = date_str.strip().split("/")
        if len(parts) == 3:
            dia, mes, ano = int(parts[0]), int(parts[1]), int(parts[2])
            if ano < 100:
                ano += 2000
            return date(ano, mes, dia)
    except (ValueError, IndexError):
        pass
    return None


def calculate_dias_aberto(data_cadastro_str):
    """Calcula dias aberto a partir da data de cadastro."""
    dt = parse_date(data_cadastro_str)
    if dt:
        delta = date.today() - dt
        return delta.days
    return None


def calculate_criticidade(dias_reparos_str, dias_aberto):
    """Calcula a criticidade com base nos dias."""
    try:
        dias_reparos = int(float(dias_reparos_str)) if dias_reparos_str and dias_reparos_str.strip() else None
    except (ValueError, TypeError):
        dias_reparos = None

    if dias_reparos is not None:
        if dias_reparos > 30:
            return "Crítico"
        elif dias_reparos > 15:
            return "Atenção"
        else:
            return "Dentro do Prazo"

    if dias_aberto is not None:
        if dias_aberto > 90:
            return "Crítico"
        elif dias_aberto > 45:
            return "Atenção"
        else:
            return "Dentro do Prazo"

    return None


def process_rows(rows):
    """Converte as linhas CSV em lista de dicionários."""
    print("Processando dados...")

    if not rows:
        return []

    # Pular a primeira linha (cabeçalho da planilha com descrição)
    data_rows = rows[1:] if len(rows) > 1 else rows

    processos = []
    for row in data_rows:
        if not row or not row[0].strip():
            continue

        # Ignorar linhas que não são dados (cabeçalhos, resumos)
        first_cell = row[0].strip()
        if first_cell.lower() in ("protocolo", "") or not any(c.isdigit() for c in first_cell):
            continue

        processo = {}
        for i, header in enumerate(HEADERS):
            processo[header] = row[i].strip() if i < len(row) and row[i] else ""

        # Calcular dias_aberto se não estiver preenchido ou tiver erro
        if not processo["dias_aberto"] or processo["dias_aberto"] in ("", "#VALUE!", "#REF!", "#N/A"):
            calculated = calculate_dias_aberto(processo["data_cadastro"])
            processo["dias_aberto"] = str(calculated) if calculated is not None else ""

        # Calcular criticidade se não estiver preenchida ou tiver erro
        if not processo["criticidade"] or processo["criticidade"] in ("", "#VALUE!", "#REF!", "#N/A"):
            dias_aberto_val = None
            try:
                dias_aberto_val = int(float(processo["dias_aberto"])) if processo["dias_aberto"] else None
            except (ValueError, TypeError):
                pass
            crit = calculate_criticidade(processo["dias_reparos"], dias_aberto_val)
            processo["criticidade"] = crit if crit else ""

        processos.append(processo)

    print(f"Total de registros processados: {len(processos)}")
    return processos


def generate_analysis(processos):
    """Gera estatísticas e análises dos dados."""
    print("Gerando estatísticas...")

    analysis = {
        "total_processos": len(processos),
        "criticidade": {"Crítico": 0, "Atenção": 0, "Dentro do Prazo": 0, "Sem Classificação": 0},
        "situacao_sga": defaultdict(int),
        "tipo": defaultdict(int),
        "fornecedores": defaultdict(int),
        "processos_por_mes": defaultdict(int),
        "top_mais_antigos": [],
        "top_fornecedores": [],
    }

    processos_com_dias = []

    for p in processos:
        crit = p.get("criticidade", "")
        if crit in analysis["criticidade"]:
            analysis["criticidade"][crit] += 1
        else:
            analysis["criticidade"]["Sem Classificação"] += 1

        sit = p.get("situacao_sga", "").strip()
        if sit:
            analysis["situacao_sga"][sit] += 1

        tipo = p.get("tipo", "").strip()
        if tipo:
            analysis["tipo"][tipo] += 1

        forn = p.get("nome_fornecedor", "").strip()
        if forn:
            analysis["fornecedores"][forn] += 1

        dt = parse_date(p.get("data_cadastro", ""))
        if dt:
            analysis["processos_por_mes"][f"{dt.year}-{str(dt.month).zfill(2)}"] += 1

        try:
            dias = int(float(p.get("dias_aberto", "")))
            processos_com_dias.append({
                "protocolo": p.get("protocolo", ""),
                "associado": p.get("associado", ""),
                "dias_aberto": dias,
                "criticidade": p.get("criticidade", ""),
            })
        except (ValueError, TypeError):
            pass

    processos_com_dias.sort(key=lambda x: x["dias_aberto"], reverse=True)
    analysis["top_mais_antigos"] = processos_com_dias[:10]

    forn_sorted = sorted(analysis["fornecedores"].items(), key=lambda x: x[1], reverse=True)
    analysis["top_fornecedores"] = [{"nome": k, "quantidade": v} for k, v in forn_sorted[:10]]

    # Converter defaultdicts para dicts
    analysis["situacao_sga"] = dict(analysis["situacao_sga"])
    analysis["tipo"] = dict(analysis["tipo"])
    analysis["fornecedores"] = dict(analysis["fornecedores"])
    analysis["processos_por_mes"] = dict(sorted(analysis["processos_por_mes"].items()))

    return analysis


def save_data(processos, analysis):
    """Salva os dados em JSON."""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    output = {
        "metadata": {
            "ultima_atualizacao": datetime.now().isoformat(),
            "total_processos": analysis["total_processos"],
            "fonte": "Google Sheets - CSV Público",
            "planilha_id": SPREADSHEET_ID,
        },
        "analysis": analysis,
        "processos": processos,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    file_size = os.path.getsize(OUTPUT_FILE)
    print(f"Dados salvos em {OUTPUT_FILE} ({file_size:,} bytes)")


def main():
    try:
        rows = fetch_csv_data()
        processos = process_rows(rows)
        analysis = generate_analysis(processos)
        save_data(processos, analysis)

        print("\n" + "=" * 60)
        print("SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
        print(f"Total de processos: {analysis['total_processos']}")
        print(f"Críticos: {analysis['criticidade']['Crítico']}")
        print(f"Atenção: {analysis['criticidade']['Atenção']}")
        print(f"Dentro do Prazo: {analysis['criticidade']['Dentro do Prazo']}")
        print("=" * 60)
        return 0
    except Exception as e:
        print(f"\nERRO NA SINCRONIZAÇÃO: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
