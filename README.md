# 📊 B&O Instagram Comment Counter

Uma extensão Chrome para contar comentários com menções @ em posts do Instagram e gerar ranking dos colaboradores mais mencionados.

## ✨ Funcionalidades

- **Análise Automática**: Escaneia comentários em posts do Instagram
- **Contagem de Menções**: Identifica e conta todas as menções @ nos comentários
- **Ranking em Tempo Real**: Exibe ranking dos colaboradores mais mencionados
- **Exportação de Dados**: Exporta resultados para Excel (.xlsx) e CSV
- **Interface Intuitiva**: Popup amigável com design inspirado no Instagram
- **Armazenamento Local**: Mantém dados entre sessões

## 🚀 Como Usar

### Instalação

1. Abra o Chrome e navegue para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta da extensão
5. A extensão será instalada e aparecerá na barra de ferramentas

### Uso da Extensão

1. **Navegue para o Instagram**: Abra o post da campanha no Instagram
2. **Abra a Extensão**: Clique no ícone da extensão na barra de ferramentas
3. **Escaneie os Comentários**: Clique em "Escanear Comentários do Post"
4. **Visualize o Ranking**: Veja o ranking dos colaboradores em tempo real
5. **Exporte os Dados**: Use os botões de exportação para salvar os resultados

## 🎯 Funcionalidades da Campanha

A extensão foi desenvolvida especificamente para a campanha:
**"Dinâmica Instagram: Quem é o Melhor Colaborador da B&O"**

### Como Funciona a Campanha

- Participantes comentam @ do colaborador que querem apoiar
- Cada comentário vale 1 ponto para o colaborador
- A extensão conta automaticamente todos os @mentions
- Gera ranking com 1º, 2º e 3º lugares

## 📋 Requisitos Técnicos

- Google Chrome 88+
- Permissões para acessar instagram.com
- Permissão para downloads (para exportação)

## 🔧 Estrutura do Projeto

```
Extensão Instagram/
├── manifest.json          # Configuração da extensão
├── popup.html             # Interface principal
├── popup.js               # Lógica da interface
├── content.js             # Script que analisa a página
├── background.js          # Service worker
├── styles.css             # Estilos para página
├── icons/                 # Ícones da extensão
└── README.md              # Documentação
```

## 📊 Como Funciona

### 1. Detecção de Comentários

- Utiliza múltiplos seletores CSS para encontrar comentários
- Filtra elementos que não são comentários reais
- Evita duplicatas na contagem

### 2. Extração de Menções

- Usa regex para identificar padrões @ nos comentários
- Valida usernames (filtros para menções inválidas)
- Conta menções únicas por colaborador

### 3. Geração de Ranking

- Ordena colaboradores por número de menções
- Exibe top 10 com medalhas para primeiros lugares
- Mostra estatísticas totais

### 4. Exportação de Dados

- **CSV**: Formato compatível com Excel
- **Excel**: Arquivo .xlsx para análise avançada
- Inclui timestamp e metadados da análise

## 🎨 Interface

### Popup Principal

- **Header**: Logo e título da campanha
- **Seção de Análise**: Botão para escanear comentários
- **Ranking**: Lista dos top colaboradores com medalhas
- **Exportação**: Botões para CSV e Excel

### Indicador Visual

- Ícone discreto na página do Instagram
- Mostra quando a extensão está ativa
- Feedback visual durante análise

## ⚡ Performance

### Otimizações

- Carregamento inteligente de comentários
- Scroll automático para capturar mais dados
- Cache local para evitar re-análises
- Filtragem eficiente de elementos duplicados

### Limitações

- Depende da estrutura HTML do Instagram
- Limitado a comentários visíveis na página
- Pode necessitar scroll manual em posts com muitos comentários

## 🔒 Privacidade e Segurança

- **Dados Locais**: Todos os dados ficam no navegador do usuário
- **Sem Envio Externo**: Nenhuma informação é enviada para servidores
- **Permissões Mínimas**: Apenas acesso ao Instagram e downloads
- **Código Aberto**: Todo código é auditável

## 📈 Métricas Capturadas

- Total de comentários analisados
- Número de menções únicas
- Ranking completo de colaboradores
- Timestamp da análise
- Histórico de scans

## 🛠️ Desenvolvimento

### Estrutura de Arquivos

- `manifest.json`: Configuração e permissões
- `popup.*`: Interface do usuário
- `content.js`: Análise da página Instagram
- `background.js`: Service worker para comunicação
- `styles.css`: Estilos para elementos injetados

### APIs Utilizadas

- Chrome Extensions API
- Chrome Storage API
- Chrome Downloads API
- DOM APIs para análise da página

## 🐛 Troubleshooting

### ⚠️ Problemas? Leia o guia completo!

**📖 Consulte o arquivo [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) para soluções detalhadas.**

### Problemas Comuns

**Extensão não aparece:**

- Verifique se o modo desenvolvedor está ativo
- Recarregue a extensão em `chrome://extensions/`

**❌ "Nenhum comentário encontrado":**

- **MAIS COMUM** - Execute o script `debug.js` no console
- Certifique-se de estar em um **post** do Instagram (não perfil/stories)
- Role a página para carregar mais comentários
- Aguarde carregamento completo da página

**Exportação não funciona:**

- Verifique permissões de download no Chrome
- Certifique-se de que há dados para exportar

### 🔍 Debug Rápido

```javascript
// Cole no console do Chrome (F12) para diagnóstico:
// Copie todo o conteúdo do arquivo debug.js
```

## 📝 Notas de Versão

### v1.0.0

- Lançamento inicial
- Análise básica de comentários
- Ranking de colaboradores
- Exportação CSV/Excel
- Interface responsiva

### v1.1.0

- **Divisão de Resultados**: Os valores exibidos no popup agora são divididos por 2 para atender a uma nova regra de cálculo.
- **Botão de Limpar Resultados**: Adicionado botão para limpar os resultados diretamente no popup.
- **Melhorias na Interface**: Ajustes visuais e feedbacks mais claros para o usuário.

## 🤝 Suporte

Para suporte técnico ou dúvidas sobre a extensão:

- Verifique os logs do console do Chrome (F12)
- Teste em uma aba privada para descartar conflitos
- Certifique-se de estar na versão mais recente do Chrome

## 📊 Campanha B&O

Esta extensão foi desenvolvida especificamente para apoiar a campanha de engajamento da B&O no Instagram, permitindo uma contagem precisa e transparente dos votos para eleger o "Melhor Colaborador da B&O".

---

**Desenvolvido para a campanha B&O Instagram 2025** 🏆

### Como Funciona a Contagem

- A contagem é realizada diretamente através do código fonte da página do Instagram.
- Apenas menções válidas (@username) são contabilizadas, seguindo critérios rigorosos de validação.
- Menções são extraídas de elementos HTML específicos que indicam claramente o uso de @ como menção.
- Comentários duplicados ou inválidos são ignorados para garantir precisão nos resultados.
