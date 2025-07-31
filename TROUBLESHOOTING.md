# 🔧 Guia de Troubleshooting

## Extensão B&O Instagram Comment Counter

### 🚨 Problema: "Nenhum comentário encontrado"

Este é o erro mais comum. Aqui estão as soluções em ordem de prioridade:

#### ✅ Verificação Básica

1. **Confirme que está em um POST do Instagram**

   - ❌ NÃO funciona em: perfil, stories, reels, explorar
   - ✅ FUNCIONA em: posts individuais com comentários
   - 🔗 URL deve ser algo como: `instagram.com/p/ABC123...`

2. **Aguarde o carregamento completo**

   - Espere a página carregar 100%
   - Aguarde 2-3 segundos após o carregamento
   - Verifique se vê comentários na tela

3. **Carregue mais comentários**
   - Role a página para baixo
   - Clique em "Ver mais comentários" se aparecer
   - Algumas páginas só mostram 1-2 comentários inicialmente

#### 🔍 Diagnóstico Avançado

**Execute o script de debug:**

1. Abra o Console do Chrome (`F12` → aba Console)
2. Copie TODO o conteúdo do arquivo `debug.js`
3. Cole no console e pressione Enter
4. Analise os resultados

**Interpretação dos resultados:**

```
✅ URL atual: https://www.instagram.com/p/ABC123/
✅ É Instagram: true
✅ Readystate: complete
✅ article span[dir="auto"]: 25 elementos
✅ Comentários válidos encontrados: 15
✅ Menções únicas: 8
```

= **FUNCIONANDO!** A extensão deve funcionar.

```
❌ URL atual: https://www.instagram.com/username/
❌ É Instagram: true
❌ article span[dir="auto"]: 0 elementos
❌ Comentários válidos encontrados: 0
```

= **PROBLEMA:** Não está em um post com comentários.

#### 🎯 Soluções Específicas

**Problema: "0 elementos encontrados"**

- Aguarde 5 segundos e recarregue a página
- Certifique-se de estar em um post, não em perfil
- Tente em outro post com mais comentários

**Problema: "Elementos encontrados mas 0 comentários válidos"**

- A página pode ter carregado botões/menus ao invés de comentários
- Role para baixo para carregar os comentários reais
- Clique para expandir comentários se necessário

**Problema: "Comentários encontrados mas 0 menções"**

- Os comentários não têm @ menções ainda
- Verifique se o post é da campanha correta
- Aguarde mais participação ou teste em post ativo

---

### 🚨 Problema: Extensão não aparece no Chrome

#### ✅ Verificações

1. **Modo desenvolvedor ativo?**

   - Vá para `chrome://extensions/`
   - Toggle "Modo do desenvolvedor" deve estar LIGADO
   - Deve aparecer no canto superior direito

2. **Extensão carregada?**

   - Deve aparecer na lista com nome "Instagram Comment Counter - B&O Campaign"
   - Status deve ser "Ativada"
   - Se não aparece, clique "Carregar sem compactação" novamente

3. **Ícones criados?**

   - Verifique se existem os arquivos: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`
   - Se não existem, siga `icons/README-ICONS.md`

4. **Erros na extensão?**
   - Clique em "Detalhes" da extensão
   - Verifique se há erros listados
   - Se há erro, vá para a próxima seção

---

### 🚨 Problema: Erros na extensão

#### ✅ Erros Comuns e Soluções

**Erro: "Manifest file is missing or unreadable"**

- Verifique se `manifest.json` existe na pasta raiz
- Abra o arquivo e certifique-se de que está válido (sem vírgulas extras)

**Erro: "Icons not found"**

- Crie os ícones seguindo `icons/README-ICONS.md`
- OU temporariamente, copie qualquer imagem PNG pequena para `icons/` e renomeie

**Erro: "Invalid permissions"**

- Recarregue a extensão
- Se persistir, reinstale a extensão

**Erro de JavaScript**

- Abra Console (`F12`)
- Procure erros em vermelho
- Anote a linha do erro e arquivo

---

### 🚨 Problema: Scan muito lento

#### ✅ Otimizações

1. **Feche outras abas** desnecessárias
2. **Aguarde carregamento** completo da página antes de escanear
3. **Posts muito grandes** podem demorar 30-60 segundos
4. **Não feche a aba** durante o scan

#### ⚡ Dicas de Performance

- Escaneie em horários de menor tráfego
- Use posts com 50-200 comentários para melhor performance
- Evite posts com milhares de comentários

---

### 🚨 Problema: Exportação não funciona

#### ✅ Verificações

1. **Permissões de download**

   - Chrome pode estar bloqueando downloads
   - Verifique configurações de download

2. **Dados para exportar**

   - Execute um scan com sucesso primeiro
   - Verifique se o ranking mostra dados

3. **Pasta de destino**
   - Escolha uma pasta com permissão de escrita
   - Evite pastas do sistema

---

### 🆘 Ainda não funciona?

#### 📞 Suporte Avançado

1. **Colete informações de debug:**

   ```javascript
   // Cole no console:
   console.log("URL:", window.location.href);
   console.log("User Agent:", navigator.userAgent);
   console.log("Chrome Version:", navigator.appVersion);
   console.log(
     "Instagram Elements:",
     document.querySelectorAll('span[dir="auto"]').length
   );
   ```

2. **Teste em modo privado:**

   - Abra uma aba privada/anônima
   - Vá para Instagram
   - Teste a extensão
   - Se funciona em modo privado, há conflito com outras extensões

3. **Teste em post diferente:**

   - Tente um post público conhecido com muitos comentários
   - Se funciona em outros posts, o problema é específico da página

4. **Reinicie completamente:**
   - Feche o Chrome
   - Reabra e teste novamente

---

### 🔬 Logs Detalhados

Para debug avançado, os logs da extensão aparecem no Console com prefixo `[B&O Extension]`:

```
[B&O Extension] Iniciando análise da página...
[B&O Extension] Elementos encontrados por seletor: {...}
[B&O Extension] Total de elementos coletados: 45
[B&O Extension] Menção encontrada: @usuario123 no texto: "Eu voto no @usuario123..."
[B&O Extension] Análise concluída: {totalComments: 23, uniqueMentions: 12}
```

Use esses logs para entender o que está acontecendo.

---

### 📋 Checklist de Resolução

Marque cada item testado:

- [ ] Estou em um post do Instagram (URL contém `/p/`)
- [ ] Vejo comentários na tela
- [ ] Aguardei a página carregar completamente
- [ ] Extensão aparece em chrome://extensions/
- [ ] Ícones PNG existem na pasta icons/
- [ ] Executei o script debug.js
- [ ] Verifiquei logs no Console
- [ ] Testei em outro post
- [ ] Testei em modo privado
- [ ] Recarreguei a extensão

Se todos os itens estão marcados e ainda não funciona, pode ser uma mudança na estrutura do Instagram que requer atualização da extensão.
