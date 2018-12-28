import CanvasWrapper = require("./canvas_wrapper")
import Setting = require("./setting")

class NumberPlate {
    // 書き込み情報
    private smallNumberList: string[] = ["3", "0", "0"];
    private largeNumberList: string[] = ["1", "2", "3", "4"];

    public static readonly SMALL_NUMBER_COUNT: number = 3;
    public static readonly LARGE_NUMBER_COUNT: number = 4;

    private hiragana: string = "さ";
    private kanji: string = "横浜";

    private carType: number = NumberPlate.NORMAL_CAR;
    public static readonly NORMAL_CAR: number = 0;
    public static readonly KEI_CAR: number = 1;

    private isCompany: boolean = false;

    // 書き込み先
    private canvas: CanvasWrapper;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = new CanvasWrapper(canvas);

        this.canvas.setSize(Setting.CANVAS_SIZE);
    }

    // 初期化
    public init(callback: () => void) {
        this.canvas.init(callback);
    }

    public toDataURL():string{
        return this.canvas.toDataURL();
    }

    // セッター
    public setCarType(car_type: number) {
        this.carType = car_type;

        this.drawAll();
    }

    public setIsCompany(is_company: boolean) {
        this.isCompany = is_company;

        this.drawAll();
    }

    public setHiragana(hiragana: string) {
        this.hiragana = hiragana.slice(0, 1);
        this.hiragana = hiragana;

        this.drawAll();
    }

    public setKanji(kanji: string) {
        this.kanji = kanji;

        this.drawAll();
    }

    public setSmallNumber(smallNumberList: string[]) {
        if (smallNumberList.length != NumberPlate.SMALL_NUMBER_COUNT) {
            return;
        }

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            let number_char = " "
            if (CanvasWrapper.isNumber(smallNumberList[i])) {
                number_char = smallNumberList[i];
            }

            this.smallNumberList[i] = number_char;
        }

        this.drawAll();
    }

    public setLargeNumber(largeNumberList: string[]) {
        if (largeNumberList.length != NumberPlate.LARGE_NUMBER_COUNT) {
            return;
        }

        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            let number_char = "・";
            if (CanvasWrapper.isNumber(largeNumberList[i])) {
                number_char = largeNumberList[i];
            }

            this.largeNumberList[i] = number_char;
        }

        let isDot: boolean = false;
        for (let i: number = NumberPlate.LARGE_NUMBER_COUNT - 1; i >= 0; i--) {
            if (isDot) {
                this.largeNumberList[i] = "・";
            }
            else if (this.largeNumberList[i] == "・") {
                isDot = true;
            }
        }

        this.drawAll();
    }


    // 描画
    private drawHiragana() {
        const drawSetting = Setting.drawSetting["hiragana"];
        this.canvas.drawChar(this.hiragana, drawSetting.size, drawSetting.position, this.getColor());
    }

    private drawKanji() {
        const kanjiList: string[] = this.kanji.split("");

        const wordCount = Math.min(kanjiList.length, 4);

        for (let i: number = 0; i < wordCount; i++) {
            const setting_key = "kanji" + wordCount.toString() + "-" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];
            this.canvas.drawChar(kanjiList[i], drawSetting.size, drawSetting.position, this.getColor(), drawSetting.tr_option);
        }
    }

    private drawLargeNumber() {
        let isDrawHyphen = true;

        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const setting_key = "large_number" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];

            this.canvas.drawChar(this.largeNumberList[i], drawSetting.size, drawSetting.position, this.getColor());
        
            if(this.largeNumberList[i] == "・"){
                isDrawHyphen = false;
            }
        }

        if (isDrawHyphen){
            this.drawHyphen();
        }
    }

    private drawSmallNumber() {
        const drawSmallNumberList: string[] = [];

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            if (this.smallNumberList[i] != " ") {
                drawSmallNumberList.push(this.smallNumberList[i]);
            }
        }

        for (let i: number = 0; i < drawSmallNumberList.length; i++) {
            const setting_key = "small_number" + drawSmallNumberList.length + "-" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];

            this.canvas.drawChar(drawSmallNumberList[i], drawSetting.size, drawSetting.position, this.getColor());
        }
    }

    // 色取得
    private getColor(): string {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.FRONT_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.FRONT_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.FRONT_COLOR[Setting.KEI_CAR];
        }

        return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
    }

    // 背景色取得
    private getBgColor(): string {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.BG_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.BG_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.BG_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.BG_COLOR[Setting.KEI_CAR];
        }

        return Setting.BG_COLOR[Setting.NORMAL_CAR];
    }


    private drawHyphen(is_display = true) {
        const drawSetting = {
            position: {
                x: Setting.mm2px(177.5),
                y: Setting.mm2px(104),
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(12)
            }
        }

        this.canvas.drawRect(drawSetting.size, drawSetting.position, this.getColor());
    }


    // すべて塗りつぶす
    private deleteAll() {
        this.canvas.drawRect(Setting.CANVAS_SIZE, { x: 0, y: 0 }, this.getBgColor());
    }

    // 描写する
    public drawAll() {
        this.deleteAll();

        this.drawKanji();
        this.drawHiragana();
        this.drawSmallNumber();
        this.drawLargeNumber();
    }
}


export = NumberPlate;