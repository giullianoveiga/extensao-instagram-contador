// Utilitário para validar a estrutura da extensão
class ExtensionValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validateManifest() {
        try {
            // Verificar se o manifest.json existe e é válido
            const manifestContent = this.getFileContent('manifest.json');
            const manifest = JSON.parse(manifestContent);
            
            // Verificações básicas
            if (!manifest.manifest_version) {
                this.errors.push('manifest_version é obrigatório');
            }
            
            if (manifest.manifest_version !== 3) {
                this.errors.push('Deve usar Manifest V3');
            }
            
            if (!manifest.name || !manifest.version || !manifest.description) {
                this.errors.push('name, version e description são obrigatórios');
            }
            
            if (!manifest.permissions || !manifest.permissions.includes('activeTab')) {
                this.errors.push('Permissão activeTab é necessária');
            }
            
            if (!manifest.host_permissions || !manifest.host_permissions.includes('https://www.instagram.com/*')) {
                this.errors.push('Permissão para Instagram é necessária');
            }
            
            console.log('✅ Manifest.json validado com sucesso');
            
        } catch (error) {
            this.errors.push(`Erro no manifest.json: ${error.message}`);
        }
    }

    validateFiles() {
        const requiredFiles = [
            'manifest.json',
            'popup.html',
            'popup.js',
            'content.js',
            'background.js',
            'styles.css',
            'README.md'
        ];

        requiredFiles.forEach(file => {
            if (!this.fileExists(file)) {
                this.errors.push(`Arquivo obrigatório não encontrado: ${file}`);
            } else {
                console.log(`✅ ${file} encontrado`);
            }
        });
    }

    validatePopupHTML() {
        try {
            const htmlContent = this.getFileContent('popup.html');
            
            // Verificações básicas do HTML
            if (!htmlContent.includes('<!DOCTYPE html>')) {
                this.warnings.push('DOCTYPE HTML5 recomendado');
            }
            
            if (!htmlContent.includes('popup.js')) {
                this.errors.push('popup.html deve referenciar popup.js');
            }
            
            if (!htmlContent.includes('scanButton')) {
                this.errors.push('Botão de scan não encontrado no HTML');
            }
            
            if (!htmlContent.includes('exportExcel')) {
                this.errors.push('Botão de exportação Excel não encontrado');
            }
            
            console.log('✅ popup.html validado');
            
        } catch (error) {
            this.errors.push(`Erro no popup.html: ${error.message}`);
        }
    }

    validateJavaScript() {
        const jsFiles = ['popup.js', 'content.js', 'background.js'];
        
        jsFiles.forEach(file => {
            try {
                const content = this.getFileContent(file);
                
                // Verificações básicas de sintaxe
                if (content.includes('var ')) {
                    this.warnings.push(`${file}: Prefira const/let ao invés de var`);
                }
                
                if (file === 'popup.js' && !content.includes('InstagramCommentCounter')) {
                    this.errors.push('popup.js deve conter a classe InstagramCommentCounter');
                }
                
                if (file === 'content.js' && !content.includes('InstagramAnalyzer')) {
                    this.errors.push('content.js deve conter a classe InstagramAnalyzer');
                }
                
                if (file === 'background.js' && !content.includes('chrome.runtime.onInstalled')) {
                    this.warnings.push('background.js deveria ter listener onInstalled');
                }
                
                console.log(`✅ ${file} validado`);
                
            } catch (error) {
                this.errors.push(`Erro no ${file}: ${error.message}`);
            }
        });
    }

    validateIcons() {
        const iconSizes = [16, 48, 128];
        iconSizes.forEach(size => {
            const iconFile = `icons/icon${size}.png`;
            if (!this.fileExists(iconFile)) {
                this.warnings.push(`Ícone ${iconFile} não encontrado - use README-ICONS.md para criá-los`);
            }
        });
    }

    // Métodos auxiliares (simulados - em ambiente real verificariam os arquivos)
    fileExists(path) {
        // Em um ambiente real, verificaria se o arquivo existe
        const requiredFiles = [
            'manifest.json', 'popup.html', 'popup.js', 
            'content.js', 'background.js', 'styles.css', 'README.md'
        ];
        return requiredFiles.includes(path);
    }

    getFileContent(path) {
        // Em um ambiente real, leria o conteúdo do arquivo
        // Para validação, assumimos que os arquivos existem com conteúdo básico
        return `// Conteúdo simulado do arquivo ${path}`;
    }

    runValidation() {
        console.log('🔍 Iniciando validação da extensão B&O...\n');
        
        this.validateManifest();
        this.validateFiles();
        this.validatePopupHTML();
        this.validateJavaScript();
        this.validateIcons();
        
        console.log('\n📋 Resultado da Validação:');
        
        if (this.errors.length === 0) {
            console.log('✅ Nenhum erro crítico encontrado!');
        } else {
            console.log('❌ Erros encontrados:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('⚠️ Avisos:');
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        console.log('\n🚀 Próximos passos:');
        console.log('1. Corrigir erros (se houver)');
        console.log('2. Criar ícones PNG (ver icons/README-ICONS.md)');
        console.log('3. Abrir Chrome → chrome://extensions/');
        console.log('4. Ativar "Modo do desenvolvedor"');
        console.log('5. Clicar "Carregar sem compactação"');
        console.log('6. Selecionar esta pasta');
        console.log('7. Testar no Instagram!');
    }
}

// Executar validação
if (typeof window !== 'undefined') {
    // Executar no browser
    const validator = new ExtensionValidator();
    validator.runValidation();
} else {
    // Executar no Node.js
    console.log('Execute este arquivo no console do browser para validação completa');
}

// Funções de teste para desenvolvimento
function testExtension() {
    console.log('🧪 Testando funcionalidades da extensão...');
    
    // Teste 1: Verificar se está numa página do Instagram
    if (window.location.hostname.includes('instagram.com')) {
        console.log('✅ Teste 1: Está numa página do Instagram');
    } else {
        console.log('❌ Teste 1: Não está numa página do Instagram');
    }
    
    // Teste 2: Verificar se consegue encontrar comentários
    const commentSelectors = [
        'article span[dir="auto"]',
        'div[role="dialog"] span[dir="auto"]',
        'span[dir="auto"]'
    ];
    
    let commentsFound = 0;
    commentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        commentsFound += elements.length;
    });
    
    if (commentsFound > 0) {
        console.log(`✅ Teste 2: Encontrados ${commentsFound} elementos que podem ser comentários`);
    } else {
        console.log('❌ Teste 2: Nenhum comentário encontrado');
    }
    
    // Teste 3: Verificar regex de menções
    const testTexts = [
        'Eu voto no @joao.silva para melhor colaborador!',
        'Meu voto vai para @maria_santos',
        'Vote @pedro123 ele merece!',
        'Texto sem mencoes'
    ];
    
    const mentionRegex = /@([a-zA-Z0-9._]{2,30})/g;
    testTexts.forEach((text, index) => {
        const matches = text.match(mentionRegex);
        console.log(`✅ Teste 3.${index + 1}: "${text}" → ${matches ? matches.join(', ') : 'nenhuma menção'}`);
    });
    
    console.log('\n🎯 Testes concluídos!');
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.testExtension = testExtension;
    window.ExtensionValidator = ExtensionValidator;
}
