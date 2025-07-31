// TESTE RÁPIDO - Cole no console do Chrome para diagnóstico imediato
// Pressione F12, vá para aba Console, cole este código e pressione Enter

console.log('🔍 TESTE RÁPIDO - Extensão B&O Instagram');
console.log('=====================================');

// 1. Verificar página
console.log('\n1️⃣ VERIFICAÇÃO DA PÁGINA:');
console.log(`URL: ${window.location.href}`);
const isInstagram = window.location.hostname.includes('instagram.com');
const isPost = window.location.href.includes('/p/');
console.log(`✅ É Instagram: ${isInstagram}`);
console.log(`${isPost ? '✅' : '❌'} É um post: ${isPost}`);

if (!isInstagram) {
    console.log('🚨 ERRO: Não está no Instagram!');
    console.log('💡 Vá para instagram.com primeiro');
} else if (!isPost) {
    console.log('🚨 ERRO: Não está em um post individual!');
    console.log('💡 Navegue para um post específico (URL deve conter /p/)');
    console.log('💡 Exemplo: instagram.com/p/ABC123...');
} else {
    console.log('✅ Página correta!');
    
    // 2. Teste básico de comentários
    console.log('\n2️⃣ TESTE DE COMENTÁRIOS:');
    const basicSelector = 'span[dir="auto"]';
    const elements = document.querySelectorAll(basicSelector);
    console.log(`Elementos span[dir="auto"] encontrados: ${elements.length}`);
    
    if (elements.length === 0) {
        console.log('❌ Nenhum elemento encontrado!');
        console.log('💡 Role a página para carregar comentários');
        console.log('💡 Aguarde alguns segundos para a página carregar');
    } else {
        console.log('✅ Elementos encontrados!');
        
        // Mostrar alguns exemplos
        let validComments = 0;
        console.log('\n📝 EXEMPLOS DE TEXTO ENCONTRADO:');
        Array.from(elements).slice(0, 5).forEach((el, idx) => {
            const text = el.textContent?.trim();
            if (text && text.length > 3) {
                validComments++;
                const hasArobase = text.includes('@');
                console.log(`${idx + 1}. "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}" ${hasArobase ? '(TEM @)' : ''}`);
            }
        });
        
        console.log(`\n📊 Comentários válidos encontrados: ${validComments}`);
        
        // 3. Teste de menções
        console.log('\n3️⃣ TESTE DE MENÇÕES:');
        const mentions = new Set();
        Array.from(elements).forEach(el => {
            const text = el.textContent?.trim();
            if (text) {
                const matches = text.match(/@([a-zA-Z0-9._]{2,30})/g);
                if (matches) {
                    matches.forEach(match => mentions.add(match));
                }
            }
        });
        
        if (mentions.size === 0) {
            console.log('❌ Nenhuma menção @ encontrada!');
            console.log('💡 Certifique-se de que há comentários com @ na página');
            console.log('💡 Exemplo: "Eu voto no @usuario123"');
        } else {
            console.log(`✅ ${mentions.size} menções encontradas:`);
            Array.from(mentions).slice(0, 10).forEach((mention, idx) => {
                console.log(`   ${idx + 1}. ${mention}`);
            });
        }
    }
}

// 4. Resumo final
console.log('\n🎯 RESUMO:');
if (!isInstagram) {
    console.log('❌ Vá para o Instagram');
} else if (!isPost) {
    console.log('❌ Vá para um post específico (URL com /p/)');
} else if (elements.length === 0) {
    console.log('❌ Aguarde carregamento ou role a página');
} else {
    console.log('✅ Pronto para usar a extensão!');
}

console.log('\n📞 Se ainda houver problemas:');
console.log('1. Copie e execute o arquivo debug.js completo');
console.log('2. Consulte o arquivo TROUBLESHOOTING.md');
console.log('3. Certifique-se de estar em um post com comentários visíveis');
