import NumberPlate = require("./number_plate")
import Setting = require("./setting")

import * as pdfMake from 'pdfmake/build/pdfmake'

// ナンバープレートModel
let number_plate: NumberPlate;

// エントリポイント
window.onload = function () {
    // キャンパス要素を取得
    var canvas: HTMLCanvasElement = document.getElementById("plate-view") as HTMLCanvasElement;

    if (!canvas) {
        return;
    }

    number_plate = new NumberPlate(canvas);

    number_plate.init(load);
}

// 読み込み時処理
function load() {
    number_plate.draw_all();

    //===================================
    // イベント登録
    //===================================
    // ひらがな
    const hiragana_input = document.getElementById("hiragana") as HTMLInputElement;
    hiragana_input.oninput = change_hiragana;

    // 運輸支局
    const kanji_input = document.getElementById("kanji") as HTMLInputElement;
    kanji_input.oninput = change_kanji;

    // 普通自動車/軽自動車
    const normal_car_input = document.getElementById("normal-car") as HTMLInputElement;
    normal_car_input.onclick = change_car_type;
    const kei_car = document.getElementById("kei-car") as HTMLInputElement;
    kei_car.onclick = change_car_type;

    // 自家用車/社用車
    const home_use_input = document.getElementById("home-use") as HTMLInputElement;
    home_use_input.onclick = change_is_company;
    const company_use_input = document.getElementById("company-use") as HTMLInputElement;
    company_use_input.onclick = change_is_company;

    // 分類番号
    for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
        const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
        input.oninput = change_small_number;
    }
    // 一連指定番号
    for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
        const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
        input.oninput = change_large_number;
    }

    const print_button =  document.getElementById("print-button") as HTMLButtonElement;
    print_button.onclick = save_pdf;
}

function change_hiragana() {
    const hiragana_input = document.getElementById("hiragana") as HTMLInputElement;

    const text: string = hiragana_input.value;

    number_plate.set_hiragana(text);
}

function change_kanji() {
    const kanji_input = document.getElementById("kanji") as HTMLInputElement;

    const text: string = kanji_input.value;

    number_plate.set_kanji(text);
}

function change_large_number() {
    const large_number_list: string[] = [];

    for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
        const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
        large_number_list.push(input.value);
    }

    number_plate.set_large_number(large_number_list);
}

function change_small_number() {
    const small_number_list: string[] = [];

    for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
        const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
        small_number_list.push(input.value);
    }

    number_plate.set_small_number(small_number_list);
}

function change_car_type() {
    const car_type_input = document.getElementById("normal-car") as HTMLInputElement;

    if (car_type_input.checked) {
        number_plate.set_car_type(NumberPlate.NORMAL_CAR);
    }
    else {
        number_plate.set_car_type(NumberPlate.KEI_CAR);
    }
}


function change_is_company() {
    const car_type_input = document.getElementById("home-use") as HTMLInputElement;

    if (car_type_input.checked) {
        number_plate.set_is_company(false);
    }
    else {
        number_plate.set_is_company(true);
    }
}

// pdfへプリント
function save_pdf(){
    const base64 = number_plate.ToDataURL();

    // 各種寸法作成
    // const scale = _scale;
    const scale = 1 / 18;
    const pdf_width = Setting.mm2pt(Setting.PLATE_WIDTH_MM * scale);

    const plate_margin = Setting.mm2pt(10);
    const page_margin = Setting.mm2pt(20);

    // pdf設定
    const docDefinition = {
        pageSize: "A4" as any,
        pageMargins: page_margin,
        content: [
            {
                columns: [
                    {
                        image: base64,
                        width: pdf_width,
                    },
                    {
                        text: "",
                        width: plate_margin
                    },
                    {
                        image: base64,
                        width: pdf_width
                    },
                    {
                        text: "",
                        width: plate_margin
                    },
                    {
                        image: base64,
                        width: pdf_width,
                    },
                    {
                        text: "",
                        width: plate_margin
                    },
                    {
                        image: base64,
                        width: pdf_width,
                    }
                ]
            }
        ]
    };

    pdfMake.createPdf(docDefinition).open();
}