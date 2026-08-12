# AGENTS.md — Lista de Presentes Happy Kids

## Objetivo do produto

Construir de forma iterativa uma aplicação web responsiva para a Happy Kids
gerenciar listas de presentes de aniversário e compartilhá-las por um link
público. Vendedoras criam listas, enviam fotos dos brinquedos, controlam itens
vendidos e compartilham o catálogo. Convidados visualizam uma experiência leve,
bonita, clara e confiável, prioritariamente no celular.

O produto substitui fotos de telas de tablet enviadas por WhatsApp por um link
organizado, rápido e de boa qualidade. A interface deve ser acolhedora para
famílias e crianças, sem perder eficiência para a vendedora.

## Estado implementado do produto

- A administração permite autenticação de vendedoras, criação de listas,
  cadastro de brinquedos com uma foto, alteração de disponibilidade, remoção de
  brinquedos e exclusão de listas. A exclusão remove os brinquedos em cascata e
  tenta limpar as fotos correspondentes no Storage, avisando quando restar um
  arquivo órfão.
- A administração foi refinada para uso mobile-first: cartões de itens têm
  miniaturas e ações compactas; os controles seguem hierarquia visual entre
  ação principal, secundária e destrutiva, sem botões excessivamente grandes ou
  agressivos.
- A prévia de foto representa sempre um único arquivo selecionado. Ao remover,
  concluir o envio ou iniciar um novo cadastro sem foto, ela é reinicializada
  por completo: imagem, nome do arquivo, estado temporário e ação de remover
  não podem permanecer visíveis.
- O catálogo público usa exclusivamente as RPCs get_public_gift_list e
  get_public_gift_items; ele não consulta tabelas administrativas diretamente.
  Trata os estados de carregamento, erro e lista vazia, exibe os presentes em
  galeria compacta e responsiva e oferece galeria acessível com teclado e gesto
  de deslizar.
- No celular, a lista pública privilegia uma grade compacta de fotos, em vez de
  cartões altos, preservando imagem, nome, preço e status legíveis. Em telas
  maiores, a composição ganha espaço sem ampliar fotos ou controles de modo
  desproporcional.
- A imagem e o botão “Ver foto ampliada” abrem a mesma galeria. O botão não é
  apenas informativo: possui ação e pode ser acionado por teclado.
- Itens disponíveis exibem, já no cartão, um CTA secundário de interesse pelo
  WhatsApp. A galeria mantém esse CTA como sua ação principal. Itens comprados
  permanecem visíveis, mas não exibem CTA de compra.
- O número comercial é uma configuração pública única em js/config.js, na
  constante STORE_WHATSAPP_NUMBER. Ele deve conter somente dígitos, com DDI e
  DDD, antes da publicação de qualquer CTA de interesse pelo WhatsApp.
- A configuração real do Supabase, o schema SQL, as políticas RLS, o bucket e
  o perfil inicial de vendedora continuam sendo pré-requisitos de publicação.
  Eles devem ser confirmados no ambiente real antes de considerar o produto
  pronto para uso externo.

## Forma de trabalhar

- A colaboração é incremental. Antes de uma alteração relevante, confirme o
  estado atual e implemente somente o próximo recorte necessário.
- Antes de alterar código, banco, estilos, arquivos ou configuração, apresente
  o recorte proposto, sua lógica e impacto, e peça autorização explícita da
  pessoa responsável. Aguarde a autorização antes de executar.
- Atualizações deste próprio AGENTS.md solicitadas pela pessoa responsável
  podem ser feitas imediatamente.
- Após a autorização, explique em linguagem simples quais arquivos participam,
  por que existem, como os dados fluem e o que foi validado. Não entregue
  apenas código pronto.
- Explique brevemente o que será feito, execute, valide e informe o resultado.
  Não invente requisitos de negócio quando uma decisão mudar materialmente o
  produto; apresente a dúvida à pessoa responsável.
- Preserve alterações existentes que não sejam relacionadas à tarefa.
- Ao receber o comando para iniciar o projeto, comece pela estrutura de pastas
  e pela configuração do cliente Supabase usando o CDN oficial do Supabase JS.
- A interface, os textos de erro e a documentação são em português do Brasil,
  salvo instrução contrária.

## Stack e restrições

- Use HTML5 semântico, CSS3 puro e JavaScript Vanilla ES6+ com type="module".
- Não use React, Vue, Angular, jQuery, bibliotecas de UI, bundlers ou
  frameworks JavaScript sem autorização explícita.
- Use o SDK oficial do Supabase via CDN para banco, Storage e autenticação.
- Prefira async/await, fetch quando aplicável e módulos ECMAScript.
- Mantenha o projeto simples e estático por padrão: ele deve poder ser servido
  por qualquer hospedagem de arquivos estáticos.

## Organização de arquivos

Separe responsabilidades sem fragmentar arquivos artificialmente. Crie um novo
módulo ou folha de estilo somente quando houver uma responsabilidade clara ou
quando o arquivo atual deixar de ser compreensível.

Estrutura de referência:

    /
    ├── index.html                 # entrada pública ou redirecionamento
    ├── lista.html                 # catálogo público de uma criança
    ├── admin.html                 # entrada da área administrativa
    ├── admin-list.html            # gestão de uma lista específica
    ├── assets/
    │   ├── icons/
    │   └── images/
    ├── css/
    │   ├── base.css               # reset, tokens, tipografia e utilitários
    │   ├── layout.css             # contêineres, grid e cabeçalhos
    │   ├── components.css         # botões, cards, formulários e estados
    │   ├── public-list.css        # particularidades da página pública
    │   └── admin.css              # particularidades da administração
    ├── js/
    │   ├── config.js              # URL e chave pública do Supabase; sem segredos
    │   ├── supabase-client.js     # inicialização única do cliente
    │   ├── services/
    │   │   ├── auth-service.js    # sessão e autenticação
    │   │   ├── lists-service.js   # consultas e mutações de gift_lists
    │   │   ├── items-service.js   # consultas e mutações de gift_items
    │   │   ├── public-lists-service.js # leituras públicas via RPC
    │   │   └── storage-service.js # upload/remoção de imagens
    │   ├── ui/
    │   │   ├── image-picker.js    # seleção, prévia e reset de foto
    │   │   ├── item-card.js       # renderização dos cartões públicos
    │   │   └── public-gallery.js  # modal, teclado e gesto da galeria
    │   └── pages/
    │       ├── admin.js           # orquestra admin.html
    │       ├── admin-list.js      # orquestra admin-list.html
    │       └── public-list.js     # orquestra lista.html
    └── supabase/
        └── schema.sql             # schema, políticas e instruções de Storage

Adapte essa referência ao tamanho e aos arquivos reais do projeto. HTML não
deve conter JavaScript ou CSS inline, exceto quando estritamente necessário por
um caso técnico documentado. Cada página importa somente os estilos e módulos
de que precisa.

## Arquitetura do front-end

- Páginas em js/pages coordenam eventos, estado de tela e módulos de UI.
- Serviços em js/services encapsulam exclusivamente chamadas ao Supabase; eles
  não manipulam o DOM.
- Módulos de UI criam e atualizam a interface; eles não conhecem detalhes de
  consultas, chaves ou regras de autorização.
- Centralize a configuração em js/config.js e a instância em
  js/supabase-client.js. Nunca duplique credenciais ou crie múltiplos clientes
  sem necessidade.
- Use textContent, createElement e validação de dados para conteúdo vindo do
  banco. Não injete conteúdo externo com innerHTML.
- Durante operações assíncronas, desabilite somente a ação em andamento,
  apresente um estado de carregamento e restaure a interface em caso de falha.
- Sempre trate lista vazia, carregamento, erro de rede, imagem ausente e
  operação concluída.

## Design, UX, responsividade e acessibilidade

### Sistema visual obrigatório

Os tokens de marca abaixo são a fonte de verdade. Não altere nomes, valores,
famílias tipográficas nem a capitalização de seus valores sem autorização
explícita. Novos estilos devem consumir esses tokens, e não introduzir outra
paleta ou outra tipografia de marca.

    :root {
      --logo-rosa: #d73d6f;
      --logo-laranja: #f66a09;
      --logo-azul: #24b1a1;
      --logo-verde: #7CBc42;

      --fonte-titulos: 'Fredoka', sans-serif;
      --fonte-textos: 'Nunito', sans-serif;
    }

- Use Fredoka nos títulos, preços e chamadas de maior destaque; use Nunito em
  textos corridos, menus, rótulos, campos e descrições.
- Use obrigatoriamente os tokens acima para toda cor e tipografia de marca.
  Para neutros, espaçamento, raios e sombras, mantenha valores de apoio
  consistentes e contidos, sem criar um segundo sistema de identidade ou
  renomear, redefinir ou substituir os tokens de marca.
- A identidade deve ser alegre e infantil sem cair em excesso de elementos,
  cores ou sombras. Priorize superfícies claras, contraste legível e espaços
  consistentes.
- Cores de marca comunicam prioridade e estado, mas nunca são a única forma de
  transmitir informação. Neutros e bordas de apoio devem preservar contraste e
  legibilidade.

### Composição mobile-first

- Desenvolva primeiro para telas estreitas. A visão pública é prioritariamente
  de celular; a administração deve funcionar bem em celular e tablet.
- Use Flexbox e Grid com breakpoints baseados no conteúdo, e não em um modelo
  específico de aparelho.
- No catálogo público, a galeria inicial deve ser compacta: cards curtos,
  grade de duas colunas quando o espaço permitir, miniaturas com proporção
  consistente e conteúdo essencial visível sem rolagem excessiva. Em larguras
  maiores, expanda a grade e o respiro, nunca o tamanho dos controles de forma
  desproporcional.
- Na administração, prefira item compacto com miniatura limitada, informações
  organizadas e ações agrupadas. Fotos, cartões e botões não devem dominar a
  tela em celulares.
- Todos os botões devem ter área de toque confortável, mas aparência contida.
  Diferencie ação principal, secundária e destrutiva por peso visual,
  preenchimento, borda e cor; ações irreversíveis não devem competir com a ação
  principal nem parecer uma escolha casual.

### Semântica e acesso

- Use elementos semânticos: header, main, section, nav, form, button e label,
  com rótulos visíveis e hierarquia correta de títulos.
- Garanta foco de teclado visível, contraste adequado, áreas de toque
  confortáveis e mensagens de retorno anunciadas quando pertinente por
  aria-live.
- O estado de um presente não pode depender apenas de cor: use selo e texto,
  como “Disponível” ou “Comprado”. Itens vendidos continuam visíveis, porém
  visualmente distintos.
- Imagens devem ter alt útil. Se uma foto falhar, mostre fallback elegante.
- Qualquer elemento anunciado como ação deve executar essa ação. Em especial,
  “Ver foto ampliada” deve ser um botão acessível, acionar a mesma abertura da
  imagem e não depender exclusivamente de toque na foto.

### Fluxo de fotos para vendedoras

- Ao cadastrar cada brinquedo, ofereça duas ações igualmente visíveis: “Tirar
  foto agora” e “Escolher da galeria”. A primeira acelera o registro de um item
  que está à frente da vendedora; a segunda reaproveita fotos existentes.
- Implemente-as como dois inputs de arquivo associados a botões ou rótulos
  acessíveis. Ambos usam accept="image/*"; somente o input de captura usa
  capture="environment" para sugerir a câmera traseira. Não dependa de capture
  como requisito: o suporte varia entre navegadores, e o seletor de arquivos é
  o fallback universal.
- Aceite uma foto por item. Depois da seleção, mostre prévia, nome do arquivo e
  ações “Trocar foto” e “Remover foto” antes de enviar o formulário.
- A interface de prévia só pode aparecer quando houver arquivo selecionado.
  Ao remover a foto, finalizar com sucesso o cadastro ou preparar o próximo
  item, limpe integralmente a prévia: URL da imagem, texto/nome de arquivo,
  metadados, estados internos e links ou botões de remoção. Nunca deixe
  conteúdo residual de uma foto anterior.
- Valide tipo real e tamanho do arquivo no cliente e novamente pelas regras do
  Storage. Recuse arquivos que não sejam imagem, dê mensagem compreensível e
  nunca confie somente no atributo accept.
- Antes do upload, reduza imagens excessivamente grandes no navegador,
  mantendo proporção e boa qualidade para catálogo: meta inicial de lado maior
  até 1.600 px e JPEG/WebP com qualidade aproximada de 0,82, quando a conversão
  for suportada. Preserve o arquivo original como fallback se a conversão
  falhar.
- Durante o envio, mostre prévia e progresso ou estado de envio, bloqueando
  somente o botão de salvar correspondente. Após sucesso, limpe dados
  temporários e use a URL retornada pelo Storage.

## Dados e Supabase

O modelo inicial contém gift_lists, gift_items e o bucket público toys_images.
Ao preparar o schema, prefira:

- gift_lists: id UUID/PK, child_name, event_date, public_slug único e
  created_at.
- gift_items: id UUID/PK, list_id como FK com remoção em cascata, title, preço
  numérico opcional, image_url, image_path, status limitado aos valores
  available e sold, e created_at. image_url é usado na interface; image_path é
  o caminho interno do Storage e deve ser usado para remover a foto com
  segurança.
- Índices para gift_items.list_id e gift_lists.public_slug.
- O slug público deve ser opaco, único e difícil de adivinhar; o link público
  usa o slug em vez de expor uma interface administrativa.
- A leitura pública não recebe acesso direto às tabelas. Exponha somente RPCs
  de leitura que retornem os campos necessários para uma lista publicada e seu
  slug; mantenha consultas administrativas restritas a vendedoras
  autenticadas.
- Crie perfis de vendedoras a partir de auth.users e autorize operações
  administrativas por uma função de verificação de papel usada pelas políticas
  RLS. Nunca use metadados editáveis da usuária como fonte de autorização.

Valide no cliente campos obrigatórios, formatos de data, preço e arquivos de
imagem antes do upload. Use nomes de arquivo únicos, associados à lista e ao
item, e considere limites de tamanho e tipos MIME aceitos.

Ao criar um item, envie primeiro a foto e grave no banco a URL pública e o
caminho retornado pelo Storage. Se a gravação no banco falhar, tente apagar a
foto recém-enviada. Ao remover um item, remova seu registro e tente remover o
arquivo pelo image_path, informando se restar uma foto órfã.

### Segurança obrigatória

- A chave anon pode ser usada no front-end; a service_role nunca pode ser
  incluída, versionada ou exposta no navegador.
- Ative Row Level Security (RLS) e escreva políticas explícitas antes de tratar
  a área administrativa como pronta para produção.
- A leitura pública deve se limitar aos dados necessários para exibir listas e
  itens. Escrita, mudança de status e uploads devem exigir usuárias
  autenticadas e autorizadas.
- Um acesso simples inicial pode existir somente como etapa temporária; a
  arquitetura deve continuar compatível com Supabase Auth e RLS.
- Não registre chaves, tokens, dados pessoais desnecessários ou URLs assinadas
  em logs e mensagens de erro.

## Funcionalidades essenciais

### Administração

1. Criar e listar aniversariantes com nome e data do evento.
2. Adicionar brinquedos com foto, título ou descrição curta e preço opcional.
3. Marcar itens como comprados, desfazer a marcação e remover itens.
4. Gerar e copiar o link público de cada lista, com feedback claro.

### Configuração comercial

1. Manter o número do WhatsApp da loja em uma configuração pública centralizada
   no formato internacional somente com dígitos, por exemplo 5585....
2. Não armazenar esse número em cada brinquedo, salvo se futuramente houver
   vendedores ou canais de venda distintos.

### Catálogo público

1. Mostrar o nome da criança e a data do evento formatada para pt-BR.
2. Exibir brinquedos em galeria responsiva, com foto, nome e preço quando ele
   existir.
3. Mostrar claramente itens disponíveis e comprados.
4. Exibir tela amigável para lista inexistente, vazia ou indisponível.

### Galeria e intenção de compra pelo WhatsApp

- Cada cartão de brinquedo deve permitir abrir a galeria modal em tela cheia
  pela imagem e pelo botão “Ver foto ampliada”. Use o elemento HTML nativo
  dialog com showModal(), inclua botão de fechar visível e mantenha fechamento
  por Esc.
- A galeria mostra a foto em tamanho amplo, nome, preço quando houver, status,
  contador “N de total”, controles anterior e próximo acessíveis e navegação
  por teclado. No celular, acrescente gesto horizontal de deslizar usando
  Pointer Events, sem impedir o uso dos botões.
- Ao abrir um item, a navegação percorre todos os itens da lista, inclusive os
  comprados. Itens comprados continuam visualizáveis, mas não exibem ação de
  compra e devem informar claramente que já foram adquiridos.
- Para todo item disponível, mostre no cartão um CTA de WhatsApp visível e de
  menor destaque que a abertura da foto. Dentro da galeria, mostre um único CTA
  principal: “Quero este presente pelo WhatsApp”.
- O CTA abre uma conversa Click-to-Chat em nova aba usando https://wa.me/ e o
  número da loja, sem +, espaços ou pontuação. Monte o texto com
  encodeURIComponent() e inclua saudação, nome da criança, nome do item, preço
  quando houver e URL da lista. Exemplo: “Olá! Quero comprar o presente ‘...’
  da lista de .... Link: ...”.
- O clique no WhatsApp expressa interesse; não reserva nem conclui a venda. A
  vendedora confirma disponibilidade e pagamento na conversa e somente então
  marca o item como comprado na administração. Isso evita reservas acidentais
  e conflitos quando duas pessoas escolhem o mesmo presente.
- Links externos usam target="_blank" com rel="noopener noreferrer". Se o
  aparelho não tiver WhatsApp, o link deve abrir a versão web ou informar
  simplesmente que a compra precisa ser concluída com a loja.

## Qualidade e verificação

- Antes de concluir uma alteração, confira caminhos de importação, erros do
  console, comportamento em viewport estreito e largo e todos os fluxos
  afetados.
- Para alterações visuais, confira especialmente: densidade da galeria pública,
  tamanho de fotos e botões no celular, hierarquia dos controles
  administrativos, foco de teclado, contraste e ausência de deslocamentos
  inesperados.
- Teste o fluxo de foto em sucesso, validação e falha de requisição; confirme
  que remover uma imagem ou iniciar outro cadastro não deixa nome, imagem,
  link ou botão residual na prévia.
- Teste a abertura da galeria tanto pela imagem quanto por “Ver foto ampliada”,
  e confirme que o CTA de WhatsApp aparece apenas em itens disponíveis, no
  cartão e na galeria.
- Para alterações de Supabase, valide que erros são capturados e que o estado
  visual só é atualizado após confirmação da operação.
- Mantenha comentários somente onde esclarecem uma decisão que o código não
  deixa evidente. Use nomes descritivos, em português ou inglês, de forma
  consistente dentro de cada domínio.
- Não declare uma funcionalidade concluída sem informar o que foi validado e o
  que ainda depende da configuração real do Supabase.
