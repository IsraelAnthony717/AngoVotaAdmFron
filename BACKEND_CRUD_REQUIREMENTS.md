# Backend CRUD Requirements - Candidatos

Este documento detalha os endpoints que o backend Node.js deve implementar para suportar as operações CRUD completas de candidatos no novo componente `CriarCandidato`.

## 📋 Resumo das Mudanças Frontend

O componente `CriarCandidato` foi completamente refatorado para:
- ✅ Adicionar campo **COR** na criação/edição de candidatos
- ✅ Implementar operações **CRUD** (Create, Read, Update, Delete)
- ✅ Exibir lista de candidatos com cards responsivos
- ✅ Permitir edição e eliminação inline
- ✅ Toda lógica no backend (validação, persistência, etc.)

---

## 🔌 Endpoints Necessários

### 1. **GET /candidatos**
Busca a lista completa de candidatos.

**Resposta (200)**:
```json
[
  {
    "id": 1,
    "numero": 1,
    "nome": "João Silva",
    "partido": "Partido A",
    "idade": 45,
    "slogan": "Juntos pelo Futuro",
    "descricao": "Candidato experiente com foco em educação",
    "cor": "#3b82f6",
    "foto_url": "http://localhost:3003/uploads/candidatos/1/foto.jpg",
    "backgroundurl": "http://localhost:3003/uploads/candidatos/1/fundo.jpg",
    "criando_em": "2026-04-12T10:30:00Z"
  },
  ...
]
```

---

### 2. **GET /candidatos/:id**
Busca um candidato específico pelo ID (usado para edição).

**Parâmetros**:
- `id` (URL param): ID do candidato

**Resposta (200)**:
```json
{
  "id": 1,
  "numero": 1,
  "nome": "João Silva",
  "partido": "Partido A",
  "idade": 45,
  "slogan": "Juntos pelo Futuro",
  "descricao": "Candidato experiente com foco em educação",
  "cor": "#3b82f6",
  "foto_url": "http://localhost:3003/uploads/candidatos/1/foto.jpg",
  "backgroundurl": "http://localhost:3003/uploads/candidatos/1/fundo.jpg",
  "criando_em": "2026-04-12T10:30:00Z"
}
```

**Respostas de Erro**:
- `404`: Candidato não encontrado
- `500`: Erro do servidor

---

### 3. **POST /candidatos/criar**
Cria um novo candidato com fotos usando `multipart/form-data`.

**Content-Type**: `multipart/form-data`

**Campos do Formulário**:
| Campo | Tipo | Obrigatório | Validação |
|-------|------|------------|-----------|
| `nome` | String | ✅ | Max 100 chars |
| `partido` | String | ✅ | Max 50 chars |
| `idade` | Number | ✅ | 18-120 |
| `slogan` | String | ✅ | Max 150 chars |
| `descricao` | String | ✅ | Max 500 chars |
| `cor` | String | ✅ | Formato HEX (#RRGGBB) |
| `foto` | File | ✅ | JPEG, PNG (Max 5MB) |
| `fundo` | File | ✅ | JPEG, PNG (Max 10MB) |

**Lógica Backend**:
1. Validar todos os campos
2. Validar formatos de arquivo (MIME types)
3. Validar tamanhos de arquivo
4. Salvar arquivos em `/uploads/candidatos/{id}/`
5. Armazenar URLs completas no banco de dados
6. Atribuir número sequencial automático
7. Registar timestamp de criação

**Resposta (201)**:
```json
{
  "id": 1,
  "numero": 1,
  "nome": "João Silva",
  "partido": "Partido A",
  "idade": 45,
  "slogan": "Juntos pelo Futuro",
  "descricao": "Candidato experiente com foco em educação",
  "cor": "#3b82f6",
  "foto_url": "http://localhost:3003/uploads/candidatos/1/foto.jpg",
  "backgroundurl": "http://localhost:3003/uploads/candidatos/1/fundo.jpg",
  "criando_em": "2026-04-12T10:30:00Z"
}
```

**Respostas de Erro**:
- `400`: Validação fallou
  ```json
  {
    "error": "Campo 'nome' é obrigatório"
  }
  ```
- `413`: Arquivo muito grande
- `500`: Erro do servidor

---

### 4. **PUT /candidatos/atualizar/:id**
Atualiza um candidato existente. Fotos são opcionais.

**Content-Type**: `multipart/form-data`

**Parâmetros**:
- `id` (URL param): ID do candidato a atualizar

**Campos do Formulário** (todos opcionais, exceto aqueles que devem ser atualizados):
| Campo | Tipo | Obrigatório | Validação |
|-------|------|------------|-----------|
| `nome` | String | ⚫ | Max 100 chars |
| `partido` | String | ⚫ | Max 50 chars |
| `idade` | Number | ⚫ | 18-120 |
| `slogan` | String | ⚫ | Max 150 chars |
| `descricao` | String | ⚫ | Max 500 chars |
| `cor` | String | ⚫ | Formato HEX (#RRGGBB) |
| `foto` | File | ⭕ | JPEG, PNG (Max 5MB) - opcional, se fornecido substitui anterior |
| `fundo` | File | ⭕ | JPEG, PNG (Max 10MB) - opcional, se fornecido substitui anterior |

**Lógica Backend**:
1. Validar candidato existe (404 se não)
2. Validar campos fornecidos (se houver)
3. Se novos arquivos fornecidos:
   - Validar MIME types e tamanhos
   - Deletar arquivos antigos
   - Salvar novos em `/uploads/candidatos/{id}/`
4. Atualizar apenas campos mudados
5. Não modificar IDs, datas de criação ou número

**Resposta (200)**:
```json
{
  "id": 1,
  "numero": 1,
  "nome": "João Silva (Atualizado)",
  "partido": "Partido A",
  "idade": 46,
  "slogan": "Novo Slogan",
  "descricao": "Descrição atualizada",
  "cor": "#ef4444",
  "foto_url": "http://localhost:3003/uploads/candidatos/1/foto.jpg",
  "backgroundurl": "http://localhost:3003/uploads/candidatos/1/fundo.jpg",
  "criando_em": "2026-04-12T10:30:00Z"
}
```

**Respostas de Erro**:
- `400`: Validação fallou
- `404`: Candidato não encontrado
- `413`: Arquivo muito grande
- `500`: Erro do servidor

---

### 5. **DELETE /candidatos/apagar/:id**
Elimina um candidato e seus arquivos associados.

**Parâmetros**:
- `id` (URL param): ID do candidato a eliminar

**Lógica Backend**:
1. Validar candidato existe (404 se não)
2. Deletar arquivos em `/uploads/candidatos/{id}/`
3. Deletar registro do banco de dados
4. Verificar se existem votos/referências (se houver constraint, tratar apropriadamente)

**Resposta (200)**:
```json
{
  "mensagem": "Candidato eliminado com sucesso",
  "id": 1
}
```

**Respostas de Erro**:
- `404`: Candidato não encontrado
- `409`: Conflito (ex: candidato tem votos associados - se for regra de negócio)
- `500`: Erro do servidor

---

## 📊 Schema do Banco de Dados

A tabela `candidatos` deve ter a seguinte estrutura:

```sql
CREATE TABLE candidatos (
  id SERIAL PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,  -- Auto-incrementável, baseado em ordem de criação
  nome VARCHAR(100) NOT NULL,
  partido VARCHAR(50) NOT NULL,
  idade INTEGER NOT NULL CHECK (idade >= 18 AND idade <= 120),
  slogan VARCHAR(150),
  descricao TEXT,
  cor VARCHAR(7) NOT NULL DEFAULT '#3b82f6',  -- Formato HEX
  foto_url VARCHAR(500),  -- URL completa da imagem de perfil
  backgroundurl VARCHAR(500),  -- URL completa da imagem de fundo
  criando_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  criado_por INTEGER REFERENCES utilizadores(id),  -- Se houver autenticação
  ativo BOOLEAN DEFAULT TRUE
);
```

---

## 🔄 Fluxos Implementados Frontend

### Fluxo de Criação
1. Usuário clica "➕ Novo Candidato"
2. Form aparece em modo `criar`
3. Usuário preenche campos e seleciona imagens
4. `POST /candidatos/criar` com FormData
5. Se sucesso → Recarrega lista
6. Se erro → Exibe mensagem de erro com detalhes

### Fluxo de Edição
1. Usuário clica "✏️ Editar" em um candidato
2. Form aparece em modo `editar` com dados preenchidos
3. Imagens mostram preview (opcional substituição)
4. Usuário modifica campos desejados
5. `PUT /candidatos/atualizar/{id}` com FormData (apenas campos mudados)
6. Se sucesso → Recarrega lista
7. Se erro → Exibe mensagem de erro

### Fluxo de Eliminação
1. Usuário clica "🗑️ Eliminar"
2. Confirma ação em dialog
3. `DELETE /candidatos/apagar/{id}`
4. Se sucesso → Recarrega lista com sucesso
5. Se erro → Exibe mensagem de erro

---

## ✅ Checklist de Implementação Backend

- [ ] Criar/atualizar tabela `candidatos` com novo campo `cor`
- [ ] Implementar endpoint `GET /candidatos` com listagem completa
- [ ] Implementar endpoint `GET /candidatos/:id` para busca individual
- [ ] Implementar endpoint `POST /candidatos/criar` com upload de fotos
  - [ ] Validação de campos
  - [ ] Validação de MIME types
  - [ ] Validação de tamanhos
  - [ ] Geração automática de `numero`
  - [ ] Armazenamento de arquivos
  - [ ] Registro no BD
- [ ] Implementar endpoint `PUT /candidatos/atualizar/:id`
  - [ ] Atualização parcial de campos
  - [ ] Substituição opcional de fotos
  - [ ] Preservação de `id`, `numero`, `criando_em`
- [ ] Implementar endpoint `DELETE /candidatos/apagar/:id`
  - [ ] Eliminação de arquivos
  - [ ] Eliminação de registro
  - [ ] Tratamento de conflitos (se houver)
- [ ] Adicionar tratamento de erros robusto
- [ ] Adicionar logs detalhados
- [ ] Adicionar validação de CORS (frontend em localhost:4200, backend em localhost:3003)
- [ ] Testar todos os endpoints com Postman/Insomnia

---

## 🔐 Observações Importantes

1. **Autenticação/Autorização**: Considere adicionar middleware para verificar permissões (quem pode criar/editar/deletar)

2. **Validação Backend Obrigatória**: Todos os campos devem ser validados no backend, não confiar apenas na validação frontend

3. **Tamanhos de Arquivo**:
   - Foto: max 5MB (recomendado: JPEG 300x300px ou PNG equivalente)
   - Fundo: max 10MB (recomendado: JPEG 1920x1080px ou equivalente)

4. **Armazenamento de Arquivos**: 
   - Criar estrutura: `/uploads/candidatos/{id}/foto.jpg` e `/uploads/candidatos/{id}/fundo.jpg`
   - Ou usar serviço cloud (AWS S3, Azure Blob, etc.)
   - Retornar URLs completas que possam ser acessadas pelo frontend

5. **Número de Candidato**:
   - Deve ser automático e sequencial (1, 2, 3, ...)
   - Não deve ser modificável via edição
   - Se um candidato for deletado, o número não é reutilizado

6. **Tratamento de Erro**: Sempre retornar `error` no JSON com mensagem clara para o frontend exibir

---

## 📝 Exemplo Completo de Requisição

### Criar Candidato
```bash
curl -X POST http://localhost:3003/candidatos/criar \
  -F "nome=João Silva" \
  -F "partido=MPLA" \
  -F "idade=45" \
  -F "slogan=Juntos pelo Futuro" \
  -F "descricao=Candidato experiente" \
  -F "cor=#3b82f6" \
  -F "foto=@./photo.jpg" \
  -F "fundo=@./background.jpg" \
  --cookie "JSESSIONID=..." \
  -v
```

### Atualizar Candidato
```bash
curl -X PUT http://localhost:3003/candidatos/atualizar/1 \
  -F "nome=João Silva (Atualizado)" \
  -F "idade=46" \
  -F "cor=#ef4444" \
  --cookie "JSESSIONID=..." \
  -v
```

### Eliminar Candidato
```bash
curl -X DELETE http://localhost:3003/candidatos/apagar/1 \
  --cookie "JSESSIONID=..." \
  -v
```

---

## 🧪 Testes Recomendados

1. **Criar candidato com e sem imagens**
2. **Atualizar apenas alguns campos**
3. **Atualizar imagens mantendo outros dados**
4. **Deletar candidato e verificar limpeza de arquivos**
5. **Validar recusa de campos inválidos**
6. **Validar recusa de arquivos muito grandes**
7. **Verificar lista após criar/editar/deletar**
8. **Verificar números sequenciais**
9. **Verificar URLs de retorno são acessíveis**
10. **Testar CORS com frontend**
