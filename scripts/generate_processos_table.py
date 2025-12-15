#!/usr/bin/env python3
"""
Script para gerar tabela HTML dos 51 processos únicos
Lê o arquivo JSON sincronizado e gera um arquivo HTML com a tabela
"""

import json
from collections import OrderedDict
from datetime import datetime

def generate_processos_html():
    """
    Gera arquivo HTML com a tabela de processos
    """
    print("=" * 60)
    print("📊 GERANDO TABELA DE PROCESSOS")
    print("=" * 60)
    
    # Load the JSON file
    with open('data/processos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    processos = data['processos']
    
    # Create a dictionary to track unique processes by Protocol + Name
    processos_unicos = OrderedDict()
    
    for processo in processos:
        protocolo = processo.get('Protocolo GS', '').strip()
        nome = processo.get('Nome', '').strip()
        
        if protocolo and nome:
            chave = (protocolo, nome)
            
            if chave not in processos_unicos:
                processos_unicos[chave] = processo
            else:
                # Update if this record is newer
                data_atual = processos_unicos[chave].get('Data Sincronismo', '')
                data_nova = processo.get('Data Sincronismo', '')
                
                try:
                    if data_nova and data_atual:
                        data_atual_obj = datetime.strptime(data_atual, '%d/%m/%Y')
                        data_nova_obj = datetime.strptime(data_nova, '%d/%m/%Y')
                        if data_nova_obj > data_atual_obj:
                            processos_unicos[chave] = processo
                    elif data_nova:
                        processos_unicos[chave] = processo
                except:
                    pass
    
    # Count status distribution
    status_count = {}
    for processo in processos_unicos.values():
        status = processo.get('Status', 'Desconhecido')
        status_count[status] = status_count.get(status, 0) + 1
    
    # Sort by status count (descending)
    status_sorted = sorted(status_count.items(), key=lambda x: x[1], reverse=True)
    
    # Generate HTML
    html = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista Completa de Processos - Gestão Segura</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .metadata {
            background: #ecf0f1;
            padding: 20px 30px;
            border-bottom: 1px solid #bdc3c7;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .metadata-item {
            display: flex;
            flex-direction: column;
        }
        
        .metadata-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        
        .metadata-value {
            color: #34495e;
            font-size: 1.1em;
        }
        
        .content {
            padding: 30px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .stat-card p {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .table-wrapper {
            overflow-x: auto;
            margin-bottom: 40px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
        }
        
        thead {
            background: #34495e;
            color: white;
            position: sticky;
            top: 0;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #2c3e50;
        }
        
        td {
            padding: 12px 15px;
            border: 1px solid #ecf0f1;
        }
        
        tbody tr {
            transition: background-color 0.2s;
        }
        
        tbody tr:hover {
            background-color: #f8f9fa;
        }
        
        tbody tr:nth-child(even) {
            background-color: #f5f6fa;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            white-space: nowrap;
        }
        
        .status-aprovado {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-acordo {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .status-analise {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-negado {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-outro {
            background-color: #e2e3e5;
            color: #383d41;
        }
        
        .status-distribution {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .status-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .status-item-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .status-item-count {
            font-size: 1.5em;
            color: #667eea;
            font-weight: bold;
        }
        
        .status-item-percent {
            font-size: 0.9em;
            color: #7f8c8d;
        }
        
        .footer {
            background: #ecf0f1;
            padding: 20px 30px;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            border-top: 1px solid #bdc3c7;
        }
        
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .metadata {
                grid-template-columns: 1fr;
            }
            
            table {
                font-size: 0.85em;
            }
            
            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Lista Completa de Processos</h1>
            <p>Gestão Segura - Controle de Prazos</p>
        </div>
        
        <div class="metadata">
            <div class="metadata-item">
                <span class="metadata-label">Total de Processos</span>
                <span class="metadata-value">''' + str(len(processos_unicos)) + ''' processos únicos</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Última Sincronização</span>
                <span class="metadata-value">''' + data['metadata']['ultima_atualizacao'].split('T')[0] + '''</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Status Únicos</span>
                <span class="metadata-value">''' + str(len(status_count)) + ''' status diferentes</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Fonte</span>
                <span class="metadata-value">Google Sheets - Controle de Prazos GS</span>
            </div>
        </div>
        
        <div class="content">
            <a href="/" class="back-link">← Voltar para a página principal</a>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>''' + str(len(processos_unicos)) + '''</h3>
                    <p>Processos Únicos</p>
                </div>
                <div class="stat-card">
                    <h3>''' + str(len(status_count)) + '''</h3>
                    <p>Status Diferentes</p>
                </div>
                <div class="stat-card">
                    <h3>''' + str(data['metadata']['total_registros']) + '''</h3>
                    <p>Registros Totais</p>
                </div>
            </div>
            
            <h2 class="section-title">Distribuição de Status</h2>
            <div class="status-distribution">
'''
    
    # Add status distribution
    for status, count in status_sorted:
        percentage = (count / len(processos_unicos)) * 100
        html += f'''                <div class="status-item">
                    <div class="status-item-name">{status}</div>
                    <div class="status-item-count">{count}</div>
                    <div class="status-item-percent">{percentage:.1f}% dos processos</div>
                </div>
'''
    
    html += '''            </div>
            
            <h2 class="section-title" style="margin-top: 40px;">Tabela Completa de Processos</h2>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Protocolo GS</th>
                            <th>Nome</th>
                            <th>Status</th>
                            <th>Data Sincronismo</th>
                        </tr>
                    </thead>
                    <tbody>
'''
    
    # Add rows
    for idx, (chave, processo) in enumerate(processos_unicos.items(), 1):
        protocolo = processo.get('Protocolo GS', '')
        nome = processo.get('Nome', '')
        status = processo.get('Status', '')
        data = processo.get('Data Sincronismo', '')
        
        # Determine status badge class
        if 'Aprovado' in status or 'Finalizado' in status:
            status_class = 'status-aprovado'
        elif 'Acordo' in status:
            status_class = 'status-acordo'
        elif 'Análise' in status:
            status_class = 'status-analise'
        elif 'Negado' in status or 'Recusado' in status:
            status_class = 'status-negado'
        else:
            status_class = 'status-outro'
        
        html += f'''                        <tr>
                            <td>{idx}</td>
                            <td><strong>{protocolo}</strong></td>
                            <td>{nome}</td>
                            <td><span class="status-badge {status_class}">{status}</span></td>
                            <td>{data}</td>
                        </tr>
'''
    
    html += '''                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Dados sincronizados automaticamente da planilha Google Sheets - Gestão Segura</p>
            <p>Última atualização: ''' + datetime.now().strftime('%d/%m/%Y às %H:%M:%S') + '''</p>
        </div>
    </div>
</body>
</html>
'''
    
    # Write to file
    with open('processos-lista.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Arquivo gerado com sucesso!")
    print(f"   - Total de processos: {len(processos_unicos)}")
    print(f"   - Status únicos: {len(status_count)}")
    print(f"   - Arquivo: processos-lista.html")

if __name__ == "__main__":
    generate_processos_html()
