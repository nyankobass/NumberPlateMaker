import CanvasWrapper = require("./canvas_wrapper")
import Setting = require("./setting")

class NumberPlate {
    // 書き込み情報
    private small_number_list: string[] = ["3", "0", "0"];
    private large_number_list: string[] = ["1", "2", "3", "4"];

    public static readonly SMALL_NUMBER_COUNT: number = 3;
    public static readonly LARGE_NUMBER_COUNT: number = 4;

    private hiragana: string = "さ";
    private kanji: string = "横浜";

    private car_type: number = NumberPlate.NORMAL_CAR;
    public static readonly NORMAL_CAR: number = 0;
    public static readonly KEI_CAR: number = 1;

    private is_company: boolean = false;

    // 書き込み先
    private canvas: CanvasWrapper;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = new CanvasWrapper(canvas);

        this.canvas.set_size(Setting.CANVAS_SIZE);
    }

    // 初期化
    public init(callback: () => void) {
        this.canvas.init(callback);
    }

    public ToDataURL():string{
        return this.canvas.toDataURL();
    }

    // セッター
    public set_car_type(car_type: number) {
        this.car_type = car_type;

        this.draw_all();
    }

    public set_is_company(is_company: boolean) {
        this.is_company = is_company;

        this.draw_all();
    }

    public set_hiragana(hiragana: string) {
        this.hiragana = hiragana.slice(0, 1);
        this.hiragana = hiragana;

        this.draw_all();
    }

    public set_kanji(kanji: string) {
        this.kanji = kanji;

        this.draw_all();
    }

    public set_small_number(small_number_list: string[]) {
        if (small_number_list.length != NumberPlate.SMALL_NUMBER_COUNT) {
            return;
        }

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            let number_char = " "
            if (CanvasWrapper.is_number(small_number_list[i])) {
                number_char = small_number_list[i];
            }

            this.small_number_list[i] = number_char;
        }

        this.draw_all();
    }

    public set_large_number(large_number_list: string[]) {
        if (large_number_list.length != NumberPlate.LARGE_NUMBER_COUNT) {
            return;
        }

        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            let number_char = "・";
            if (CanvasWrapper.is_number(large_number_list[i])) {
                number_char = large_number_list[i];
            }

            this.large_number_list[i] = number_char;
        }

        let is_dot: boolean = false;
        for (let i: number = NumberPlate.LARGE_NUMBER_COUNT - 1; i >= 0; i--) {
            if (is_dot) {
                this.large_number_list[i] = "・";
            }
            else if (this.large_number_list[i] == "・") {
                is_dot = true;
            }
        }

        this.draw_all();
    }


    // 描画
    private draw_hiragana() {
        const draw_setting = Setting.draw_setting["hiragana"];
        this.canvas.draw_char(this.hiragana, draw_setting.size, draw_setting.position, this.get_color());
    }

    private draw_kanji() {
        const kanji_list: string[] = this.kanji.split("");

        const word_count = Math.min(kanji_list.length, 4);

        for (let i: number = 0; i < word_count; i++) {
            const setting_key = "kanji" + word_count.toString() + "-" + (i + 1).toString();
            const draw_setting = Setting.draw_setting[setting_key];
            this.canvas.draw_char(kanji_list[i], draw_setting.size, draw_setting.position, this.get_color(), draw_setting.tr_option);
        }
    }

    private draw_large_number() {
        let is_draw_hyphen = true;

        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const setting_key = "large_number" + (i + 1).toString();
            const draw_setting = Setting.draw_setting[setting_key];

            this.canvas.draw_char(this.large_number_list[i], draw_setting.size, draw_setting.position, this.get_color());
        
            if(this.large_number_list[i] == "・"){
                is_draw_hyphen = false;
            }
        }

        if (is_draw_hyphen){
            this.draw_hyphen();
        }
    }

    private draw_small_number() {
        const draw_small_number_list: string[] = [];

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            if (this.small_number_list[i] != " ") {
                draw_small_number_list.push(this.small_number_list[i]);
            }
        }

        for (let i: number = 0; i < draw_small_number_list.length; i++) {
            const setting_key = "small_number" + draw_small_number_list.length + "-" + (i + 1).toString();
            const draw_setting = Setting.draw_setting[setting_key];

            this.canvas.draw_char(draw_small_number_list[i], draw_setting.size, draw_setting.position, this.get_color());
        }
    }

    // 色取得
    private get_color(): string {
        if (this.is_company) {
            if (this.car_type == NumberPlate.NORMAL_CAR) {
                return Setting.FRONT_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.car_type == NumberPlate.KEI_CAR) {
                return Setting.FRONT_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.car_type == NumberPlate.NORMAL_CAR) {
            return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.car_type == NumberPlate.KEI_CAR) {
            return Setting.FRONT_COLOR[Setting.KEI_CAR];
        }

        return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
    }

    // 背景色取得
    private get_bg_color(): string {
        if (this.is_company) {
            if (this.car_type == NumberPlate.NORMAL_CAR) {
                return Setting.BG_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.car_type == NumberPlate.KEI_CAR) {
                return Setting.BG_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.car_type == NumberPlate.NORMAL_CAR) {
            return Setting.BG_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.car_type == NumberPlate.KEI_CAR) {
            return Setting.BG_COLOR[Setting.KEI_CAR];
        }

        return Setting.BG_COLOR[Setting.NORMAL_CAR];
    }


    private draw_hyphen(is_display = true) {
        const draw_setting = {
            position: {
                x: Setting.mm2px(177.5),
                y: Setting.mm2px(104),
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(12)
            }
        }

        this.canvas.draw_rect(draw_setting.size, draw_setting.position, this.get_color());
    }


    // すべて塗りつぶす
    private delete_all() {
        this.canvas.draw_rect(Setting.CANVAS_SIZE, { x: 0, y: 0 }, this.get_bg_color());
    }

    // 描写する
    public draw_all() {
        this.delete_all();

        this.draw_kanji();
        this.draw_hiragana();
        this.draw_small_number();
        this.draw_large_number();
    }
}


export = NumberPlate;