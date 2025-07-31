// Content Script - Executa na página do Instagram
class InstagramAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.observer = null;
        this.init();
    }

    init() {
        // Adicionar indicador visual quando a extensão estiver ativa
        this.addAnalysisIndicator();
        
        // Escutar mensagens do popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'analyzeComments') {
                this.analyzeComments().then(sendResponse);
                return true; // Manter o canal aberto para resposta assíncrona
            }
        });
    }

    addAnalysisIndicator() {
        // Criar um pequeno indicador visual que mostra que a extensão está ativa
        const indicator = document.createElement('div');
        indicator.id = 'bo-extension-indicator';
        indicator.innerHTML = '📊 B&O';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            opacity: 0.8;
            transition: opacity 0.3s;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        indicator.addEventListener('mouseenter', () => {
            indicator.style.opacity = '1';
            indicator.title = 'Extensão B&O Comment Counter ativa';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.opacity = '0.8';
        });

        document.body.appendChild(indicator);
    }

    async analyzeComments() {
        if (this.isAnalyzing) {
            return { error: 'Análise já em andamento' };
        }

        this.isAnalyzing = true;
        
        try {
            // Aguardar um pouco para garantir que a página carregou
            await this.waitForPageLoad();

            // Tentar carregar mais comentários automaticamente
            await this.loadMoreComments();

            // Extrair comentários
            const result = this.extractComments();
            
            return result;

        } catch (error) {
            console.error('Erro na análise:', error);
            return { error: error.message };
        } finally {
            this.isAnalyzing = false;
        }
    }

    async waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                setTimeout(resolve, 1000); // Aguardar um pouco mais após o carregamento
            } else {
                window.addEventListener('load', () => {
                    setTimeout(resolve, 1000);
                });
            }
        });
    }

    async loadMoreComments() {
        // Tentar expandir comentários clicando em "Ver mais comentários"
        const loadMoreButtons = [
            'button[type="button"]:has-text("Ver mais comentários")',
            'button:contains("Ver mais")',
            'button:contains("Load more")',
            'button:contains("View")',
            '[role="button"]:contains("mais")'
        ];

        // Scroll para baixo para carregar mais conteúdo
        for (let i = 0; i < 3; i++) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Tentar clicar em botões "Ver mais"
            const buttons = document.querySelectorAll('button, [role="button"]');
            for (const button of buttons) {
                const text = button.textContent.toLowerCase();
                if (text.includes('ver mais') || text.includes('load more') || text.includes('view')) {
                    try {
                        button.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (e) {
                        // Ignorar erros de clique
                    }
                }
            }
        }
    }

    extractComments() {
        const mentions = new Map();
        let totalComments = 0;
        let processedElements = new Set();

        try {
            console.log('[B&O Extension] Iniciando análise da página...');
            
            // Aguardar um pouco para garantir que a página carregou
            if (document.readyState !== 'complete') {
                console.log('[B&O Extension] Aguardando carregamento da página...');
                return { mentions: {}, totalComments: 0, error: 'Página ainda carregando' };
            }

            // Múltiplos seletores para diferentes layouts do Instagram
            const selectors = [
                // Seletores específicos para comentários
                'article span[dir="auto"]',
                'div[data-testid*="comment"] span',
                'div[role="dialog"] span[dir="auto"]',
                // Seletores para posts expandidos
                'div[data-testid="post-comment-root"] span',
                // Seletores gerais
                'span[dir="auto"]',
                'div[role="button"] span',
                // Fallbacks para diferentes estruturas
                'div[style*="word-wrap"] span',
                'span:not([aria-label]):not([role])',
                'div > span > span',
                'ul li span[dir="auto"]'
            ];

            let allElements = [];
            let selectorStats = {};

            // Coletar elementos de todos os seletores
            selectors.forEach(selector => {
                try {
                    const elements = Array.from(document.querySelectorAll(selector));
                    selectorStats[selector] = elements.length;
                    allElements = allElements.concat(elements);
                } catch (e) {
                    console.log(`[B&O Extension] Seletor falhou: ${selector}`, e);
                }
            });

            console.log('[B&O Extension] Elementos encontrados por seletor:', selectorStats);
            console.log(`[B&O Extension] Total de elementos coletados: ${allElements.length}`);

            // Filtrar e processar elementos únicos
            const uniqueTexts = new Set();
            allElements.forEach(element => {
                try {
                    const text = element.textContent?.trim();
                    if (!text || text.length < 3) return;

                    // Evitar duplicatas de texto
                    if (uniqueTexts.has(text)) return;
                    uniqueTexts.add(text);

                    // Filtrar elementos que claramente não são comentários
                    if (this.isValidComment(text, element)) {
                        totalComments++;
                        this.extractMentionsFromText(text, mentions);
                    }

                } catch (error) {
                    console.log('[B&O Extension] Erro ao processar elemento:', error);
                }
            });

            // Ordenar menções por contagem
            const sortedMentions = Object.fromEntries(
                Array.from(mentions.entries()).sort((a, b) => b[1] - a[1])
            );

            console.log('[B&O Extension] Análise concluída:', {
                totalComments,
                uniqueMentions: mentions.size,
                topMentions: Object.entries(sortedMentions).slice(0, 5)
            });

            return {
                mentions: sortedMentions,
                totalComments,
                uniqueMentions: mentions.size,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('[B&O Extension] Erro na extração:', error);
            return {
                mentions: {},
                totalComments: 0,
                error: error.message
            };
        }
    }

    isValidComment(text, element) {
        // Filtrar textos que claramente não são comentários
        const invalidPatterns = [
            /^(curtir|like|seguir|follow|responder|reply)$/i,
            /^(há \d+|ago|\d+ min)$/i,
            /^(ver tradução|see translation)$/i,
            /^(mostrar mais|show more|ver mais)$/i,
            /^\d+$/,
            /^[•·\s]+$/,
            /^(comentários|comments)$/i,
            /^(instagram|official)$/i
        ];

        // Verificar se é muito curto ou segue padrões inválidos
        if (text.length < 3 || invalidPatterns.some(pattern => pattern.test(text))) {
            return false;
        }

        // Verificar se contém pelo menos uma letra
        if (!/[a-zA-ZÀ-ÿ]/.test(text)) {
            return false;
        }

        // Verificar se não é apenas números ou símbolos
        if (/^[\d\s\-_.,!@#$%^&*()]+$/.test(text)) {
            return false;
        }

        return true;
    }

    extractMentionsFromText(text, mentions) {
        // Regex melhorada para capturar menções @
        const mentionRegex = /@([a-zA-Z0-9._]{2,30})/g;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            const username = match[1].toLowerCase().trim();
            
            // Filtros para usernames válidos
            if (this.isValidUsername(username)) {
                const count = mentions.get(username) || 0;
                mentions.set(username, count + 1);
            }
        }
    }

    isValidUsername(username) {
        // Filtrar usernames inválidos
        const invalidPatterns = [
            /^(instagram|insta|official|page)$/i,
            /^[._]+$/,
            /^\d+$/,
            /^.{1,2}$/, // Muito curto
            /^.{31,}$/ // Muito longo
        ];

        return !invalidPatterns.some(pattern => pattern.test(username));
    }
}

// Inicializar o analisador quando o script carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new InstagramAnalyzer();
    });
} else {
    new InstagramAnalyzer();
}
