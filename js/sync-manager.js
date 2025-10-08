/**
 * Gerenciador de Sincronização com Google Sheets
 * Força reload dos dados com cache busting
 */

class SyncManager {
    constructor() {
        this.dataUrl = '/data/processos.json';
        this.checkInterval = 2000; // 2 segundos
        this.maxAttempts = 5; // 10 segundos de verificação
    }

    /**
     * Força o reload dos dados ignorando cache
     */
    async forceReloadData() {
        const timestamp = new Date().getTime();
        const url = `${this.dataUrl}?t=${timestamp}`;
        
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        }
    }

    /**
     * Verifica se há dados mais recentes
     */
    async checkForUpdates(currentTimestamp) {
        try {
            const data = await this.forceReloadData();
            const newTimestamp = data.metadata?.ultima_atualizacao;
            
            if (newTimestamp && newTimestamp !== currentTimestamp) {
                return { hasUpdate: true, data };
            }
            
            return { hasUpdate: false, data };
        } catch (error) {
            return { hasUpdate: false, error };
        }
    }

    /**
     * Aguarda por atualizações nos dados
     */
    async waitForUpdate(currentTimestamp) {
        console.log('⏳ Verificando atualizações...');
        
        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, this.checkInterval));
            
            const result = await this.checkForUpdates(currentTimestamp);
            
            if (result.hasUpdate) {
                console.log('✅ Dados atualizados encontrados!');
                return { success: true, data: result.data };
            }
        }
        
        console.log('ℹ️  Nenhuma atualização detectada no período');
        return { success: false, message: 'Dados já estão atualizados' };
    }

    /**
     * Executa o processo de sincronização
     */
    async sync(currentTimestamp) {
        // Primeiro, tenta recarregar os dados imediatamente
        try {
            const data = await this.forceReloadData();
            
            // Verifica se já há dados mais recentes
            const newTimestamp = data.metadata?.ultima_atualizacao;
            if (newTimestamp && newTimestamp !== currentTimestamp) {
                console.log('✅ Dados atualizados encontrados imediatamente!');
                return { success: true, data, immediate: true };
            }
            
            // Se não houver atualização imediata, aguarda um pouco
            console.log('ℹ️  Aguardando sincronização...');
            const result = await this.waitForUpdate(currentTimestamp);
            
            if (result.success) {
                return { success: true, data: result.data, immediate: false };
            } else {
                // Retorna os dados atuais mesmo sem atualização
                return { success: true, data, immediate: false, noUpdate: true };
            }
        } catch (error) {
            console.error('❌ Erro ao sincronizar:', error);
            return { success: false, message: 'Erro ao carregar dados' };
        }
    }

    /**
     * Dispara sincronização manual via GitHub Actions
     * Nota: Requer que o usuário tenha configurado um webhook ou API
     */
    async triggerManualSync() {
        // Esta função pode ser expandida para chamar um webhook ou API
        // que dispare o workflow do GitHub Actions
        console.log('ℹ️  Sincronização manual não implementada');
        console.log('💡 Dica: Configure um webhook para disparar o workflow automaticamente');
        return false;
    }
}

// Exportar para uso global
window.SyncManager = SyncManager;
