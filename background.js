// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensão B&O Comment Counter instalada!');
    
    // Configurações iniciais
    chrome.storage.local.set({
        extensionActive: true,
        installDate: new Date().toISOString()
    });
});

// Escutar mensagens entre content script e popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensagem recebida no background:', request);
    
    if (request.action === 'analyzeComments') {
        // Repassar mensagem para o content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
            }
        });
        return true; // Manter canal aberto
    }
    
    if (request.action === 'saveData') {
        // Salvar dados de análise
        chrome.storage.local.set(request.data)
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

// Monitorar mudanças de aba
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('instagram.com')) {
        console.log('Página do Instagram carregada:', tab.url);
        
        // Opcional: notificar que a extensão está pronta
        chrome.action.setBadgeText({
            text: '📊',
            tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: '#E4405F',
            tabId: tabId
        });
    }
});

// Limpar badge quando sair do Instagram
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('instagram.com')) {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }
});

// Funcionalidade de limpeza de dados antigos (opcional)
function cleanOldData() {
    chrome.storage.local.get(['lastCleanup'], (result) => {
        const lastCleanup = result.lastCleanup || 0;
        const daysSinceCleanup = (Date.now() - lastCleanup) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCleanup > 30) { // Limpar dados antigos após 30 dias
            chrome.storage.local.clear(() => {
                chrome.storage.local.set({
                    lastCleanup: Date.now(),
                    extensionActive: true
                });
                console.log('Dados antigos limpos');
            });
        }
    });
}

// Executar limpeza na inicialização
cleanOldData();
