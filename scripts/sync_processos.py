#!/usr/bin/env python3
"""
Script de sincronização de dados do Google Sheets para o Gestão Segura.
Lê a planilha "Acompanhamento_Processos_Atualizado 2026" e gera JSON para o frontend.
Usa a Google Sheets API v4 com token OAuth.
"""
import json
import os
import urllib.request
from datetime import datetime, date
from collections import defaultdict

# Configurações
SPREADSHEET_ID = "15AS3FlLpmRQwjRCv11dIR9pgE14c2u3XyrFPPMcaFJo"
SHEET_RANGE = "Dados!A6:X1000"
OUTPUT_FILE = "public/data/processos.json"

# Cabeçalhos da planilha (linha 6)
HEADERS = [
    "protocolo", "data_cadastro", "motivo", "tipo", "situacao_sga",
    "associado", "placa", "nome_terceiro", "placa_terceiro",
    "situacao_evento", "abertura_processo", "data_limite_autorizacao",
    "data_autorizacao_reparos", "data_entrega", "dias_reparos",
    "data_descricao", "valor_reparo", "valor_fipe", "custo_evento",
    "previsao_valor_reparo", "nome_fornecedor", "dias_aberto",
    "criticidade", "parecer_coordenacao"
]


def get_access_token():
    """Obtém o access token do Google Drive via rclone config ou variável de ambiente."""
    # Tentar via rclone config local
    try:
        import configparser
        config = configparser.ConfigParser()
        config.read(os.path.expanduser("~/.gdrive-rclone.ini"))
        token_str = config.get("manus_google_drive", "token")
        token_data = json.loads(token_str)
        return token_data["access_token"]
    except Exception:
        pass

    # Tentar via variável de ambiente (para GitHub Actions)
    token = os.environ.get("GOOGLE_ACCESS_TOKEN", "")
    if token:
        return token

    raise RuntimeError("Nenhum token de acesso disponível")


def fetch_sheet_data(access_token):
    """Busca dados da planilha via Google Sheets API v4."""
    print("=" * 60)
    print("SINCRONIZAÇÃO DE DADOS - Gestão Segura 2026")
    print("=" * 60)
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    print("Buscando dados da planilha via API...")

    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{SHEET_RANGE}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})

    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode())

    rows = data.get("values", [])
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
    """Converte as linhas da API em lista de dicionários."""
    print("Processando dados...")

    if not rows:
        return []

    # Primeira linha é o cabeçalho (linha 6 da planilha)
    header_row = rows[0]
    data_rows = rows[1:]

    processos = []
    for row in data_rows:
        # Pular linhas vazias
        if not row or not row[0].strip():
            continue

        # Pular se o protocolo é o próprio cabeçalho
        if row[0].strip().lower() == "protocolo":
            continue

        processo = {}
        for i, header in enumerate(HEADERS):
            if i < len(row):
                processo[header] = row[i].strip() if row[i] else ""
            else:
                processo[header] = ""

        # Recalcular dias_aberto
        if not processo["dias_aberto"] or processo["dias_aberto"] in ("", "#VALUE!", "#REF!"):
            calculated = calculate_dias_aberto(processo["data_cadastro"])
            processo["dias_aberto"] = str(calculated) if calculated is not None else ""

        # Recalcular criticidade
        if not processo["criticidade"] or processo["criticidade"] in ("", "#VALUE!", "#REF!"):
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
        "situacao_evento": defaultdict(int),
        "tipo": defaultdict(int),
        "motivo": defaultdict(int),
        "fornecedores": defaultdict(int),
        "processos_por_mes": defaultdict(int),
        "top_mais_antigos": [],
        "top_fornecedores": [],
        "valores": {
            "total_valor_reparo": 0,
            "total_custo_evento": 0,
            "total_previsao": 0,
        }
    }

    processos_com_dias = []

    for p in processos:
        crit = p.get("criticidade", "")
        if crit in analysis["criticidade"]:
            analysis["criticidade"][crit] += 1
        else:
            analysis["criticidade"]["Sem Classificação"] += 1

        sit_sga = p.get("situacao_sga", "").strip()
        if sit_sga:
            analysis["situacao_sga"][sit_sga] += 1

        sit_ev = p.get("situacao_evento", "").strip()
        if sit_ev:
            analysis["situacao_evento"][sit_ev] += 1

        tipo = p.get("tipo", "").strip()
        if tipo:
            analysis["tipo"][tipo] += 1

        motivo = p.get("motivo", "").strip()
        if motivo:
            analysis["motivo"][motivo] += 1

        forn = p.get("nome_fornecedor", "").strip()
        if forn:
            analysis["fornecedores"][forn] += 1

        data_cad = p.get("data_cadastro", "")
        dt = parse_date(data_cad)
        if dt:
            mes_ano = f"{dt.year}-{str(dt.month).zfill(2)}"
            analysis["processos_por_mes"][mes_ano] += 1

        # Valores financeiros
        for field, key in [("valor_reparo", "total_valor_reparo"), ("custo_evento", "total_custo_evento"), ("previsao_valor_reparo", "total_previsao")]:
            val_str = p.get(field, "").replace("R$", "").replace(".", "").replace(",", ".").strip()
            try:
                analysis["valores"][key] += float(val_str) if val_str else 0
            except (ValueError, TypeError):
                pass

        try:
            dias = int(float(p.get("dias_aberto", "")))
            processos_com_dias.append({
                "protocolo": p.get("protocolo", ""),
                "associado": p.get("associado", ""),
                "dias_aberto": dias,
                "criticidade": p.get("criticidade", ""),
                "situacao_sga": p.get("situacao_sga", ""),
            })
        except (ValueError, TypeError):
            pass

    processos_com_dias.sort(key=lambda x: x["dias_aberto"], reverse=True)
    analysis["top_mais_antigos"] = processos_com_dias[:10]

    forn_sorted = sorted(analysis["fornecedores"].items(), key=lambda x: x[1], reverse=True)
    analysis["top_fornecedores"] = [{"nome": k, "quantidade": v} for k, v in forn_sorted[:10]]

    analysis["situacao_sga"] = dict(analysis["situacao_sga"])
    analysis["situacao_evento"] = dict(analysis["situacao_evento"])
    analysis["tipo"] = dict(analysis["tipo"])
    analysis["motivo"] = dict(analysis["motivo"])
    analysis["fornecedores"] = dict(analysis["fornecedores"])
    analysis["processos_por_mes"] = dict(sorted(analysis["processos_por_mes"].items()))

    print(f"  Total: {analysis['total_processos']}")
    print(f"  Críticos: {analysis['criticidade']['Crítico']}")
    print(f"  Atenção: {analysis['criticidade']['Atenção']}")
    print(f"  Dentro do Prazo: {analysis['criticidade']['Dentro do Prazo']}")
    print(f"  Sem Classificação: {analysis['criticidade']['Sem Classificação']}")

    return analysis


def save_data(processos, analysis):
    """Salva os dados em JSON."""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    output = {
        "metadata": {
            "ultima_atualizacao": datetime.now().isoformat(),
            "total_processos": analysis["total_processos"],
            "fonte": "Google Sheets - Dados",
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
        access_token = get_access_token()
        rows = fetch_sheet_data(access_token)
        processos = process_rows(rows)
        analysis = generate_analysis(processos)
        save_data(processos, analysis)

        print()
        print("=" * 60)
        print("SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        return 0
    except Exception as e:
        print(f"\nERRO NA SINCRONIZAÇÃO: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
