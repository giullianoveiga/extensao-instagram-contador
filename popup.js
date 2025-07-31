// Popup script - Interface da extensão
class InstagramCommentCounter {
    constructor() {
        this.rankings = new Map();
        this.totalComments = 0;
        this.isScanning = false;
        this.initializeEventListeners();
        this.loadSavedData();
    }

    initializeEventListeners() {
        document.getElementById('scanButton').addEventListener('click', () => this.scanComments());
        document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());
        document.getElementById('exportCSV').addEventListener('click', () => this.exportToCSV());
        document.getElementById('clearResultsButton').addEventListener('click', () => {
            document.getElementById('ranking').innerHTML = '';
            document.getElementById('totalComments').classList.add('hidden');
            document.getElementById('status').classList.add('hidden');
            document.getElementById('status').textContent = '';
            alert('Resultados limpos com sucesso!');
        });
    }

    async loadSavedData() {
        try {
            const result = await chrome.storage.local.get(['rankings', 'totalComments', 'lastScan']);
            if (result.rankings) {
                this.rankings = new Map(Object.entries(result.rankings));
                this.totalComments = result.totalComments || 0;
                this.updateRankingDisplay();
                this.updateExportButtons();
                
                if (result.lastScan) {
                    const lastScanDate = new Date(result.lastScan).toLocaleString('pt-BR');
                    this.showStatus(`Último scan: ${lastScanDate}`, 'info');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }

    async clearData() {
        try {
            this.rankings.clear();
            this.totalComments = 0;
            await chrome.storage.local.remove(['rankings', 'totalComments', 'lastScan']);
            this.updateRankingDisplay();
            this.updateExportButtons();
            this.showStatus('✅ Dados limpos com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            this.showStatus('❌ Erro ao limpar os dados. Tente novamente.', 'error');
        }
    }

    async scanComments() {
        if (this.isScanning) return;

        // Limpar dados antes de iniciar um novo scan
        await this.clearData();

        this.isScanning = true;
        const scanButton = document.getElementById('scanButton');
        const originalText = scanButton.textContent;

        try {
            // Verificar se estamos numa página do Instagram
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.id) {
                this.showStatus('❌ Não foi possível identificar a aba ativa. Tente novamente.', 'error');
                return;
            }

            if (!tab.url.includes('instagram.com')) {
                this.showStatus('❌ Abra um post do Instagram primeiro!', 'error');
                return;
            }

            if (!tab.url.includes('/p/')) {
                this.showStatus('⚠️ Certifique-se de estar em um POST do Instagram (URL deve conter /p/)', 'error');
                return;
            }

            if (!chrome.scripting) {
                this.showStatus('❌ A API chrome.scripting não está disponível. Verifique as permissões no manifest.json.', 'error');
                return;
            }

            scanButton.textContent = '🔄 Escaneando...';
            scanButton.disabled = true;
            this.showStatus('🔍 Escaneando comentários...', 'info');

            // Aguardar um pouco antes de injetar o script
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Injetar e executar o script de análise com scroll automático
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const scrollAndCollectComments = async () => {
                        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                        const selectors = [
                            'article span[dir="auto"]',
                            'div[data-testid*="comment"] span',
                            'div[role="dialog"] span[dir="auto"]',
                            'span[dir="auto"]',
                            'div[role="button"] span',
                            'div[style*="word-wrap"] span',
                            'span:not([aria-label]):not([role])',
                            'div > span > span',
                            'ul li span[dir="auto"]',
                            'div[aria-label="Comentários"] span',
                            'ul li div[role="menuitem"] span', // Comentários principais
                            'div[role="dialog"] ul li div[role="menuitem"] span', // Comentários em diálogos
                            'article ul li div[role="menuitem"] span', // Comentários em posts
                            'div[aria-label="Comentários"] ul li div[role="menuitem"] span' // Fallback para comentários
                        ];

                        const mentions = new Map();
                        let totalComments = 0;

                        const isValidComment = (text) => {
                            const invalidPatterns = [
                                /^(curtir|like|seguir|follow|responder|reply)$/i,
                                /^(há \d+|ago|\d+ min)$/i,
                                /^(ver tradução|see translation)$/i,
                                /^(mostrar mais|show more|ver mais)$/i,
                                /^\d+$/,
                                /^[•·\s]+$/,
                                /^(comentários|comments)$/i
                            ];

                            return text.length >= 3 && !invalidPatterns.some(pattern => pattern.test(text)) && /[a-zA-ZÀ-ÿ]/.test(text);
                        };

                        const isValidUsername = (username) => {
                            const invalidPatterns = [
                                /^(instagram|insta|official|page)$/i,
                                /^[._]+$/,
                                /^\d+$/,
                                /^.{1,2}$/,
                                /^.{31,}$/
                            ];

                            return !invalidPatterns.some(pattern => pattern.test(username));
                        };

                        const clickLoadMoreButton = async () => {
                            const loadMoreButton = document.querySelector('button[aria-label="Carregar mais comentários"]');
                            if (loadMoreButton) {
                                loadMoreButton.click();
                                await delay(2000); // Aguardar carregamento
                            }
                        };

                        const collectComments = () => {
                            const processedComments = new Set(); // Armazena comentários únicos para evitar duplicação global

                            selectors.forEach((selector, index) => {
                                const elements = document.querySelectorAll(selector);
                                console.log(`[B&O Extension] Seletor ${index + 1} encontrou ${elements.length} elementos.`);

                                elements.forEach(element => {
                                    const text = element.textContent?.trim();
                                    if (!text || processedComments.has(text)) return; // Ignorar comentários já processados globalmente

                                    processedComments.add(text); // Adicionar comentário ao conjunto de processados

                                    if (isValidComment(text)) {
                                        totalComments++;
                                        const mentionRegex = /@([a-zA-Z0-9._]{2,30})/g;
                                        let match;

                                        while ((match = mentionRegex.exec(text)) !== null) {
                                            const username = match[1].toLowerCase();
                                            if (isValidUsername(username)) {
                                                mentions.set(username, (mentions.get(username) || 0) + 1);
                                                console.log(`[B&O Extension] Menção capturada: @${username} no texto: "${text}"`);
                                            }
                                        }
                                    }
                                });
                            });
                        };

                        let lastHeight = 0;
                        while (true) {
                            await clickLoadMoreButton();
                            collectComments();
                            window.scrollTo(0, document.body.scrollHeight);
                            await delay(1000);

                            const newHeight = document.body.scrollHeight;
                            if (newHeight === lastHeight) break;
                            lastHeight = newHeight;
                        }

                        return {
                            mentions: Object.fromEntries([...mentions.entries()].sort((a, b) => b[1] - a[1])),
                            totalComments,
                            success: true
                        };
                    };

                    return scrollAndCollectComments();
                }
            });

            console.log('[B&O Extension] Resultado do script injetado:', results);

            if (results && results[0] && results[0].result) {
                const result = results[0].result;

                if (!result.success) {
                    this.showStatus(`❌ Erro na análise: ${result.error || 'Erro desconhecido'}`, 'error');
                    return;
                }

                const { mentions, totalComments } = result;

                if (totalComments === 0) {
                    this.showStatus('❌ Nenhum comentário encontrado. Verifique se está em um post com comentários.', 'error');
                    return;
                }

                // Atualizar dados
                this.updateRankings(mentions);
                this.totalComments = totalComments;

                // Salvar dados
                await this.saveData();

                // Atualizar interface
                this.updateRankingDisplay();
                this.updateExportButtons();

                this.showStatus(`✅ Scan concluído! ${totalComments} comentários analisados`, 'success');

            } else {
                this.showStatus('❌ Erro ao executar script de análise. Tente recarregar a página.', 'error');
            }

        } catch (error) {
            console.error('[B&O Extension] Erro durante o scan:', error);
            this.showStatus(`❌ Erro durante o scan: ${error.message}. Tente novamente.`, 'error');
        } finally {
            this.isScanning = false;
            scanButton.textContent = originalText;
            scanButton.disabled = false;
        }
    }

    updateRankings(newMentions) {
        // Combinar com dados existentes
        Object.entries(newMentions).forEach(([username, count]) => {
            const existingCount = this.rankings.get(username) || 0;
            this.rankings.set(username, existingCount + count);
        });
    }

    updateRankingDisplay() {
        const rankingDiv = document.getElementById('ranking');
        const totalDiv = document.getElementById('totalComments');

        if (this.rankings.size === 0) {
            rankingDiv.innerHTML = '<p style="text-align: center; color: #8e8e8e;">Nenhum dado disponível</p>';
            totalDiv.classList.add('hidden');
            return;
        }

        // Ordenar por contagem decrescente
        const sortedRankings = Array.from(this.rankings.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10

        const totalMentions = Array.from(this.rankings.values()).reduce((sum, count) => sum + count, 0);
        
        totalDiv.textContent = `Total: ${Math.floor(totalMentions / 2)} menções em ${Math.floor(this.totalComments / 2)} comentários`;
        totalDiv.classList.remove('hidden');

        rankingDiv.innerHTML = sortedRankings.map(([username, count], index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
            return `
                <div class="ranking-item">
                    <span>${medal} <span class="username">@${username}</span></span>
                    <span class="count">${Math.floor(count / 2)}</span>
                </div>
            `;
        }).join('');
    }

    updateExportButtons() {
        const hasData = this.rankings.size > 0;
        document.getElementById('exportExcel').disabled = !hasData;
        document.getElementById('exportCSV').disabled = !hasData;
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                rankings: Object.fromEntries(this.rankings),
                totalComments: this.totalComments,
                lastScan: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.classList.remove('hidden');
        
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 3000);
        }
    }

    async exportToCSV() {
        if (this.rankings.size === 0) return;

        const sortedData = Array.from(this.rankings.entries())
            .sort((a, b) => b[1] - a[1]);

        let csvContent = "Posição,Username,Menções\n";
        sortedData.forEach(([username, count], index) => {
            csvContent += `${index + 1},@${username},${count}\n`;
        });

        csvContent += `\nTotal de comentários analisados:,${this.totalComments}\n`;
        csvContent += `Data da análise:,${new Date().toLocaleString('pt-BR')}\n`;

        this.downloadFile(csvContent, 'ranking-colaboradores-bo.csv', 'text/csv');
    }

    async exportToExcel() {
        // Para Excel, vamos usar formato CSV compatível
        await this.exportToCSV();
        this.showStatus('✅ Arquivo exportado! Abra no Excel.', 'success');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        });
    }
}

// Inicializar quando o popup carregar
document.addEventListener('DOMContentLoaded', () => {
    new InstagramCommentCounter();
});
