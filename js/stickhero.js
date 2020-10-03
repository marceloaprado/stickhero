/*	
*	Arquivo JavaScript
*	TechMob - Empresa Junior da Faculdade de Computacao UFU
*	Autores: Marcelo Prado e Lucas Josino
*	Data de Modificaçao: 28/09/2015
*/

var canvas, //Elementos canvas do html
ctx, //Contexto 2d do canvas
ALTURA = 639, //Altura da janela do jogo
LARGURA = 420, //Largura da janela do jogo 
estadoAtual, //Estado atual(jogando, perdeu) 
record, //Pontuacao maxima
novoRecord = 0, //Verifica se houve novo record
dx = 3, //velocidade de decremento da posicao X dos objetos
contador = 0, 
fps, 
fpsInterval, 
startTime, 
now, 
then, 
elapsed,

estados = {
	jogando: 0,
	perdeu: 1
},

ceu = {
	y: 0,
	x: 0,

	/*	
	* Essa funcao eh responsavel por desenhar o ceu na tela.
	*/
	desenha: function(){
		spriteNuvem.desenha(this.x, this.y);		
	}
},

predios ={
	y: 0,
	x: 0,

	/*	
	* Essa funcao eh responsavel por atualizar a posicao
	* da imagem dos predios na tela a cada vez que o personagem
	* se move.
	*/
	atualiza: function(){
		if(personagem.move == 1)
			this.x -= 0.4;

		if(this.x < -LARGURA + 1)
			this.x = 0;
	},

	/*	
	* Essa funcao eh responsavel por desenhar os predios
	* na tela.
	*/
	desenha: function(){		
		spritePredios.desenha(this.x, this.y);
		spritePredios.desenha(this.x + spritePredios.largura, this.y);
	}
},

lua = {
	y: 50,
	x: LARGURA - spriteLua.largura,

	/*	
	* Essa funcao eh responsavel por desenhar a lua na tela.
	*/
	desenha: function(){		
		spriteLua.desenha(this.x, this.y);		
	}
},

gameOver = {
	y: 0,
	x: 0,

	/*	
	* Essa funcao eh responsavel por desenhar o game over
	* na tela.
	*/
	desenha: function(){		
		spriteGameOver.desenha(this.x, this.y);		
	}
},

personagem = {
	x: 115 - spritePersonagem.largura, //Posicao X do boneco no canvas
	y: 375 - spritePersonagem.altura, //Posicao Y do boneco no canvas
	altura: spritePersonagem.altura, //Tamanho do boneco
	largura: spritePersonagem.altura, //Largura do boneco
	gravidade: 2, 
	velocidadeQueda: 0, 
	velocidade: 5,
	score: 0,
	move: 0,
	morre: 0,

	/*	
	* Essa funcao eh responsavel por verificar se o personagem
	* esta morto ou nao.
	*/
	atualiza: function(){
		if(this.y + this.largura > ALTURA){
			this.morre = 0;
			this.move = 0;
			estadoAtual = estados.perdeu;
			if(this.score > record){
				localStorage.setItem("record", this.score);
				record = this.score;
				novoRecord = 1;
			}
		}		
	},

	/*	
	* Essa funcao eh responsavel por movimentar o personagem pela
	* plataforma assim que ela desce.
	*
	* @param x: eh a posicao x que o personagem deve estar na tela,	
	* ou seja, ele deve andar certa distancia ate chegar nessa posicao.
	* @see avancaEtapa(); Esta contida nesse mesmo arquivo.
	*/
	movimenta: function(x){	
		if(this.move == 1){			
			var distancia,
			plat = plataforma._plataforma[plataforma._plataforma.length - 1];
			
			/*Verifica se o personagem vai morrer(this.morre = 1), assim a 			
			a posicao x que ele deve estar sera o final da plataforma.
			Se ele nao for morrer, entao a posicao x do personagem sera o valor 
			do argumento 'x' que veio da funcao subtraida da largura do 
			personagem.*/
			if(this.morre == 0)
				distancia = x - this.largura;
			else
				distancia = plat.x + plat.largura;			
			
			/*Nessa condicao eh feito o efeito de movimento do personagem*/
			if(this.x < distancia){
				this.x += this.velocidade;	


				contador++;
				/*Aqui eh realizado a troca da imagem da sprite do personagem.
				Essa verificacao eh feita para dar um delay durante a troca de 
				imagens de forma que fique mais facil de ser visualizada*/
				if(contador % 5 == 0){
					posicao++;
					if(posicao == 4)
						posicao = 1;	
				}								
			}
			else{
				/*Quando o personagem vai morrer e sua posicao ja esta no final
				da plataforma, entao ele cai.*/
				if(this.morre == 1){
					this.velocidadeQueda += this.gravidade;
					this.y += this.velocidadeQueda;					
				}
				/*Quando o personagem nao vai morrer e sua posicao ja esta no final
				do ultimo obstaculo, entao todos os objetos movem para a esquerda
				e surge um novo obstaculo.*/
				else{
					posicao = 0;
					contador = 0;
					avancaEtapa();				
				}
			}
		}
	},
	/*
	* Volta as configuracoes normais
	*/
	reset: function(){
		this.x = 115 - spritePersonagem.largura;
		this.y = 375 - spritePersonagem.altura;
		this.velocidadeQueda = 0;
		this.velocidade = 5;
		this.morre = 0;
		this.move = 0;		
		this.score = 0;
	},

	/*	
	* Essa funcao eh responsavel por desenhar o personagem na tela.
	*/
	desenha: function(){
		spritePersonagem.desenha(this.x, this.y);
	}
},

obstaculos = {
	_obs: [{
		largura: 132,
		altura: 264,
		x: 0,
		x1: 0
	}],

	/*
	* Insere um novo obstaculo no array _obs[]
	*/
	insere: function(){
		var larguraRandom = larguraObstaculo();
		this._obs.push({
			largura: larguraRandom,	
			altura: 264,
			x: xObstaculo(larguraRandom),
			x1: 420
		});			
	},

	/*
	* Mantem o array de obstaculos atualizados
	*/
	atualiza: function(){
		/*Verifica se o primeiro obstaculo esta totalmente fora da tela
		e, se estiver, eh removido, e logo inserido outro no lugar.*/		
		if(this._obs[this._obs.length - 1].x1 + this._obs[this._obs.length - 1].largura == 132){
			if(this._obs[0].x1 < -this._obs[0].largura)
				this._obs.shift();
			this.insere();				
			personagem.move = 0;
		}

		/*Esses comandos sao responsaveis pelo efeito de surgimento do 
		novo obstaculo*/
		if(this._obs[this._obs.length - 1].x < this._obs[this._obs.length - 1].x1)	
			this._obs[this._obs.length - 1].x1 -= 6;
	},

	/*	
	* Volta as configuracoes normais
	*/
	limpa: function(){
		this._obs = [{
			largura: 132,
			altura: 264,
			x: 0,
			x1: 0
		}];
	},

	/*	
	* Essa funcao eh responsavel por desenhar os obstaculos na tela.
	*/
	desenha: function(){
		for(var i = 0; i < this._obs.length; i++){
			var obs = this._obs[i];
			desenhaObstaculo(obs.x1, obs.largura, obs.altura);
		}
	}
},

plataforma = {
	_plataforma: [],
	x: 120,
	y: 387,
	altura: 0,
	largura: 12,
	cria: 0,
	rotacao: 0,
	rotaciona: 0,

	/*
	* Funcao responsavel por atualizar tudo sobre a plataforma:
	* quando ela esta sendo criada, rotacionada, verifica se ela
	* atingiu ou nao o obstaculo, e quando ela sera removida.
	*/
	atualiza: function(){
		if(this.cria == 1 && this.rotacao == 0)
			this.altura -= 3;	

		if(this.rotaciona == 1){
			if(this.rotacao < 30)
				this.rotacao += 3;							
			else{
				this._plataforma.push({
					x: this.x + this.largura,
					y: this.y,
					largura: -this.altura,
					altura: -this.largura						
				});

				var obs = obstaculos._obs[obstaculos._obs.length - 1],
				plat = this._plataforma[this._plataforma.length - 1];
				if(plat.x + plat.largura >= obs.x1 && plat.x + plat.largura <= obs.x1 + obs.largura){					
					if(plat.x + plat.largura >= obs.x1 + (obs.largura / 2 - 5) && plat.x + plat.largura <= obs.x1 + (obs.largura / 2 + 5))					
						personagem.score += 5;
					else
						personagem.score++;
										
					personagem.morre = 0;					
				}
				else{		
					personagem.morre = 1;					
				}
				personagem.move = 1;
				this.reset();				

			}
			
		}	
		if(personagem.move == 1){			
			personagem.movimenta(obstaculos._obs[obstaculos._obs.length - 1].x1 + obstaculos._obs[obstaculos._obs.length - 1].largura);					
		}	
	},

	/*	
	* Essa funcao eh responsavel por desenhar a plataforma na tela.
	* @see desenhaPlataforma();
	*/
	desenha: function(){
		/* Desenha todas as plataformas contidas no array */
		for(i = 0; i < this._plataforma.length; i++){
			
			/*Verifica se a plataforma estiver completamente fora
			da tela, entao remove ela do array*/
			if(this._plataforma[0].x < -this._plataforma[0].largura - 10)
				this._plataforma.shift();
			
			var plat = this._plataforma[i];
			desenhaPlataforma(plat.x, plat.y, plat.largura, plat.altura);			
		}

		//Salva o contexto antigo
		ctx.save();

		/*Muda a origem do canvas para a coordenada da base da plataforma,
		e rotaciona o canvas. Esses comandos sao os responsaveis pelo efeito
		da plataforma cair sobre o obstaculo.*/
		ctx.translate(this.x + this.largura, this.y);
		ctx.rotate(Math.PI / 180 * this.rotacao * 3);
		desenhaPlataforma(-this.largura, 0, this.largura, this.altura);
		
		//Retorna ao contexto anteriomente salvo.
		ctx.restore();				
	},
	/*
	* Volta as configuracoes normais da plataforma
	*/
	reset: function(){
		this.x = 120;
		this.y = 387;
		this.altura = 0;
		this.largura = 12;
		this.cria = 0;
		this.rotacao = 0;
		this.rotaciona = 0;
	},

	/*
	* Limpa o array de plataformas. 
	* OBS: Essa funcao so eh usada quando o personagem morrer.
	*/
	limpa: function(){
		this._plataforma = [];
	}
};

/*
* Funcao responsavel por inicializar o jogo assim que a pagina
* carregar.
*/
window.onload = function(){
	main(60);
}

/*
* Cria o canvas e adiciona ao body, cria os enventos
* do mouse e da inicio ao jogo.
* @see roda();
*/
function main(fps){	
	canvas = document.createElement("canvas");
	canvas.width = LARGURA;
	canvas.height = ALTURA;
	fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;    

	canvas.style.border = "1px solid #000";	
	
	ctx = canvas.getContext("2d");	
	document.body.appendChild(canvas);	
	
	document.addEventListener("mousedown", clique);
	document.addEventListener("mouseup", soltaClique);
	
	estadoAtual = estados.jogando;	
	
	roda();
}

/*
* Funcao recursiva responsavel pelo loop do jogo.
* @see atualiza(); e desenha();
*/
function roda(){
	now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);

		record = localStorage.getItem("record");

		if(record == null){
			record = 0;
		}

		atualiza();
		desenha();
	}

	window.requestAnimationFrame(roda);	
}

/*
* Funcao responsavel por atualizar todas propriedades de todos
* os objetos do jogo.
*/
function atualiza(){		
	predios.atualiza();
	plataforma.atualiza();
	obstaculos.atualiza();	
	personagem.atualiza();		
}

/*
* Funcao responsavel por desenhar todos os objetos do jogo.
*/
function desenha(){
	ceu.desenha();
	lua.desenha();
	predios.desenha();
	obstaculos.desenha();

	ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
	ctx.beginPath();
	ctx.rect(LARGURA / 2 - 60, 0, 120, 50);
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#FFF";
	ctx.font = "45px Arial";

	desenhaScore(40, "#FFF", personagem.score);
	
	plataforma.desenha();	
	personagem.desenha();	

	if(estadoAtual == estados.perdeu){
		gameOver.desenha();
		desenhaScore(200, "#000", personagem.score);
		desenhaScore(295, "#000", record);
		if(novoRecord == 1){
			var img = new Image();
			img.src = "imagens/new.png";			
			ctx.drawImage(img, 127, 168);
		}
	}	
}

/*
* Funcao responsavel por criar a plataforma enquanto o mouse esta
* sendo clicado.
*/
function clique(){
	if(estadoAtual == estados.jogando){	
		if(personagem.move == 0){	
			plataforma.cria = 1;
			plataforma.rotaciona = 0;
		}	
	}	
}

/*
* Funcao responsavel por parar de criar a plataforma quando o 
* mouse deixa de ser clicado.
*/
function soltaClique(){
	if(estadoAtual == estados.jogando){
		if(personagem.move == 0){
			plataforma.cria = 0;
			plataforma.rotaciona = 1;	
		}
	}
	else{
		estadoAtual = estados.jogando;
		personagem.reset();
		plataforma.reset();
		plataforma.limpa();
		obstaculos.limpa();
		posicao = 0;
		novoRecord = 0;
	}
}

/*
* Funcao responsavel por mover todos objetos da tela, com excessao
* da lua, para esquerda.
*/
function avancaEtapa(){
	for(var i = 0; i < obstaculos._obs.length; i++){
		obstaculos._obs[i].x1 -= dx;		
	}

	for(var i = 0; i < plataforma._plataforma.length; i++){
		plataforma._plataforma[i].x -= dx;
	}

	personagem.x -= dx;
}

/*
* Funcao responsavel por desenhar os obstaculos
* @param x: posicao x do obstaculo a ser desenhado.
* @param largura: largura do obstaculo a ser desenhado.
* @param altura: altura do obstaculo a ser desenhado.
*
*/
function desenhaObstaculo(x, largura, altura){
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.beginPath();
	ctx.rect(x, ALTURA - altura, largura, altura);
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#FFF";
	ctx.beginPath();
	ctx.rect(x, ALTURA - altura, largura, 12);
	ctx.fill();
	ctx.closePath();

	//Rigiao do "Perfect"	
	ctx.fillStyle = "#E00";
	ctx.beginPath();
	ctx.rect(x + largura / 2 - 6, ALTURA - altura, 12, 6);
	ctx.fill();
	ctx.closePath();
	
}

/*
* Funcao responsavel por desenhar as plataformas
* @param x: posicao x da plataforma a ser desenhada.
* @param y: posicao y da plataforma a ser desenhada.
* @param largura: largura da plataforma a ser desenhada.
* @param altura: altura da plataforma a ser desenhada.
*
*/
function desenhaPlataforma(x, y, largura, altura){
	ctx.fillStyle = "#FFF";
	ctx.beginPath();
	ctx.rect(x, y, largura, altura);
	ctx.fill();
	ctx.closePath();
}

/*
* Cria uma largura randomica para o obstaculo
*/
function larguraObstaculo(){
	var larguraRandom = 30 + Math.floor(103 * Math.random());

	while(larguraRandom % dx != 0)
		larguraRandom = 30 + Math.floor(103 * Math.random());

	return larguraRandom;			
}

/*
* Cria uma posicao x randomica para o obstaculo
*/
function xObstaculo(larguraRandom){
	var x = 170 + Math.floor((LARGURA - larguraRandom - 170) * Math.random());

	while(x % 3 != 0)
		x = 170 + Math.floor((LARGURA - larguraRandom - 170) * Math.random());			 

	return x;
}

function desenhaScore(y, cor, valor){
	ctx.fillStyle = cor;
	if(valor < 10)
		ctx.fillText(valor, LARGURA / 2 - 10, y);
	else
		if(valor >= 10 && valor < 100)
			ctx.fillText(valor, LARGURA / 2 - 20, y);
		else
			ctx.fillText(valor, LARGURA / 2 - 35, y);
}