# Configuração do banco e segurança

## 1. Executar o schema

1. No painel do Supabase, abra **SQL Editor**.
2. Crie uma nova consulta.
3. Copie todo o conteúdo de `supabase/schema.sql`, cole e escolha **Run**.
4. Confirme que surgiram as tabelas `profiles`, `gift_lists` e `gift_items`.
   Em **Storage**, confirme o bucket público `toys_images`.

O script pode ser executado novamente durante o desenvolvimento: ele preserva
os dados e recria apenas funções, gatilhos e políticas deste projeto.

## 2. Criar a primeira vendedora

1. No painel do Supabase, abra **Authentication > Users** e crie uma usuária
   com e-mail e senha que a loja controlará.
2. Copie o UUID dessa usuária.
3. No SQL Editor, rode a instrução abaixo, substituindo somente o UUID:

```sql
insert into public.profiles (id, role)
values ('COLE-O-UUID-DA-USUARIA-AQUI', 'seller');
```

Somente uma usuária que exista em `profiles` com o papel `seller` poderá criar
listas, alterar itens ou enviar fotos. Isso evita que qualquer pessoa que crie
uma conta obtenha acesso administrativo.

## 3. O que o link público pode acessar

Convidados não recebem acesso direto às tabelas. Eles só podem chamar duas
funções de leitura: `get_public_gift_list` e `get_public_gift_items`. Ambas
exigem o slug aleatório da lista e retornam apenas os campos necessários para a
vitrine.

As fotos ficam em um bucket público para carregarem bem no WhatsApp e no
catálogo. Porém, as políticas do Storage permitem que apenas vendedoras criem,
alterem ou removam arquivos cujo caminho começa com `gift-lists/`.

## Estrutura das fotos

Quando o upload for implementado, cada arquivo seguirá este formato:

```text
gift-lists/ID-DA-LISTA/ID-ALEATORIO.webp
```

Isso evita colisões de nome e organiza os arquivos por lista.

## Migração de fotos

Como o schema inicial já foi executado, rode também uma vez o conteúdo de
`supabase/002_add_image_path.sql` no **SQL Editor**. Esse novo campo guarda o
caminho interno do arquivo no Storage, permitindo remover a foto certa quando
um brinquedo for apagado pela administração.
