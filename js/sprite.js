var img = new Image(),
imgPersonagem = new Image(),
imgGameOver = new Image();

var posicao = 0;

img.src = "imagens/sprite.png";
imgPersonagem.src = "imagens/sprite_personagem.png";
imgGameOver.src = "imagens/game_over.png";

var spritePredios = new Sprite(img, 0, 0, 420, 639),
spritePersonagem = new SpritePersonagem(0, 32, 48),
spriteNuvem = new Sprite(img, 421, 0, 420, 350),
spriteLua = new Sprite(img, 80, 641, 280, 280),
spriteGameOver = new Sprite(imgGameOver, 0, 0, 420, 639);

function Sprite(img, x, y, largura, altura){
	this.img = img;
	this.x = x;
	this.y = y;
	this.largura = largura;
	this.altura = altura;

	this.desenha = function(xCanvas, yCanvas){
		ctx.drawImage(img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);	
	}
}

function SpritePersonagem(y, largura, altura){
	this.y = y;
	this.largura = largura;
	this.altura = altura;

	this.desenha = function(xCanvas, yCanvas){
		ctx.drawImage(imgPersonagem, posicao * 32, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);	
	}
}