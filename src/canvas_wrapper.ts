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
    private number_img: HTMLImageElement[] = [];

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
            let file_name = "img/" + i.toString() + ".png";

            this.number_img[i] = new Image();
            this.number_img[i].src = file_name;

            this.number_img[i].onload = function () {
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

    public set_size(size: Size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    }

    // 矩形を描画する
    public draw_rect(size: Size, position: Position, color: string) {
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

    // 文字を描画する
    public draw_char(char: string, size: Size, position: Position, color: string, tr_option = CanvasWrapper.KEEP_ASPECT) {
        // 一文字に制限
        char = char.slice(0, 1);

        if (CanvasWrapper.is_number(char)) {
            this.draw_number_char(char, size, position, color);
        }

        else {
            this.draw_jp_char(char, size, position, color, tr_option);
        }
    }

    // 引数に与えられた文字が数値文字であるかを返す。
    public static is_number(char: string): boolean {
        const reg = /[0-9]/
        return reg.test(char);
    }

    private draw_number_char(char: string, size: Size, position: Position, color: string) {
        // 描写
        if (!this.canvas.getContext) {
            return;
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(this.number_img[parseInt(char)], position.x, position.y, size.width, size.height);
    }

    private draw_jp_char(char: string, size: Size, position: Position, color: string, tr_option = CanvasWrapper.KEEP_ASPECT) {
        const MEM_CANVAS_HEIGHT = 500;
        const MEM_CANVAS_WIDTH = 500;

        // 文字画像データ作成用キャンパス作成
        const mem_canvas = document.createElement("canvas");
        mem_canvas.height = MEM_CANVAS_HEIGHT;
        mem_canvas.width = MEM_CANVAS_WIDTH;

        // 文字の描写
        const context = mem_canvas.getContext('2d');
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
                var col = Math.floor((i / 4) % mem_canvas.width);
                var row = Math.floor((i / 4) / mem_canvas.width);

                if (left > col) left = col;
                if (right < col) right = col;
                if (top > row) top = row;
                if (bottom < row) bottom = row;
            }
        }

        let char_size: Size = { width: right - left + 1, height: bottom - top + 1 };

        if (char_size.width / size.width < char_size.height / size.height) {
            if (tr_option === CanvasWrapper.KEEP_ASPECT || tr_option == CanvasWrapper.FIXED_HEIGHT) {
                const new_w = char_size.height * size.width / size.height;
                left -= Math.ceil((new_w - char_size.width) / 2);
                right += Math.ceil((new_w - char_size.width) / 2);
                char_size.width = right - left + 1;
            }
        }
        else {
            if (tr_option === CanvasWrapper.KEEP_ASPECT || tr_option == CanvasWrapper.FIXED_WIDTH) {
                const new_h = char_size.width * size.height / size.width;
                top -= Math.ceil((new_h - char_size.height) / 2);
                bottom += Math.ceil((new_h - char_size.height) / 2);
                char_size.height = bottom - top + 1;
            }
        }


        // 描写
        if (!this.canvas.getContext) {
            return;
        }

        const canvas_context = this.canvas.getContext('2d');
        if (!canvas_context) {
            return;
        }
        canvas_context.drawImage(mem_canvas, left, top, char_size.width, char_size.height, position.x, position.y, size.width, size.height);
    }
}

export = CanvasWrapper;