// Script de Debug para testar a extensão no Instagram
// Cole este código no console do Chrome (F12) quando estiver numa página do Instagram

console.log('🔍 Iniciando debug da extensão B&O...');

// Função para testar detecção de comentários
function debugCommentDetection() {
    console.log('\n=== DEBUG: DETECÇÃO DE COMENTÁRIOS ===');
    
    // Verificar primeiro se está na página correta
    if (!window.location.href.includes('/p/')) {
        console.log('❌ ERRO: Não está em um post individual!');
        console.log('💡 Navegue para um post específico do Instagram');
        return { error: 'Não é um post' };
    }
    
    // Aguardar um pouco se a página ainda estiver carregando
    if (document.readyState !== 'complete') {
        console.log('⚠️ AVISO: Página ainda carregando...');
        console.log('💡 Aguarde alguns segundos e execute novamente');
    }
    
    // Testar diferentes seletores
    const selectors = [
        'article span[dir="auto"]',
        'div[data-testid*="comment"] span',
        'div[role="dialog"] span[dir="auto"]',
        'div[data-testid="post-comment-root"] span',
        'span[dir="auto"]',
        'div[role="button"] span',
        'div[style*="word-wrap"] span',
        'span:not([aria-label]):not([role])',
        'div > span > span',
        'ul li span[dir="auto"]'
    ];
    
    let totalElements = 0;
    let selectorResults = {};
    let validComments = [];
    
    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            selectorResults[selector] = elements.length;
            totalElements += elements.length;
            
            if (elements.length > 0) {
                console.log(`✅ ${selector}: ${elements.length} elementos`);
                
                // Mostrar alguns exemplos e validar como comentários
                Array.from(elements).slice(0, 3).forEach((el, idx) => {
                    const text = el.textContent?.trim();
                    if (text && text.length > 2) {
                        const isValid = isValidComment(text);
                        console.log(`   Exemplo ${idx + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${isValid ? 'VÁLIDO' : 'INVÁLIDO'})`);
                        if (isValid) {
                            validComments.push(text);
                        }
                    }
                });
            } else {
                console.log(`❌ ${selector}: 0 elementos`);
            }
        } catch (e) {
            console.log(`❌ ${selector}: ERRO - ${e.message}`);
            selectorResults[selector] = `ERRO: ${e.message}`;
        }
    });
    
    console.log(`\n📊 Total de elementos encontrados: ${totalElements}`);
    console.log(`📊 Comentários válidos: ${validComments.length}`);
    
    if (totalElements === 0) {
        console.log('\n❌ PROBLEMA: Nenhum elemento encontrado!');
        console.log('💡 SOLUÇÕES:');
        console.log('1. Role a página para baixo para carregar comentários');
        console.log('2. Clique em "Ver mais comentários" se disponível');
        console.log('3. Certifique-se de que há comentários visíveis na tela');
        console.log('4. Tente em outro post com mais atividade');
    } else if (validComments.length === 0) {
        console.log('\n⚠️ PROBLEMA: Elementos encontrados mas nenhum comentário válido!');
        console.log('💡 Pode ser que os elementos sejam botões, menus ou outros elementos da interface');
    }
    
    return { selectorResults, totalElements, validComments: validComments.length };
}

// Função para simular a análise completa
function debugFullAnalysis() {
    console.log('\n=== DEBUG: ANÁLISE COMPLETA ===');
    
    const mentions = new Map();
    let totalComments = 0;
    const processedTexts = new Set();
    
    // Usar os mesmos seletores da extensão
    const selectors = [
        'article span[dir="auto"]',
        'div[data-testid*="comment"] span',
        'div[role="dialog"] span[dir="auto"]',
        'span[dir="auto"]',
        'div[role="button"] span'
    ];
    
    let allElements = [];
    selectors.forEach(selector => {
        try {
            const elements = Array.from(document.querySelectorAll(selector));
            allElements = allElements.concat(elements);
        } catch (e) {
            console.log(`Erro no seletor ${selector}:`, e);
        }
    });
    
    console.log(`Total de elementos coletados: ${allElements.length}`);
    
    // Processar elementos
    allElements.forEach(element => {
        const text = element.textContent?.trim();
        if (!text || text.length < 3) return;
        
        // Evitar duplicatas
        if (processedTexts.has(text)) return;
        processedTexts.add(text);
        
        // Validar comentário
        if (isValidComment(text)) {
            totalComments++;
            
            // Buscar menções
            const mentionRegex = /@([a-zA-Z0-9._]{2,30})/g;
            let match;
            
            while ((match = mentionRegex.exec(text)) !== null) {
                const username = match[1].toLowerCase();
                if (isValidUsername(username)) {
                    const count = mentions.get(username) || 0;
                    mentions.set(username, count + 1);
                }
            }
        }
    });
    
    console.log(`Comentários válidos encontrados: ${totalComments}`);
    console.log(`Menções únicas: ${mentions.size}`);
    
    if (mentions.size > 0) {
        console.log('Top 5 menções:');
        Array.from(mentions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([username, count], index) => {
                console.log(`   ${index + 1}. @${username}: ${count} menções`);
            });
    }
    
    return {
        totalComments,
        mentions: Object.fromEntries(mentions),
        uniqueMentions: mentions.size
    };
}

// Funções auxiliares de validação
function isValidComment(text) {
    const invalidPatterns = [
        /^(curtir|like|seguir|follow|responder|reply)$/i,
        /^(há \d+|ago|\d+ min)$/i,
        /^(ver tradução|see translation)$/i,
        /^(mostrar mais|show more|ver mais)$/i,
        /^\d+$/,
        /^[•·\s]+$/,
        /^(comentários|comments)$/i
    ];
    
    if (text.length < 3 || invalidPatterns.some(pattern => pattern.test(text))) {
        return false;
    }
    
    if (!/[a-zA-ZÀ-ÿ]/.test(text)) {
        return false;
    }
    
    return true;
}

function isValidUsername(username) {
    const invalidPatterns = [
        /^(instagram|insta|official|page)$/i,
        /^[._]+$/,
        /^\d+$/,
        /^.{1,2}$/,
        /^.{31,}$/
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(username));
}

// Executar todos os testes
function runAllTests() {
    console.log('🧪 EXECUTANDO TODOS OS TESTES...\n');
    
    debugPageDetection();
    debugCommentDetection();
    debugMentionDetection();
    const results = debugFullAnalysis();
    
    console.log('\n🎯 RESUMO DOS RESULTADOS:');
    console.log(`- Comentários encontrados: ${results.totalComments}`);
    console.log(`- Menções únicas: ${results.uniqueMentions}`);
    console.log(`- URL: ${window.location.href}`);
    console.log(`- Timestamp: ${new Date().toISOString()}`);
    
    if (results.totalComments === 0) {
        console.log('\n⚠️ PROBLEMAS IDENTIFICADOS:');
        console.log('1. Nenhum comentário foi encontrado');
        console.log('2. Possíveis causas:');
        console.log('   - Não está em um post do Instagram (/p/ na URL)');
        console.log('   - Post não tem comentários visíveis');
        console.log('   - Estrutura HTML do Instagram mudou');
        console.log('   - Página ainda carregando');
        
        console.log('\n💡 SOLUÇÕES SUGERIDAS:');
        console.log('1. Certifique-se de estar em um POST (URL deve conter /p/)');
        console.log('2. Role a página para carregar comentários');
        console.log('3. Clique em "Ver mais comentários" se disponível');
        console.log('4. Aguarde alguns segundos e tente novamente');
        console.log('5. Teste em outro post com comentários visíveis');
        
        // Teste específico para verificar se é um post
        if (!window.location.href.includes('/p/')) {
            console.log('\n🚨 ERRO PRINCIPAL: Não está em um post individual!');
            console.log('📍 URL atual:', window.location.href);
            console.log('✅ URL correta seria algo como: instagram.com/p/ABC123...');
        }
    } else {
        console.log('\n✅ TUDO FUNCIONANDO!');
        console.log('A extensão deve funcionar normalmente nesta página.');
    }
    
    return results;
}

// Executar automaticamente
runAllTests();

// Disponibilizar funções globalmente para uso manual
window.debugExtension = {
    runAllTests,
    debugPageDetection,
    debugCommentDetection,
    debugMentionDetection,
    debugFullAnalysis
};

console.log('\n📝 Para executar testes individuais, use:');
console.log('- window.debugExtension.debugPageDetection()');
console.log('- window.debugExtension.debugCommentDetection()');
console.log('- window.debugExtension.debugMentionDetection()');
console.log('- window.debugExtension.debugFullAnalysis()');
console.log('- window.debugExtension.runAllTests()');
