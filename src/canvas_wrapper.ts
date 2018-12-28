interface Size {
    width: number,
    height: number
}

interface Position {
    x: number,
    y: number
}


// コンストラクタで与えらえたcanvasに描画する
class CanvasWrapper {
    // キャンバス
    private canvas: HTMLCanvasElement;

    // 画像データ
    private numberImg: HTMLImageElement[] = [];

    // tr_option
    public static readonly FIXED: number = 0;
    public static readonly FIXED_WIDTH: number = 1;
    public static readonly FIXED_HEIGHT: number = 2;
    public static readonly KEEP_ASPECT: number = 3;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    init(callback: () => void) {
        let load_num = 9;

        for (let i: number = 0; i <= 9; i++) {
            const fileName = "img/" + i.toString() + ".png";

            this.numberImg[i] = new Image();
            this.numberImg[i].src = fileName;

            this.numberImg[i].onload = function () {
                load_num = load_num - 1;
                if (load_num == 0) {
                    callback();
                }
            }
        }
    }

    public toDataURL():string{
        return this.canvas.toDataURL();
    }

    public setSize(size: Size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    }

    // 矩形を描画する
    public drawRect(size: Size, position: Position, color: string) {
        if (!this.canvas.getContext) {
            return;
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        // 現在の文字を消す
        context.fillStyle = color;
        context.fillRect(position.x, position.y, size.width, size.height);
    }

    // 1文字を指定されたサイズ・位置・色で描画する
    // 数字に関しては画像データ(number_img)を利用して描画する
    public drawChar(char: string, size: Size, position: Position, color: string, trOption = CanvasWrapper.KEEP_ASPECT) {
        // 一文字に制限
        char = char.slice(0, 1);

        if (CanvasWrapper.isNumber(char)) {
            this.drawNumberChar(char, size, position, color);
        }

        else {
            this.drawJpChar(char, size, position, color, trOption);
        }
    }

    // 引数に与えられた文字が数値文字であるかを返す。
    public static isNumber(char: string): boolean {
        const reg = /[0-9]/
        return reg.test(char);
    }

    // 指定された数字一文字を指定されたサイズ・位置・色で描画する
    private drawNumberChar(char: string, size: Size, position: Position, color: string) {
        if (!this.canvas.getContext) {
            return;
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(this.numberImg[parseInt(char)], position.x, position.y, size.width, size.height);
    }

    // 1文字を指定されたサイズ・位置・色で描画する
    private drawJpChar(char: string, size: Size, position: Position, color: string, trOption = CanvasWrapper.KEEP_ASPECT) {
        const MEM_CANVAS_HEIGHT = 500;
        const MEM_CANVAS_WIDTH = 500;

        // 文字画像データ作成用キャンパス作成
        const memCanvas = document.createElement("canvas");
        memCanvas.height = MEM_CANVAS_HEIGHT;
        memCanvas.width = MEM_CANVAS_WIDTH;

        // 文字の描写
        const context = memCanvas.getContext('2d');
        if (!context) {
            return;
        }

        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillRect(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);

        context.fillStyle = color;
        context.font = "300px 'ＭＳ Ｐゴシック'";
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(char, 0, 0);

        // 文字を覆う座標を取得
        var pixels = context.getImageData(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);
        var data = pixels.data;
        var left = MEM_CANVAS_WIDTH;
        var right = 0;
        var top = MEM_CANVAS_HEIGHT;
        var bottom = 0;
        for (var i = 0, len = data.length; i < len; i += 4) {
            var r = data[i], g = data[i + 1], b = data[i + 2], alpha = data[i + 3];
            if (alpha > 0) {
                var col = Math.floor((i / 4) % memCanvas.width);
                var row = Math.floor((i / 4) / memCanvas.width);

                if (left > col) left = col;
                if (right < col) right = col;
                if (top > row) top = row;
                if (bottom < row) bottom = row;
            }
        }

        let charSize: Size = { width: right - left + 1, height: bottom - top + 1 };

        if (charSize.width / size.width < charSize.height / size.height) {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_HEIGHT) {
                const new_w = charSize.height * size.width / size.height;
                left -= Math.ceil((new_w - charSize.width) / 2);
                right += Math.ceil((new_w - charSize.width) / 2);
                charSize.width = right - left + 1;
            }
        }
        else {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_WIDTH) {
                const new_h = charSize.width * size.height / size.width;
                top -= Math.ceil((new_h - charSize.height) / 2);
                bottom += Math.ceil((new_h - charSize.height) / 2);
                charSize.height = bottom - top + 1;
            }
        }


        // 描写
        if (!this.canvas.getContext) {
            return;
        }

        const canvasContext = this.canvas.getContext('2d');
        if (!canvasContext) {
            return;
        }
        canvasContext.drawImage(memCanvas, left, top, charSize.width, charSize.height, position.x, position.y, size.width, size.height);
    }
}

export = CanvasWrapper;