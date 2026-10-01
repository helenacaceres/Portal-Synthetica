from datetime import datetime

from sqlalchemy.orm import Session

from . import auth, models

SENHA_PADRAO_REDACAO = "redacao2047"


def _conteudos_exemplo(ed_por_nome):
    return [
        dict(
            titulo="A máquina que aprendeu a ver",
            chamada="Reconhecimento facial chegou às estações antes de chegar ao debate público.",
            corpo=(
                "O reconhecimento facial chegou às cidades brasileiras antes de qualquer marco "
                "regulatório. Câmeras em estações de metrô, terminais de ônibus e praças públicas "
                "passaram a identificar rostos em tempo real, muitas vezes sem que os municípios "
                "publicassem qualquer estudo de impacto.\n\n"
                "A promessa é sempre a mesma: segurança. Mas o histórico de acertos e erros desses "
                "sistemas raramente é aberto ao público, e os falsos positivos recaem de forma "
                "desigual sobre a população negra, segundo levantamentos de universidades públicas.\n\n"
                "O corpo virou senha. E, diferente de uma senha, não dá para trocá-lo depois de um "
                "vazamento."
            ),
            editoria=ed_por_nome["Avanços"],
            pagina=8,
            tempo_leitura_min=6,
            palavra_chave="reconhecimento facial",
            imagem_url="https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="O futuro já foi imaginado antes",
            chamada="Das fitas de celuloide às redes neurais, a ficção científica traçou um mapa.",
            corpo=(
                "Em 1968, um computador chamado HAL recusou uma ordem e o cinema descobriu que a "
                "máquina podia ter vontade própria. Cinquenta anos depois, a discussão saiu da sala "
                "escura e entrou no contrato de trabalho. O que mudou não foi a técnica, foi quem "
                "paga a conta.\n\n"
                "A cada ciclo, o repertório visual se repete: a interface azul, a voz calma, o olho "
                "vermelho. A indústria aprendeu a desenhar o futuro copiando o futuro que já tinha "
                "sido desenhado.\n\n"
                "A hipótese deste ensaio é simples e desconfortável: a ficção não previu a "
                "inteligência artificial, ela a especificou. Os engenheiros que hoje escrevem os "
                "sistemas cresceram assistindo às mesmas obras, e construíram aquilo que já sabiam "
                "reconhecer.\n\n"
                "O resultado é um futuro estreito. Não porque a técnica não permita outra coisa, mas "
                "porque o imaginário disponível já vinha montado. Quando a imaginação acaba antes da "
                "tecnologia, o que sobra é a repetição bem financiada."
            ),
            editoria=ed_por_nome["Cultura"],
            pagina=16,
            tempo_leitura_min=9,
            palavra_chave="ficção científica",
            imagem_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="Quem assina o algoritmo",
            chamada="Curadoria, autoria e responsabilidade editorial quando a máquina escreve a chamada.",
            corpo=(
                "Nenhuma linha de texto deste jornal é escrita por um modelo de linguagem — mas a "
                "decisão de quais matérias chegam até você é. É uma linha tênue, e vale a pena "
                "desenhá-la com cuidado.\n\n"
                "Quando uma IA escolhe seis entre quinze matérias, ela está exercendo um poder "
                "editorial clássico: o de dizer o que importa. A diferença é que, aqui, cada escolha "
                "vem junto com a explicação de por que foi feita.\n\n"
                "Isso não resolve o problema da curadoria automatizada, mas muda a pergunta: em vez "
                "de perguntar se a máquina deveria escolher, perguntamos se ela consegue justificar "
                "a escolha em público. Nem toda redação aceitaria esse teste."
            ),
            editoria=ed_por_nome["Ética"],
            pagina=18,
            tempo_leitura_min=7,
            palavra_chave="autoria algorítmica",
            imagem_url="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="O trabalho que virou fila",
            chamada="Plataformização e a promessa de autonomia que nunca chegou.",
            corpo=(
                "Rascunho: revisar dados de 2046 antes de publicar. A ideia central é que a "
                "plataformização prometeu autonomia e entregou fila — o algoritmo de despacho decide "
                "quem trabalha, quando e por quanto, e chama isso de liberdade.\n\n"
                "Falta entrevistar mais dois trabalhadores de logística automatizada antes de "
                "fechar."
            ),
            editoria=ed_por_nome["Avanços"],
            pagina=24,
            tempo_leitura_min=8,
            palavra_chave="trabalho plataformizado",
            imagem_url="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.RASCUNHO,
        ),
        dict(
            titulo="Réplicas e replicantes",
            chamada="Como o cinema imaginou a consciência artificial antes de existir uma.",
            corpo=(
                "Muito antes de qualquer laboratório declarar ter alcançado inteligência artificial "
                "geral, o cinema já tinha decidido como ela ia se parecer: melancólica, quase humana "
                "demais, sempre questionando se merece ser desligada.\n\n"
                "Esse ensaio percorre meio século de replicantes, androides e assistentes de voz "
                "para perguntar o que essas histórias erraram — e o que, sem querer, acertaram sobre "
                "nós."
            ),
            editoria=ed_por_nome["Cultura"],
            pagina=31,
            tempo_leitura_min=10,
            palavra_chave="replicantes",
            imagem_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="A cidade que não esquece",
            chamada="Memória urbana e vigilância algorítmica.",
            corpo=(
                "Rascunho: cidades inteligentes guardam registro de tudo — semáforos, catracas, "
                "postes com câmera. A pergunta que falta responder é: por quanto tempo, e quem "
                "decide quando apagar?"
            ),
            editoria=ed_por_nome["Memória"],
            pagina=None,
            tempo_leitura_min=5,
            palavra_chave="memória urbana",
            imagem_url="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&h=600&fit=crop&q=70",
            status=models.StatusConteudo.RASCUNHO,
        ),
    ]


def seed_se_vazio(db: Session):
    if db.query(models.Categoria).count() > 0:
        return

    avancos = models.Categoria(nome="Avanços Tecnológicos")
    cultura = models.Categoria(nome="IA na Arte e Cultura")
    db.add_all([avancos, cultura])
    db.flush()

    editorias = [
        models.Editoria(nome="Avanços", categoria_id=avancos.id),
        models.Editoria(nome="Cultura", categoria_id=cultura.id),
        models.Editoria(nome="Ética", categoria_id=cultura.id),
        models.Editoria(nome="Memória", categoria_id=cultura.id),
    ]
    db.add_all(editorias)
    db.flush()
    ed_por_nome = {e.nome: e for e in editorias}

    redacao = models.Usuario(
        nome="Júlia",
        email="redacao@synthetica.app",
        papel="editor",
        senha_hash=auth.gerar_hash_senha(SENHA_PADRAO_REDACAO),
    )
    db.add(redacao)
    db.flush()

    for c in _conteudos_exemplo(ed_por_nome):
        db.add(
            models.Conteudo(
                titulo=c["titulo"],
                chamada=c["chamada"],
                corpo=c["corpo"],
                editoria_id=c["editoria"].id,
                pagina=c["pagina"],
                tempo_leitura_min=c["tempo_leitura_min"],
                palavra_chave=c["palavra_chave"],
                imagem_url=c["imagem_url"],
                status=c["status"],
                autor_id=redacao.id,
            )
        )

    db.commit()


def seed_corpo_rico_se_vazio(db: Session):
    """Bancos já existentes têm as matérias de exemplo com corpo curto (texto
    provisório de quando a tela de leitura ainda não existia). Substitui pelo
    texto completo, casando por título — não mexe em conteúdo criado por
    vocês depois do seed."""
    editorias = db.query(models.Editoria).all()
    if not editorias:
        return
    ed_por_nome = {e.nome: e for e in editorias}

    corpo_por_titulo = {c["titulo"]: c["corpo"] for c in _conteudos_exemplo(ed_por_nome)}

    conteudos = db.query(models.Conteudo).filter(models.Conteudo.titulo.in_(corpo_por_titulo)).all()
    alterou = False
    for conteudo in conteudos:
        novo_corpo = corpo_por_titulo[conteudo.titulo]
        if conteudo.corpo != novo_corpo and len(conteudo.corpo) < len(novo_corpo):
            conteudo.corpo = novo_corpo
            alterou = True
    if alterou:
        db.commit()


def seed_imagens_se_vazio(db: Session):
    """Bancos já existentes têm as matérias de exemplo sem imagem de capa
    (campo criado depois). Preenche casando por título, sem mexer em
    conteúdo criado por vocês depois do seed."""
    editorias = db.query(models.Editoria).all()
    if not editorias:
        return
    ed_por_nome = {e.nome: e for e in editorias}

    imagem_por_titulo = {c["titulo"]: c["imagem_url"] for c in _conteudos_exemplo(ed_por_nome)}

    conteudos = (
        db.query(models.Conteudo)
        .filter(models.Conteudo.titulo.in_(imagem_por_titulo), models.Conteudo.imagem_url.is_(None))
        .all()
    )
    if not conteudos:
        return
    for conteudo in conteudos:
        conteudo.imagem_url = imagem_por_titulo[conteudo.titulo]
    db.commit()


def seed_senha_redacao_se_vazio(db: Session):
    """Bancos já existentes (criados antes do login da redação existir) não têm
    senha nos usuários da equipe editorial — preenche sem apagar nada."""
    editores_sem_senha = (
        db.query(models.Usuario)
        .filter(models.Usuario.papel == "editor", models.Usuario.senha_hash.is_(None))
        .all()
    )
    if not editores_sem_senha:
        return
    for editor in editores_sem_senha:
        editor.senha_hash = auth.gerar_hash_senha(SENHA_PADRAO_REDACAO)
    db.commit()


def seed_cartas_se_vazio(db: Session):
    if db.query(models.Carta).count() > 0:
        return

    conteudos_por_titulo = {c.titulo: c for c in db.query(models.Conteudo).all()}

    cartas = [
        dict(
            assinante_nome="ISA",
            assinante_numero="#0412",
            conteudo=conteudos_por_titulo["Quem assina o algoritmo"],
            assunto='Sobre "Quem assina o algoritmo"',
            texto="A justificativa da escolha apareceu, mas eu queria saber quais sinais pesaram mais.",
            status=models.StatusCarta.PENDENTE,
        ),
        dict(
            assinante_nome="RUAN",
            assinante_numero="#0291",
            conteudo=None,
            assunto="Sobre a edição #07",
            texto="Achei a proporção desequilibrada este mês, mesmo tendo ajustado a ficha.",
            status=models.StatusCarta.PENDENTE,
        ),
        dict(
            assinante_nome="CLARA",
            assinante_numero="#0355",
            conteudo=conteudos_por_titulo["A máquina que aprendeu a ver"],
            assunto='Sobre "A máquina que aprendeu a ver"',
            texto="Faltou citar o caso de São Paulo em 2039, que é o mais próximo do argumento.",
            status=models.StatusCarta.PENDENTE,
        ),
        dict(
            assinante_nome="MARCO",
            assinante_numero="#0180",
            conteudo=conteudos_por_titulo["Réplicas e replicantes"],
            assunto='Sobre "Réplicas e replicantes"',
            texto="Ótimo texto, mudou como eu vejo o tema.",
            status=models.StatusCarta.APROVADA,
        ),
        dict(
            assinante_nome="NADIA",
            assinante_numero="#0099",
            conteudo=conteudos_por_titulo["O futuro já foi imaginado antes"],
            assunto='Sobre "O futuro já foi imaginado antes"',
            texto="Discordo do recorte, mas a curadoria foi honesta.",
            status=models.StatusCarta.APROVADA,
        ),
        dict(
            assinante_nome="BRUNO",
            assinante_numero="#0044",
            conteudo=None,
            assunto="Sobre o app",
            texto="Mensagem fora do escopo editorial.",
            status=models.StatusCarta.RECUSADA,
        ),
    ]

    for carta in cartas:
        db.add(
            models.Carta(
                assinante_nome=carta["assinante_nome"],
                assinante_numero=carta["assinante_numero"],
                conteudo_id=carta["conteudo"].id if carta["conteudo"] else None,
                assunto=carta["assunto"],
                texto=carta["texto"],
                status=carta["status"],
            )
        )

    db.commit()
