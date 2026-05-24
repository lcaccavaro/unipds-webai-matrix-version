# WEBAI Matrix

Projeto WEBAI Matrix é uma interface web inspirada no visual do filme Matrix que usa APIs nativas de IA do Google Chrome para gerar respostas em tempo real.

## Sobre o projeto

- Interface full-screen estilo terminal Matrix.
- Interação por texto com modelo de linguagem nativo do navegador.
- Parâmetros de ajuste `temperature` e `topK` para controlar o comportamento da IA.
- Não usa servidor remoto de IA: a inteligência é acessada diretamente pela API nativa do Chrome.

## Requisitos mínimos de hardware

Para executar este projeto com boa experiência, recomendamos pelo menos:

- CPU: Processador quad-core moderno (Intel i5 ou equivalente AMD)
- Memória RAM: 8 GB ou mais
- GPU integrada ou discreta compatível com aceleração do navegador
- Disco: 1 GB livre para arquivos e cache do navegador
- Conexão: requisição local, não exige internet permanente após o download do modelo

> Observação: alguns recursos de IA nativa dependem do suporte do dispositivo e do navegador; dispositivos mais antigos podem não suportar o modelo.

## Requisitos de software

- Google Chrome ou Chrome Canary (versão recente)
- Node.js 20.x ou superior
- npm (vem junto com o Node.js)

## Instalação do Node.js

### Windows

1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendado) ou a mais recente compatível.
3. Execute o instalador e siga os passos padrão.
4. Abra o PowerShell e verifique a instalação:

```powershell
node --version
npm --version
```

### macOS / Linux

Você também pode instalar via gerenciador de pacotes ou usando o instalador oficial.

```bash
node --version
npm --version
```

### Versão recomendada

- Node.js: `20.x` ou superior
- npm: versão compatível com a instalação do Node

## Como executar o projeto

1. Abra o terminal na pasta do projeto:

```powershell
cd "~\unipds-webai-matrix-version"
```

2. Instale as dependências:

```powershell
npm install
```

3. Inicie o servidor local:

```powershell
npm start
```

4. Abra o navegador e acesse:

```text
http://127.0.0.1:8080
```

## Ativar IA no Chrome

### Passo a passo para habilitar a flag necessária

1. Abra o Chrome.
2. Na barra de endereço, acesse:

```text
chrome://flags
```

3. Busque por:

- `Prompt API for Gemini Nano`

4. Altere para `Enabled`.
5. Reinicie o Chrome.

### Caso não encontre a flag

- Atualize o Chrome ou use o Chrome Canary.
- As APIs de IA nativas ainda estão em desenvolvimento, então algumas versões podem não exibir a flag.

## Observações finais

- Caso o modelo nativo de IA não esteja disponível, o projeto exibirá mensagens com instruções para ativar ou baixar o modelo.
- A interface foi projetada para dar a sensação de terminal Matrix enquanto você interage com o modelo.
