# Alexa Gemini Assistente (Skill Local)

Esta aplicação é uma *Skill* (Habilidade) para a Amazon Alexa, desenvolvida em Node.js, que interage diretamente com o modelo de inteligência artificial Gemini da Google. A aplicação funciona sob a forma de um servidor web com Express.js, permitindo que a possa executar e testar localmente no seu computador.

## O Que Faz?
Sempre que o utilizador faz uma pergunta à Alexa (por exemplo, *"Alexa, abre inteligencia artificial"* seguido de uma questão), a aplicação captura o texto pretendido e submete a consulta através da API oficial do Google Gemini. Assim que a Inteligência Artificial cria a resposta pretendida, o texto é reenviado para a Alexa, que imediatamente o lê em voz alta.

## Tecnologias e Funcionalidades Principais
- **Servidor Express Local:** Utiliza os pacotes `ask-sdk-core` e `ask-sdk-express-adapter`, simulando com toda a precisão o ambiente da Alexa sem necessidade de carregamento na cloud da AWS (Lambda).
- **Google Gemini SDK:** Implementado com o novo e oficial formato do `@google/genai` para enviar pedidos ao modelo ágil `gemini-2.5-flash`.
- **Pronto em Português:** As falas padrão do sistema, bem como o ficheiro de exportação de intenções (`models/pt-BR.json`), estão desenhados a pensar em ambientes da língua portuguesa.
- **Isolamento e Segurança:** Utiliza o `dotenv` para esconder chaves protegidas e evitar credenciais diretamente inseridas no código fonte.

## Pré-requisitos
- Necessita do [Node.js](https://nodejs.org/) instalado no seu computador.
- Registo numa conta no [Google AI Studio](https://aistudio.google.com/) para obter a sua chave da API (*API Key*).
- Uma ferramenta de túnel reverso, como o `cloudflared`, para divulgar publicamente o seu servidor quando comunicar com a consola da Alexa.

## Guia Rápido de Configuração e Execução

### 1. Instalar as Variáveis de Ambiente
Preencha a variável no ficheiro `.env` introduzindo a sua chave segura do Google AI Studio:
```env
GEMINI_API_KEY=introduza_a_sua_chave_do_gemini_aqui
PORT=3000
```

### 2. Iniciar a Aplicação
No terminal do seu computador, execute a instrução que vai instalar as bibliotecas, caso não as possua, e iniciar a sua escuta:
```bash
npm start
```
A partir daqui a aplicação fica disponível para dar resposta na ligação interna: `http://localhost:3000/alexa`.

### 3. Expor na Internet (Necessário para emparelhamento com a Alexa real)
Terá de correr uma plataforma como o cloudflared noutra janela para que a Amazon a encontre na internet:
```bash
cloudflared tunnel --url localhost:3000
```
Quando o cloudflared fornecer o *link* contendo "https", basta copiá-lo para afixá-lo como o "Endpoint" no seu projeto acedendo à consola da **Alexa Developer Console**.

### 4. Testes Iniciais
Utilize o ficheiro exportado chamado `insomnia.json` de forma a fazer algumas simulações imediatas do lançamento do menu e testes diretos de perguntas ao Gemini usando o programa [Insomnia](https://insomnia.rest/), mesmo que a Alexa não se encontre ligada!
